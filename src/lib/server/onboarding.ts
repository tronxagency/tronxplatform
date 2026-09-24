import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import type { Sql } from "@/lib/db";
import { hasPerm, isExecOffice } from "@/lib/permissions";
import type {
  OnboardingDetail,
  OnboardingStatus,
  OnboardingStep,
  OnboardingSummary,
  Role,
} from "@/lib/types";
import { addDays, dayKey, nid, toIso } from "@/lib/utils";
import { FOUNDER } from "./owner";
import { ensureActor, notify, writeActivity, writeAudit } from "./actor";
import { asNum, asString } from "./map";

type StepDef = {
  key: string;
  title: string;
  description: string;
  category: OnboardingStep["category"];
  ownerKind: OnboardingStep["ownerKind"];
  dueOffsetDays: number;
  href?: string;
};

const FOUNDER_STEPS: StepDef[] = [
  {
    key: "workspace_login",
    title: "Claim workspace access",
    description: "Accept the invitation and sign in with the enrolled email.",
    category: "setup",
    ownerKind: "self",
    dueOffsetDays: 0,
    href: "/settings",
  },
  {
    key: "identity",
    title: "Confirm identity and title",
    description: "Name, title, phone and reporting line match the leadership record.",
    category: "setup",
    ownerKind: "desk",
    dueOffsetDays: 0,
    href: "/employees",
  },
  {
    key: "ea_intro",
    title: "Introduce the executive assistant",
    description: "The EA is assigned as office partner and a welcome note is sent.",
    category: "people",
    ownerKind: "desk",
    dueOffsetDays: 1,
  },
  {
    key: "kickoff",
    title: "Kickoff with Founder & CEO",
    description: "Sit with Vides for a 45-minute office briefing.",
    category: "people",
    ownerKind: "desk",
    dueOffsetDays: 1,
    href: "/meetings",
  },
  {
    key: "access_os",
    title: "Open the operating system",
    description: "Company chat, meetings, calendar and the command palette.",
    category: "access",
    ownerKind: "self",
    dueOffsetDays: 1,
    href: "/chat",
  },
  {
    key: "org_tour",
    title: "Tour departments and flagship work",
    description: "Walk the org chart and Hospital, Restaurant and Estate projects.",
    category: "access",
    ownerKind: "desk",
    dueOffsetDays: 3,
    href: "/projects",
  },
  {
    key: "authority",
    title: "Authority briefing",
    description: "What they can enroll, approve, announce and see.",
    category: "access",
    ownerKind: "desk",
    dueOffsetDays: 3,
    href: "/admin",
  },
  {
    key: "heads",
    title: "Meet department heads",
    description: "Short 1:1s with Engineering, Product, Design, Ops and Finance.",
    category: "people",
    ownerKind: "desk",
    dueOffsetDays: 7,
  },
  {
    key: "announce",
    title: "Internal announcement",
    description: "Company note that the director has joined.",
    category: "people",
    ownerKind: "desk",
    dueOffsetDays: 2,
    href: "/admin",
  },
  {
    key: "priorities",
    title: "First-week priorities signed off",
    description: "Three outcomes for week one, written on the desk.",
    category: "rhythm",
    ownerKind: "both",
    dueOffsetDays: 5,
  },
  {
    key: "goals_30",
    title: "30-day goals recorded",
    description: "What done looks like at day 30.",
    category: "rhythm",
    ownerKind: "both",
    dueOffsetDays: 10,
  },
  {
    key: "close",
    title: "Close the first two weeks",
    description: "EA and CEO confirm the desk is running without a checklist.",
    category: "rhythm",
    ownerKind: "desk",
    dueOffsetDays: 14,
  },
];

