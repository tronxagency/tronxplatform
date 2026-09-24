import { getSql, type Sql } from "@/lib/db";
import { canEnroll, canManageWork, canModifyPerson } from "@/lib/permissions";
import type { Organization, Profile, Role } from "@/lib/types";
import { mapOrg, mapProfile } from "./map";
import { OWNER, FOUNDER, isOwnerEmail, isFounderEmail } from "./owner";
import { ensureAgencyFounder, ensureExecutiveAssistant, seedOrganization } from "./seed";

export type Actor = {
  sql: Sql;
  me: Profile;
  org: Organization;
};

async function authIdentity(sql: Sql, userId: string): Promise<{ name: string | null; email: string | null }> {
  try {
    const rows = await sql.query<{ name: string | null; email: string | null }>(
      `select name, email from "user" where id = $1 limit 1`,
      [userId],
    );
    return { name: rows[0]?.name ?? null, email: rows[0]?.email ?? null };
  } catch {
    return { name: null, email: null };
  }
}

async function stampOwner(sql: Sql, profileId: string, userId?: string | null) {
  await sql`update profiles set
    display_name = ${OWNER.name},
    email = ${OWNER.email},
    work_email = ${OWNER.email},
    phone = ${OWNER.phone},
    title = ${OWNER.title},
    username = ${OWNER.username},
    role = ${"ceo"},
    status = ${"active"},
    employee_code = coalesce(employee_code, ${OWNER.code}),
    location = coalesce(location, ${OWNER.location})
    where id = ${profileId}`;
  if (userId) {
    await sql`update profiles set user_id = null where user_id = ${userId} and id != ${profileId}`;
    await sql`update profiles set user_id = ${userId} where id = ${profileId}`;
  }
}

async function stampFounder(sql: Sql, profileId: string, userId?: string | null) {
  await sql`update profiles set
    display_name = ${FOUNDER.name},
    email = ${FOUNDER.email},
    work_email = ${FOUNDER.email},
    phone = coalesce(phone, ${FOUNDER.phone}),
    title = ${FOUNDER.title},
    username = ${FOUNDER.username},
    role = ${"founder"},
    status = ${"active"},
    employee_code = coalesce(employee_code, ${FOUNDER.code}),
    location = coalesce(location, ${FOUNDER.location})
    where id = ${profileId} and role != ${"ceo"}`;
  if (userId) {
    await sql`update profiles set user_id = null where user_id = ${userId} and id != ${profileId}`;
    await sql`update profiles set user_id = ${userId} where id = ${profileId}`;
  }
}

async function ownerCeoRow(sql: Sql, orgId: string) {
  const ceo = await sql`select * from profiles where org_id = ${orgId} and role = ${"ceo"} order by created_at limit 1`;
  if (ceo[0]) return ceo[0];
  const founder = await sql`select * from profiles where org_id = ${orgId} and role = ${"founder"} order by created_at limit 1`;
  return founder[0] ?? null;
}

const inflight = new Map<string, Promise<Actor>>();

export async function ensureActor(userId: string): Promise<Actor> {
  const hit = inflight.get(userId);
  if (hit) return hit;
  const run = ensureActorInner(userId).finally(() => inflight.delete(userId));
  inflight.set(userId, run);
  return run;
}