const EA_STEPS: StepDef[] = [
  {
    key: "workspace_login",
    title: "Claim workspace access",
    description: "Accept the invitation and sign in with the enrolled email.",
    category: "setup",
    ownerKind: "self",
    dueOffsetDays: 0,
    href: "/settings",
  },
  {
    key: "hours",
    title: "Office hours and contact",
    description: "Confirm hours, phone and how the CEO reaches the desk.",
    category: "setup",
    ownerKind: "desk",
    dueOffsetDays: 0,
  },
  {
    key: "kickoff",
    title: "Kickoff with Founder & CEO",
    description: "Working session on calendar, meetings and follow-through.",
    category: "people",
    ownerKind: "desk",
    dueOffsetDays: 1,
    href: "/meetings",
  },
  {
    key: "calendar",
    title: "Calendar and meeting protocol",
    description: "How to start a Meet, paste the URL, and run selected vs company scope.",
    category: "access",
    ownerKind: "self",
    dueOffsetDays: 2,
    href: "/meetings",
  },
  {
    key: "directory",
    title: "People directory walkthrough",
    description: "Who is who, who reports to whom, and how enrollment works.",
    category: "access",
    ownerKind: "desk",
    dueOffsetDays: 2,
    href: "/employees",
  },
  {
    key: "enroll_practice",
    title: "Enrollment flow",
    description: "Invite an employee and copy the invitation link.",
    category: "access",
    ownerKind: "self",
    dueOffsetDays: 3,
    href: "/employees",
  },
  {
    key: "comms",
    title: "Communications runbook",
    description: "Announcements, DMs, and how follow-through is tracked.",
    category: "rhythm",
    ownerKind: "desk",
    dueOffsetDays: 5,
    href: "/inbox",
  },
  {
    key: "visitors",
    title: "Visitor and guest handling",
    description: "External guests, selected meetings, and Meet links.",
    category: "rhythm",
    ownerKind: "desk",
    dueOffsetDays: 7,
  },
  {
    key: "priorities",
    title: "First-week operating rhythm",
    description: "Daily brief for the CEO, meeting prep, and close-of-day notes.",
    category: "rhythm",
    ownerKind: "both",
    dueOffsetDays: 5,
  },
  {
    key: "goals_30",
    title: "30-day desk goals",
    description: "What a running executive office looks like at day 30.",
    category: "rhythm",
    ownerKind: "both",
    dueOffsetDays: 10,
  },
  {
    key: "close",
    title: "Close onboarding",
    description: "CEO signs off that the desk is live.",
    category: "rhythm",
    ownerKind: "desk",
    dueOffsetDays: 14,
  },
];

function templateFor(role: Role): StepDef[] | null {
  if (role === "founder") return FOUNDER_STEPS;
  if (role === "executive_assistant") return EA_STEPS;
  return null;
}

function asOnboardingStatus(v: unknown): OnboardingStatus {
  const s = asString(v, "open");
  if (s === "completed" || s === "cancelled") return s;
  return "open";
}

function asCategory(v: unknown): OnboardingStep["category"] {
  const s = asString(v, "setup");
  if (s === "access" || s === "people" || s === "rhythm") return s;
  return "setup";
}

function asOwnerKind(v: unknown): OnboardingStep["ownerKind"] {
  const s = asString(v, "desk");
  if (s === "self" || s === "both") return s;
  return "desk";
}

function mapStep(r: Record<string, unknown>): OnboardingStep {
  return {
    id: asString(r.id),
    onboardingId: asString(r.onboarding_id),
    key: asString(r.key),
    title: asString(r.title),
    description: asString(r.description),
    category: asCategory(r.category),
    ownerKind: asOwnerKind(r.owner_kind),
    dueOffsetDays: asNum(r.due_offset_days),
    position: asNum(r.position),
    done: Boolean(r.done),
    doneAt: r.done_at ? toIso(r.done_at) : null,
    doneBy: r.done_by ? asString(r.done_by) : null,
    href: r.href ? asString(r.href) : null,
  };
}

function mapSummary(r: Record<string, unknown>): OnboardingSummary {
  const total = asNum(r.step_total);
  const done = asNum(r.step_done);
  return {
    id: asString(r.id),
    profileId: asString(r.profile_id),
    displayName: asString(r.display_name),
    title: asString(r.title),
    role: (asString(r.person_role, "employee") as Role) || "employee",
    avatarKey: asString(r.avatar_key, "zinc"),
    status: asOnboardingStatus(r.status),
    ownerId: r.owner_id ? asString(r.owner_id) : null,
    ownerName: r.owner_name ? asString(r.owner_name) : null,
    startedAt: toIso(r.started_at),
    dueAt: r.due_at ? String(r.due_at).slice(0, 10) : null,
    completedAt: r.completed_at ? toIso(r.completed_at) : null,
    kickoffMeetingId: r.kickoff_meeting_id ? asString(r.kickoff_meeting_id) : null,
    stepTotal: total,
    stepDone: done,
    progress: total > 0 ? Math.round((done / total) * 100) : 0,
  };
}

const SUMMARY_SELECT = `
  o.*,
  p.display_name,
  p.title,
  coalesce(o.role, p.role) as person_role,
  p.avatar_key,
  owner.display_name as owner_name,
  (select count(*)::int from onboarding_steps s where s.onboarding_id = o.id) as step_total,
  (select count(*)::int from onboarding_steps s where s.onboarding_id = o.id and s.done = true) as step_done
`;

async function loadSummary(sql: Sql, orgId: string, id: string): Promise<OnboardingSummary | null> {
  const rows = await sql.query(
    `select ${SUMMARY_SELECT}
     from executive_onboardings o
     join profiles p on p.id = o.profile_id
     left join profiles owner on owner.id = o.owner_id
     where o.id = $1 and o.org_id = $2`,
    [id, orgId],
  );
  return rows[0] ? mapSummary(rows[0]) : null;
}

function canSee(meId: string, meRole: Role, row: { profileId: string; ownerId: string | null }) {
  if (isExecOffice(meRole)) return true;
  return row.profileId === meId || row.ownerId === meId;
}

function canToggleStep(meId: string, meRole: Role, row: { profileId: string; ownerId: string | null }, kind: OnboardingStep["ownerKind"]) {
  if (hasPerm(meRole, "onboarding.manage")) return true;
  if (row.ownerId === meId) return true;
  if (row.profileId === meId && (kind === "self" || kind === "both")) return true;
  return false;
}

async function resolveOwner(sql: Sql, orgId: string, role: Role, actorId: string): Promise<string> {
  if (role === "executive_assistant") {
    const ceo = await sql`select id from profiles where org_id = ${orgId} and role = ${"ceo"} order by created_at limit 1`;
    return ceo[0] ? String(ceo[0].id) : actorId;
  }
  const ea = await sql`select id from profiles where org_id = ${orgId} and role = ${"executive_assistant"} and status != ${"disabled"} order by created_at limit 1`;
  if (ea[0]) return String(ea[0].id);
  const ceo = await sql`select id from profiles where org_id = ${orgId} and role = ${"ceo"} order by created_at limit 1`;
  return ceo[0] ? String(ceo[0].id) : actorId;
}

async function createKickoff(
  sql: Sql,
  orgId: string,
  actorId: string,
  hireId: string,
  ownerId: string,
  name: string,
): Promise<string | null> {
  try {
    const id = nid("mtg");
    const starts = new Date();
    starts.setDate(starts.getDate() + 1);
    starts.setHours(10, 0, 0, 0);
    const ends = new Date(starts.getTime() + 45 * 60_000);
    const title = `Executive onboarding — ${name}`;
    await sql`insert into meetings (
      id, org_id, title, description, organizer_id, scope, starts_at, ends_at, meet_provider, status
    ) values (
      ${id}, ${orgId}, ${title},
      ${"First-week briefing: identity, calendar, meetings, people and follow-through."},
      ${actorId}, ${"selected"}, ${starts.toISOString()}, ${ends.toISOString()}, ${"google_meet"}, ${"scheduled"}
    )`;
    const participants = new Set([actorId, hireId, ownerId]);
    const ceo = await sql`select id from profiles where org_id = ${orgId} and role = ${"ceo"} limit 1`;
    if (ceo[0]) participants.add(String(ceo[0].id));
    for (const pid of participants) {
      await sql`insert into meeting_participants (meeting_id, profile_id, role, rsvp)
        values (${id}, ${pid}, ${pid === actorId ? "organizer" : "attendee"}, ${pid === actorId ? "accepted" : "invited"})
        on conflict do nothing`;
      if (pid !== actorId) {
        await notify(sql, orgId, pid, "meeting", "Onboarding kickoff scheduled", title, `/meetings/${id}`);
      }
    }
    const evId = nid("evt");
    await sql`insert into calendar_events (id, org_id, title, starts_at, ends_at, type, meeting_id)
      values (${evId}, ${orgId}, ${title}, ${starts.toISOString()}, ${ends.toISOString()}, ${"meeting"}, ${id})`;
    return id;
  } catch {
    return null;
  }
}