async function ensureActorInner(userId: string): Promise<Actor> {
  const sql = await getSql();
  const identity = await authIdentity(sql, userId);
  const ownerLogin = isOwnerEmail(identity.email);
  const founderLogin = isFounderEmail(identity.email);

  const existing = await sql`select * from profiles where user_id = ${userId} limit 1`;
  const orgs = await sql`select * from organizations limit 1`;

  if (orgs[0]) {
    const orgId = String(orgs[0].id);
    const ceo = await ownerCeoRow(sql, orgId);
    if (ceo) {
      await sql`update profiles set role = ${"manager"}
        where org_id = ${orgId} and role = ${"founder"} and id != ${String(ceo.id)}
          and lower(coalesce(email, '')) not in (${OWNER.email}, ${FOUNDER.email})
          and id != ${"seed_founder"}`;
      await sql`update profiles set title = ${"Director"}
        where org_id = ${orgId} and role = ${"manager"} and id != ${String(ceo.id)}
          and title in (${"Founder"}, ${"Founder / Director"}, ${"Founder & CEO"})
          and lower(coalesce(email, '')) != ${FOUNDER.email}`;
      if (ownerLogin || (existing[0] && String(existing[0].role) === "ceo")) {
        await stampOwner(sql, String(ceo.id), ownerLogin || String(existing[0]?.role) === "ceo" ? userId : undefined);
      }
      await ensureExecutiveAssistant(sql, orgId, String(ceo.id));
      await ensureAgencyFounder(sql, orgId, String(ceo.id));
    }
  }

  if (ownerLogin && orgs[0]) {
    const ceo = await ownerCeoRow(sql, String(orgs[0].id));
    if (ceo) {
      await stampOwner(sql, String(ceo.id), userId);
      await sql`update profiles set last_seen_at = now() where id = ${String(ceo.id)}`;
      const me = (await sql`select * from profiles where id = ${String(ceo.id)}`)[0]!;
      return { sql, me: mapProfile(me), org: mapOrg(orgs[0]) };
    }
  }

  if (founderLogin && orgs[0]) {
    const orgId = String(orgs[0].id);
    const ceo = await ownerCeoRow(sql, orgId);
    await ensureAgencyFounder(sql, orgId, ceo ? String(ceo.id) : userId);
    const founder = await sql`select * from profiles where org_id = ${orgId} and (
      lower(coalesce(email,'')) = ${FOUNDER.email} or id = ${"seed_founder"}
    ) limit 1`;
    if (founder[0] && String(founder[0].role) !== "ceo") {
      await stampFounder(sql, String(founder[0].id), userId);
      await sql`update profiles set last_seen_at = now() where id = ${String(founder[0].id)}`;
      const me = (await sql`select * from profiles where id = ${String(founder[0].id)}`)[0]!;
      return { sql, me: mapProfile(me), org: mapOrg(orgs[0]) };
    }
  }

  if (existing[0]) {
    const orgRows = await sql`select * from organizations where id = ${existing[0].org_id as string}`;
    const claimed = await sql<{ c: number }>`select count(*)::int as c from profiles where org_id = ${existing[0].org_id as string} and user_id is not null`;
    let row = existing[0];
    const title = String(row.title ?? "");
    const role = String(row.role ?? "");
    if (
      (claimed[0]?.c ?? 0) <= 1 &&
      (role === "founder" || role === "employee") &&
      (title === "Founder" || title === "Member") &&
      !isFounderEmail(String(row.email ?? ""))
    ) {
      await stampOwner(sql, String(row.id), userId);
      row = (await sql`select * from profiles where id = ${row.id as string}`)[0]!;
    }
    if (isFounderEmail(String(row.email ?? "")) && role !== "ceo") {
      await stampFounder(sql, String(row.id), userId);
      row = (await sql`select * from profiles where id = ${row.id as string}`)[0]!;
    }
    await sql`update profiles set last_seen_at = now() where id = ${row.id as string}`;
    const ceo = await ownerCeoRow(sql, String(orgRows[0]!.id));
    if (ceo) {
      await ensureExecutiveAssistant(sql, String(orgRows[0]!.id), String(ceo.id));
      await ensureAgencyFounder(sql, String(orgRows[0]!.id), String(ceo.id));
    }
    return { sql, me: mapProfile(row), org: mapOrg(orgRows[0]!) };
  }

  const email = identity.email ?? OWNER.email;

  if (!orgs[0]) {
    const orgId = "org_tronx";
    const profileId = userId;
    await sql`insert into organizations (id, name, slug) values (${orgId}, ${"TRONX"}, ${"tronx"})`;
    await sql`insert into profiles (
      id, org_id, user_id, email, work_email, display_name, title, role, avatar_key,
      employee_code, phone, employment_type, location, joining_date, last_seen_at, username, status
    ) values (
      ${profileId}, ${orgId}, ${userId}, ${OWNER.email}, ${OWNER.email}, ${OWNER.name}, ${OWNER.title}, ${"ceo"}, ${"mist"},
      ${OWNER.code}, ${OWNER.phone}, ${"full_time"}, ${OWNER.location}, now()::date, now(), ${OWNER.username}, ${"active"}
    )`;
    await seedOrganization(sql, orgId, profileId, OWNER.name);
    await ensureExecutiveAssistant(sql, orgId, profileId);
    await ensureAgencyFounder(sql, orgId, profileId);
    const org = (await sql`select * from organizations where id = ${orgId}`)[0]!;
    const me = (await sql`select * from profiles where id = ${profileId}`)[0]!;
    return { sql, me: mapProfile(me), org: mapOrg(org) };
  }

  const orgId = String(orgs[0].id);
  if (email) {
    const claim = await sql`select * from profiles where org_id = ${orgId} and user_id is null and (
      lower(coalesce(email, '')) = ${email.toLowerCase()}
      or lower(coalesce(work_email, '')) = ${email.toLowerCase()}
    ) limit 1`;
    if (claim[0]) {
      if (isFounderEmail(email) || String(claim[0].role) === "founder") {
        await stampFounder(sql, String(claim[0].id), userId);
      } else if (String(claim[0].role) === "ceo" || ownerLogin) {
        await stampOwner(sql, String(claim[0].id), userId);
      } else {
        await sql`update profiles set user_id = ${userId}, status = ${"active"}, last_seen_at = now() where id = ${claim[0].id as string}`;
      }
      const me = (await sql`select * from profiles where id = ${String(claim[0].id)}`)[0]!;
      return { sql, me: mapProfile(me), org: mapOrg(orgs[0]) };
    }
  }

  const claimed = await sql<{ c: number }>`select count(*)::int as c from profiles where org_id = ${orgId} and user_id is not null`;
  if ((claimed[0]?.c ?? 0) === 0) {
    const profileId = userId;
    const code = await nextEmployeeCode(sql, orgId);
    try {
      await sql`insert into profiles (
        id, org_id, user_id, email, work_email, display_name, title, role, avatar_key,
        employee_code, phone, last_seen_at, username, status, location, employment_type
      ) values (
        ${profileId}, ${orgId}, ${userId}, ${OWNER.email}, ${OWNER.email}, ${OWNER.name}, ${OWNER.title}, ${"ceo"}, ${"mist"},
        ${code}, ${OWNER.phone}, now(), ${OWNER.username}, ${"active"}, ${OWNER.location}, ${"full_time"}
      )`;
    } catch {
      const again = await sql`select * from profiles where user_id = ${userId} limit 1`;
      if (again[0]) return { sql, me: mapProfile(again[0]), org: mapOrg(orgs[0]) };
      throw new Error("Could not create profile");
    }
    await seedOrganization(sql, orgId, profileId, OWNER.name);
    await stampOwner(sql, profileId, userId);
    await ensureExecutiveAssistant(sql, orgId, profileId);
    await ensureAgencyFounder(sql, orgId, profileId);
    const me = (await sql`select * from profiles where id = ${profileId}`)[0]!;
    return { sql, me: mapProfile(me), org: mapOrg(orgs[0]) };
  }

  throw new Error("No invitation found for this account. Ask a CEO, director or manager to enroll you.");
}