export async function startExecutiveOnboardingInternal(
  sql: Sql,
  orgId: string,
  actorId: string,
  profileId: string,
): Promise<string | null> {
  const person = await sql`select * from profiles where id = ${profileId} and org_id = ${orgId}`;
  if (!person[0]) return null;
  const role = asString(person[0].role) as Role;
  const steps = templateFor(role);
  if (!steps) return null;
  const existing = await sql`select id from executive_onboardings where org_id = ${orgId} and profile_id = ${profileId} and status = ${"open"} limit 1`;
  if (existing[0]) return String(existing[0].id);

  const id = nid("onb");
  const ownerId = await resolveOwner(sql, orgId, role, actorId);
  const dueAt = dayKey(addDays(new Date(), 14));
  const name = asString(person[0].display_name);
  await sql`insert into executive_onboardings (
    id, org_id, profile_id, role, owner_id, status, due_at, created_by
  ) values (
    ${id}, ${orgId}, ${profileId}, ${role}, ${ownerId}, ${"open"}, ${dueAt}, ${actorId}
  )`;
  for (let i = 0; i < steps.length; i += 1) {
    const s = steps[i]!;
    await sql`insert into onboarding_steps (
      id, onboarding_id, key, title, description, category, owner_kind, due_offset_days, position, href
    ) values (
      ${nid("ost")}, ${id}, ${s.key}, ${s.title}, ${s.description}, ${s.category}, ${s.ownerKind},
      ${s.dueOffsetDays}, ${i}, ${s.href ?? null}
    )`;
  }

  const alreadyIn = asString(person[0].status) === "active" || Boolean(person[0].user_id);
  if (alreadyIn) {
    await sql`update onboarding_steps set done = true, done_at = now(), done_by = ${actorId}
      where onboarding_id = ${id} and key = ${"workspace_login"}`;
  }

  const meetingId = await createKickoff(sql, orgId, actorId, profileId, ownerId, name);
  if (meetingId) {
    await sql`update executive_onboardings set kickoff_meeting_id = ${meetingId} where id = ${id}`;
    await sql`update onboarding_steps set href = ${`/meetings/${meetingId}`} where onboarding_id = ${id} and key = ${"kickoff"}`;
  }

  await writeActivity(sql, orgId, actorId, "onboarding", id, "started", `Opened executive onboarding for ${name}`);
  await writeAudit(sql, orgId, actorId, "onboarding.started", "onboarding", id, `Started onboarding for ${name}`);
  await notify(
    sql,
    orgId,
    profileId,
    "onboarding",
    "Your first two weeks",
    "An executive onboarding checklist is waiting on the desk.",
    `/onboarding/${id}`,
  );
  if (ownerId !== profileId && ownerId !== actorId) {
    await notify(
      sql,
      orgId,
      ownerId,
      "onboarding",
      "Onboarding assigned to you",
      `${name} — first-week desk.`,
      `/onboarding/${id}`,
    );
  }
  return id;
}

const ensuredOrgs = new Set<string>();

export async function ensureOpenOnboardings(sql: Sql, orgId: string, actorId: string): Promise<void> {
  if (ensuredOrgs.has(orgId)) return;
  try {
    const people = await sql<{ id: string }>`
      select id from profiles
      where org_id = ${orgId}
        and role in (${"founder"}, ${"executive_assistant"})
        and status != ${"disabled"}
        and lower(coalesce(email,'')) != ${FOUNDER.email}
        and id != ${"seed_founder"}`;
    for (const p of people) {
      await startExecutiveOnboardingInternal(sql, orgId, actorId, p.id);
    }
    ensuredOrgs.add(orgId);
  } catch {
    /* table may not exist until the migration is applied */
  }
}

export async function markWorkspaceLogin(sql: Sql, orgId: string, profileId: string): Promise<void> {
  try {
    const rows = await sql`select id from executive_onboardings where org_id = ${orgId} and profile_id = ${profileId} and status = ${"open"}`;
    for (const r of rows) {
      await sql`update onboarding_steps set done = true, done_at = now()
        where onboarding_id = ${r.id as string} and key = ${"workspace_login"} and done = false`;
    }
  } catch {
    /* ignore */
  }
}

export async function countOpenOnboardings(sql: Sql, orgId: string, meId: string, meRole: Role): Promise<number> {
  try {
    if (isExecOffice(meRole)) {
      const rows = await sql<{ c: number }>`select count(*)::int as c from executive_onboardings where org_id = ${orgId} and status = ${"open"}`;
      return rows[0]?.c ?? 0;
    }
    const rows = await sql<{ c: number }>`
      select count(*)::int as c from executive_onboardings
      where org_id = ${orgId} and status = ${"open"} and (profile_id = ${meId} or owner_id = ${meId})`;
    return rows[0]?.c ?? 0;
  } catch {
    return 0;
  }
}

export async function listOpenOnboardingSummaries(sql: Sql, orgId: string, limit = 6): Promise<OnboardingSummary[]> {
  try {
    const rows = await sql.query(
      `select ${SUMMARY_SELECT}
       from executive_onboardings o
       join profiles p on p.id = o.profile_id
       left join profiles owner on owner.id = o.owner_id
       where o.org_id = $1 and o.status = 'open'
       order by o.due_at nulls last, o.started_at
       limit $2`,
      [orgId, limit],
    );
    return rows.map(mapSummary);
  } catch {
    return [];
  }
}

export const listOnboardings = createServerFn({ method: "GET" })
  .validator((data: { status?: OnboardingStatus | "all" } = {}) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<OnboardingSummary[]> => {
    const { sql, me, org } = await ensureActor(context.userId);
    await ensureOpenOnboardings(sql, org.id, me.id);
    const status = data.status ?? "open";
    const params: unknown[] = [org.id];
    const clauses = ["o.org_id = $1"];
    if (status !== "all") {
      params.push(status);
      clauses.push(`o.status = $${params.length}`);
    }
    if (!isExecOffice(me.role)) {
      params.push(me.id);
      clauses.push(`(o.profile_id = $${params.length} or o.owner_id = $${params.length})`);
    }
    const rows = await sql.query(
      `select ${SUMMARY_SELECT}
       from executive_onboardings o
       join profiles p on p.id = o.profile_id
       left join profiles owner on owner.id = o.owner_id
       where ${clauses.join(" and ")}
       order by case o.status when 'open' then 0 when 'completed' then 1 else 2 end, o.due_at nulls last, o.started_at desc`,
      params,
    );
    return rows.map(mapSummary);
  });

export const getOnboarding = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .middleware([authMiddleware])
  .handler(async ({ context, data: id }): Promise<OnboardingDetail | null> => {
    const { sql, me, org } = await ensureActor(context.userId);
    const summary = await loadSummary(sql, org.id, id);
    if (!summary) return null;
    if (!canSee(me.id, me.role, summary)) throw new Error("Forbidden");
    const stepRows = await sql`select * from onboarding_steps where onboarding_id = ${id} order by position`;
    const notes = await sql`select notes from executive_onboardings where id = ${id}`;
    return {
      ...summary,
      notes: asString(notes[0]?.notes),
      steps: stepRows.map(mapStep),
    };
  });

export const getProfileOnboarding = createServerFn({ method: "GET" })
  .validator((profileId: string) => profileId)
  .middleware([authMiddleware])
  .handler(async ({ context, data: profileId }): Promise<OnboardingDetail | null> => {
    const { sql, me, org } = await ensureActor(context.userId);
    const row = await sql`select id from executive_onboardings where org_id = ${org.id} and profile_id = ${profileId} order by started_at desc limit 1`;
    if (!row[0]) return null;
    const summary = await loadSummary(sql, org.id, String(row[0].id));
    if (!summary) return null;
    if (!canSee(me.id, me.role, summary)) return null;
    const stepRows = await sql`select * from onboarding_steps where onboarding_id = ${summary.id} order by position`;
    const notes = await sql`select notes from executive_onboardings where id = ${summary.id}`;
    return { ...summary, notes: asString(notes[0]?.notes), steps: stepRows.map(mapStep) };
  });

export const startOnboarding = createServerFn({ method: "POST" })
  .validator((profileId: string) => profileId)
  .middleware([authMiddleware])
  .handler(async ({ context, data: profileId }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    if (!hasPerm(me.role, "onboarding.manage")) throw new Error("Forbidden");
    const id = await startExecutiveOnboardingInternal(sql, org.id, me.id, profileId);
    if (!id) throw new Error("This role does not have an executive onboarding template");
    return { id };
  });