export function isLead(role: Role): boolean {
  return canManageWork(role);
}

export function isFounder(role: Role): boolean {
  return role === "founder" || role === "ceo";
}

export function requireEnroll(role: Role) {
  if (!canEnroll(role)) throw new Error("Only the CEO, a director or a manager can enroll employees.");
}

export function requireModify(actor: Role, target: Role) {
  if (!canModifyPerson(actor, target)) throw new Error("You cannot change this person.");
}

export async function writeActivity(
  sql: Sql,
  orgId: string,
  actorId: string,
  entityType: string,
  entityId: string,
  action: string,
  summary: string,
) {
  const id = `act_${Date.now().toString(16)}${Math.random().toString(16).slice(2, 8)}`;
  await sql`insert into activity_logs (id, org_id, actor_id, entity_type, entity_id, action, summary)
    values (${id}, ${orgId}, ${actorId}, ${entityType}, ${entityId}, ${action}, ${summary})`;
}

export async function writeAudit(
  sql: Sql,
  orgId: string,
  actorId: string,
  action: string,
  targetType: string,
  targetId: string,
  summary: string,
) {
  const id = `aud_${Date.now().toString(16)}${Math.random().toString(16).slice(2, 8)}`;
  await sql`insert into audit_logs (id, org_id, actor_id, action, target_type, target_id, summary)
    values (${id}, ${orgId}, ${actorId}, ${action}, ${targetType}, ${targetId}, ${summary})`;
}

export async function notify(
  sql: Sql,
  orgId: string,
  profileId: string,
  type: string,
  title: string,
  body: string,
  href: string,
) {
  if (profileId === "") return;
  const id = `ntf_${Date.now().toString(16)}${Math.random().toString(16).slice(2, 8)}`;
  await sql`insert into notifications (id, org_id, profile_id, type, title, body, href)
    values (${id}, ${orgId}, ${profileId}, ${type}, ${title}, ${body}, ${href})`;
}

export async function nextEmployeeCode(sql: Sql, orgId: string): Promise<string> {
  const rows = await sql<{ employee_code: string | null }>`select employee_code from profiles where org_id = ${orgId}`;
  let max = 1000;
  for (const r of rows) {
    const match = String(r.employee_code ?? "").match(/^TX-(\d+)$/);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `TX-${max + 1}`;
}

export async function visibleProfileIds(sql: Sql, orgId: string, me: Profile): Promise<string[] | null> {
  if (me.role === "ceo" || me.role === "founder" || me.role === "executive_assistant") return null;
  if (me.role === "employee") return [me.id];
  const ids = new Set<string>([me.id]);
  if (me.role === "team_lead") {
    const teams = await sql<{ id: string }>`select id from teams where org_id = ${orgId} and lead_id = ${me.id}`;
    for (const t of teams) {
      const members = await sql<{ profile_id: string }>`select profile_id from team_members where team_id = ${t.id}`;
      for (const m of members) ids.add(m.profile_id);
    }
    const reports = await sql<{ id: string }>`select id from profiles where org_id = ${orgId} and team_lead_id = ${me.id}`;
    for (const r of reports) ids.add(r.id);
    return [...ids];
  }
  const reports = await sql<{ id: string }>`
    select id from profiles where org_id = ${orgId} and (
      manager_id = ${me.id}
      or department_id in (select id from departments where head_id = ${me.id})
    )`;
  for (const r of reports) ids.add(r.id);
  return [...ids];
}