export const toggleOnboardingStep = createServerFn({ method: "POST" })
  .validator((data: { stepId: string; done: boolean }) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    const step = await sql`
      select s.*, o.org_id, o.profile_id, o.owner_id, o.status
      from onboarding_steps s
      join executive_onboardings o on o.id = s.onboarding_id
      where s.id = ${data.stepId}`;
    if (!step[0] || asString(step[0].org_id) !== org.id) throw new Error("Not found");
    const row = { profileId: asString(step[0].profile_id), ownerId: step[0].owner_id ? asString(step[0].owner_id) : null };
    if (!canToggleStep(me.id, me.role, row, asOwnerKind(step[0].owner_kind))) throw new Error("Forbidden");
    if (asOnboardingStatus(step[0].status) === "cancelled") throw new Error("This onboarding is cancelled");
    await sql`update onboarding_steps set
      done = ${data.done},
      done_at = ${data.done ? new Date().toISOString() : null},
      done_by = ${data.done ? me.id : null}
      where id = ${data.stepId}`;
    const boardId = asString(step[0].onboarding_id);
    const counts = await sql<{ total: number; done: number }>`
      select count(*)::int as total,
        coalesce(sum(case when done then 1 else 0 end), 0)::int as done
      from onboarding_steps where onboarding_id = ${boardId}`;
    const total = counts[0]?.total ?? 0;
    const done = counts[0]?.done ?? 0;
    if (total > 0 && done >= total) {
      await sql`update executive_onboardings set status = ${"completed"}, completed_at = now() where id = ${boardId} and status = ${"open"}`;
    } else if (asOnboardingStatus(step[0].status) === "completed" && !data.done) {
      await sql`update executive_onboardings set status = ${"open"}, completed_at = null where id = ${boardId}`;
    }
    return { ok: true };
  });

export const saveOnboarding = createServerFn({ method: "POST" })
  .validator((data: { id: string; notes?: string; ownerId?: string | null }) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    if (!hasPerm(me.role, "onboarding.manage")) throw new Error("Forbidden");
    const row = await sql`select id from executive_onboardings where id = ${data.id} and org_id = ${org.id}`;
    if (!row[0]) throw new Error("Not found");
    if (data.notes !== undefined) {
      await sql`update executive_onboardings set notes = ${data.notes} where id = ${data.id}`;
    }
    if (data.ownerId !== undefined) {
      await sql`update executive_onboardings set owner_id = ${data.ownerId} where id = ${data.id}`;
    }
    await writeAudit(sql, org.id, me.id, "onboarding.updated", "onboarding", data.id, "Updated executive onboarding");
    return { ok: true };
  });

export const completeOnboarding = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .middleware([authMiddleware])
  .handler(async ({ context, data: id }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    if (!hasPerm(me.role, "onboarding.manage")) throw new Error("Forbidden");
    const row = await sql`select profile_id from executive_onboardings where id = ${id} and org_id = ${org.id}`;
    if (!row[0]) throw new Error("Not found");
    await sql`update onboarding_steps set done = true, done_at = coalesce(done_at, now()), done_by = coalesce(done_by, ${me.id})
      where onboarding_id = ${id} and done = false`;
    await sql`update executive_onboardings set status = ${"completed"}, completed_at = now() where id = ${id}`;
    await writeActivity(sql, org.id, me.id, "onboarding", id, "completed", "Closed executive onboarding");
    await notify(sql, org.id, asString(row[0].profile_id), "onboarding", "Onboarding complete", "Your first two weeks are signed off.", `/onboarding/${id}`);
    return { ok: true };
  });

export const cancelOnboarding = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .middleware([authMiddleware])
  .handler(async ({ context, data: id }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    if (!hasPerm(me.role, "onboarding.manage")) throw new Error("Forbidden");
    const row = await sql`select id from executive_onboardings where id = ${id} and org_id = ${org.id}`;
    if (!row[0]) throw new Error("Not found");
    await sql`update executive_onboardings set status = ${"cancelled"} where id = ${id}`;
    await writeAudit(sql, org.id, me.id, "onboarding.cancelled", "onboarding", id, "Cancelled executive onboarding");
    return { ok: true };
  });
