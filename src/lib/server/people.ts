import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql, type Sql } from "@/lib/db";
import {
  assignableRoles,
  canModifyPerson,
  hasPerm,
} from "@/lib/permissions";
import type { ProjectMemberRole, Role } from "@/lib/types";
import { nid } from "@/lib/utils";
import {
  ensureActor,
  nextEmployeeCode,
  notify,
  requireEnroll,
  writeActivity,
  writeAudit,
} from "./actor";
import {
  mapActivity,
  mapAnnouncement,
  mapAttachment,
  mapDepartment,
  mapProfile,
  mapProject,
  mapTask,
  mapTime,
  TASK_SELECT,
} from "./map";
import { markWorkspaceLogin, startExecutiveOnboardingInternal } from "./onboarding";

export type EnrollInput = {
  name: string;
  email: string;
  title?: string;
  role?: string;
  departmentId?: string;
  teamId?: string;
  managerId?: string;
  teamLeadId?: string;
  phone?: string;
  gender?: string;
  dob?: string;
  emergencyContact?: string;
  employmentType?: string;
  location?: string;
  workEmail?: string;
  joiningDate?: string;
  skills?: string;
  bio?: string;
  notes?: string;
  avatarKey?: string;
};

export const enrollEmployee = createServerFn({ method: "POST" })
  .validator((data: EnrollInput) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    requireEnroll(me.role);
    const name = data.name.trim();
    const email = data.email.trim().toLowerCase();
    if (!name || !email) throw new Error("Name and email are required");
    const role = (data.role ?? "employee") as Role;
    if (!assignableRoles(me.role).includes(role)) {
      throw new Error("You cannot assign that role");
    }
    const exists = await sql`select id from profiles where org_id = ${org.id} and (
      lower(coalesce(email,'')) = ${email} or lower(coalesce(work_email,'')) = ${email}
    )`;
    if (exists[0]) throw new Error("An employee with that email already exists");
    const id = nid("prf");
    const code = await nextEmployeeCode(sql, org.id);
    const workEmail = (data.workEmail ?? email).trim().toLowerCase();
    await sql`insert into profiles (
      id, org_id, email, work_email, display_name, title, role, avatar_key, status,
      employee_code, phone, gender, dob, emergency_contact, employment_type, location,
      bio, skills, notes, manager_id, team_lead_id, department_id, team_id, joining_date,
      invited_by, username
    ) values (
      ${id}, ${org.id}, ${email}, ${workEmail}, ${name}, ${data.title?.trim() || "Employee"}, ${role},
      ${data.avatarKey ?? "zinc"}, ${"invited"}, ${code}, ${data.phone ?? null}, ${data.gender ?? null},
      ${data.dob || null}, ${data.emergencyContact ?? null}, ${data.employmentType ?? "full_time"},
      ${data.location ?? null}, ${data.bio ?? ""}, ${data.skills ?? ""}, ${data.notes ?? ""},
      ${data.managerId || null}, ${data.teamLeadId || null}, ${data.departmentId || null},
      ${data.teamId || null}, ${data.joiningDate || null}, ${me.id}, ${email.split("@")[0]}
    )`;
    if (data.teamId) {
      await sql`insert into team_members (team_id, profile_id) values (${data.teamId}, ${id}) on conflict do nothing`;
    }
    const general = await sql`select id from channels where org_id = ${org.id} and name = ${"general"} limit 1`;
    if (general[0]) {
      await sql`insert into channel_members (channel_id, profile_id) values (${general[0].id as string}, ${id}) on conflict do nothing`;
    }
    if (data.departmentId) {
      const depCh = await sql`select id from channels where org_id = ${org.id} and department_id = ${data.departmentId} limit 1`;
      if (depCh[0]) {
        await sql`insert into channel_members (channel_id, profile_id) values (${depCh[0].id as string}, ${id}) on conflict do nothing`;
      }
    }
    if (data.teamId) {
      const teamCh = await sql`select id from channels where org_id = ${org.id} and team_id = ${data.teamId} limit 1`;
      if (teamCh[0]) {
        await sql`insert into channel_members (channel_id, profile_id) values (${teamCh[0].id as string}, ${id}) on conflict do nothing`;
      }
    }
    await writeAudit(sql, org.id, me.id, "employee.enrolled", "profile", id, `Enrolled ${name} as ${role}`);
    await writeActivity(sql, org.id, me.id, "employee", id, "enrolled", `Enrolled ${name}`);
    const inviteId = nid("inv");
    const token = `${nid("tok")}${nid("k").slice(2)}`;
    const expires = new Date(Date.now() + 14 * 86400000).toISOString();
    await sql`insert into invitations (id, org_id, profile_id, email, token, invited_by, expires_at)
      values (${inviteId}, ${org.id}, ${id}, ${email}, ${token}, ${me.id}, ${expires})`;
    await notify(
      sql,
      org.id,
      id,
      "employee",
      "You're enrolled in TRONX",
      `Welcome ${name}. Your employee ID is ${code}. Open your invitation to create a password.`,
      `/invite/${token}`,
    );
    const leaders = await sql<{ id: string }>`select id from profiles where org_id = ${org.id} and role in ('ceo','founder','manager','executive_assistant') and id != ${me.id}`;
    for (const l of leaders) {
      await notify(sql, org.id, l.id, "employee", "New employee enrolled", `${name} joined as ${data.title || role}`, `/employees/${id}`);
    }
    let onboardingId: string | undefined;
    if (role === "founder" || role === "executive_assistant") {
      try {
        onboardingId = (await startExecutiveOnboardingInternal(sql, org.id, me.id, id)) ?? undefined;
      } catch {
        /* onboarding table may not be applied yet */
      }
    }
    return { id, employeeCode: code, inviteToken: token, onboardingId };
  });

export const updateEmployee = createServerFn({ method: "POST" })
  .validator((data: EnrollInput & { id: string; status?: string }) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    const current = await sql`select * from profiles where id = ${data.id} and org_id = ${org.id}`;
    if (!current[0]) throw new Error("Not found");
    const targetRole = String(current[0].role) as Role;
    if (data.id !== me.id) {
      if (!hasPerm(me.role, "employee.update")) throw new Error("Forbidden");
      requireModifyCheck(me.role, targetRole);
    }
    if (data.role && data.role !== targetRole) {
      if (targetRole === "ceo") throw new Error("The CEO cannot be reassigned");
      if (!assignableRoles(me.role).includes(data.role as Role)) throw new Error("You cannot assign that role");
    }
    if (data.status === "disabled" && targetRole === "ceo") throw new Error("The CEO cannot be deactivated");
    const next = {
      name: data.name?.trim() || String(current[0].display_name),
      title: data.title ?? String(current[0].title),
      role: data.role ?? String(current[0].role),
      status: data.status ?? String(current[0].status),
      phone: data.phone ?? current[0].phone,
      gender: data.gender ?? current[0].gender,
      dob: data.dob === undefined ? current[0].dob : data.dob || null,
      emergencyContact: data.emergencyContact ?? current[0].emergency_contact,
      employmentType: data.employmentType ?? current[0].employment_type,
      location: data.location ?? current[0].location,
      workEmail: data.workEmail ?? current[0].work_email,
      bio: data.bio ?? current[0].bio,
      skills: data.skills ?? current[0].skills,
      notes: hasPerm(me.role, "employee.update") ? (data.notes ?? current[0].notes) : current[0].notes,
      managerId: data.managerId === undefined ? current[0].manager_id : data.managerId || null,
      teamLeadId: data.teamLeadId === undefined ? current[0].team_lead_id : data.teamLeadId || null,
      departmentId: data.departmentId === undefined ? current[0].department_id : data.departmentId || null,
      teamId: data.teamId === undefined ? current[0].team_id : data.teamId || null,
      joiningDate: data.joiningDate === undefined ? current[0].joining_date : data.joiningDate || null,
      avatarKey: data.avatarKey ?? current[0].avatar_key,
    };
    await sql`update profiles set
      display_name = ${next.name}, title = ${next.title}, role = ${next.role}, status = ${next.status},
      phone = ${next.phone}, gender = ${next.gender}, dob = ${next.dob}, emergency_contact = ${next.emergencyContact},
      employment_type = ${next.employmentType}, location = ${next.location}, work_email = ${next.workEmail},
      bio = ${next.bio}, skills = ${next.skills}, notes = ${next.notes}, manager_id = ${next.managerId},
      team_lead_id = ${next.teamLeadId}, department_id = ${next.departmentId}, team_id = ${next.teamId},
      joining_date = ${next.joiningDate}, avatar_key = ${next.avatarKey}
      where id = ${data.id}`;
    if (data.teamId && data.teamId !== current[0].team_id) {
      await sql`insert into team_members (team_id, profile_id) values (${data.teamId}, ${data.id}) on conflict do nothing`;
    }
    await writeAudit(sql, org.id, me.id, "employee.updated", "profile", data.id, `Updated ${next.name}`);
    if (data.role && (data.role === "founder" || data.role === "executive_assistant") && data.role !== targetRole) {
      await startExecutiveOnboardingInternal(sql, org.id, me.id, data.id);
    }
    return { ok: true };
  });

function requireModifyCheck(actor: Role, target: Role) {
  if (!canModifyPerson(actor, target)) throw new Error("You cannot change this person");
}

export const getEmployee = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .middleware([authMiddleware])
  .handler(async ({ context, data: id }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    const rows = await sql`select * from profiles where id = ${id} and org_id = ${org.id}`;
    if (!rows[0]) return null;
    const profile = mapProfile(rows[0]);
    if (!hasPerm(me.role, "employee.update") && me.id !== id) {
      profile.notes = "";
    }
    const tasks = (await sql.query(`select ${TASK_SELECT} from tasks t where t.org_id = $1 and t.parent_id is null and t.assignee_id = $2 order by t.updated_at desc`, [org.id, id])).map(mapTask);
    const projectRows = await sql.query(
      `select p.*,
        (select count(*)::int from tasks t where t.project_id = p.id and t.parent_id is null) as task_total,
        (select count(*)::int from tasks t where t.project_id = p.id and t.parent_id is null and t.status = 'completed') as task_done
       from projects p
       join project_members pm on pm.project_id = p.id
       where pm.profile_id = $1 and p.org_id = $2`,
      [id, org.id],
    );
    const projects = projectRows.map((r) => mapProject(r, []));
    const activity = (await sql`select * from activity_logs where org_id = ${org.id} and (actor_id = ${id} or entity_id = ${id}) order by created_at desc limit 20`).map(mapActivity);
    const files = (await sql`select * from attachments where org_id = ${org.id} and uploaded_by = ${id} order by created_at desc`).map(mapAttachment);
    const time = (await sql`select * from time_entries where profile_id = ${id} order by started_at desc limit 20`).map(mapTime);
    const today = new Date().toISOString().slice(0, 10);
    const summary = {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === "completed").length,
      pending: tasks.filter((t) => t.status !== "completed" && t.status !== "backlog").length,
      overdue: tasks.filter((t) => t.status !== "completed" && t.dueDate && t.dueDate < today).length,
      minutes: time.reduce((s, e) => s + e.minutes, 0),
    };
    return { profile, tasks, projects, activity, files, time, summary };
  });

export const createDepartment = createServerFn({ method: "POST" })
  .validator((data: { name: string; description?: string; headId?: string }) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    if (!hasPerm(me.role, "department.create")) throw new Error("Forbidden");
    const name = data.name.trim();
    if (!name) throw new Error("Name is required");
    const id = nid("dep");
    await sql`insert into departments (id, org_id, name, description, head_id)
      values (${id}, ${org.id}, ${name}, ${data.description ?? ""}, ${data.headId || null})`;
    const ch = nid("ch");
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 32) || "dept";
    await sql`insert into channels (id, org_id, type, name, department_id) values (${ch}, ${org.id}, ${"department"}, ${slug}, ${id})`;
    await sql`insert into channel_members (channel_id, profile_id) values (${ch}, ${me.id})`;
    await writeAudit(sql, org.id, me.id, "department.created", "department", id, `Created department ${name}`);
    return { id };
  });

export const createTeam = createServerFn({ method: "POST" })
  .validator((data: { name: string; description?: string; departmentId?: string; leadId?: string }) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    if (!hasPerm(me.role, "team.create")) throw new Error("Forbidden");
    const name = data.name.trim();
    if (!name) throw new Error("Name is required");
    const id = nid("team");
    await sql`insert into teams (id, org_id, name, description, lead_id, department_id)
      values (${id}, ${org.id}, ${name}, ${data.description ?? ""}, ${data.leadId || null}, ${data.departmentId || null})`;
    if (data.leadId) {
      await sql`insert into team_members (team_id, profile_id) values (${id}, ${data.leadId}) on conflict do nothing`;
    }
    await sql`insert into team_members (team_id, profile_id) values (${id}, ${me.id}) on conflict do nothing`;
    const ch = nid("ch");
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 32) || "team";
    await sql`insert into channels (id, org_id, type, name, team_id) values (${ch}, ${org.id}, ${"team"}, ${slug}, ${id})`;
    await sql`insert into channel_members (channel_id, profile_id) values (${ch}, ${me.id})`;
    await writeAudit(sql, org.id, me.id, "team.created", "team", id, `Created team ${name}`);
    return { id };
  });

export const addTeamMember = createServerFn({ method: "POST" })
  .validator((data: { teamId: string; profileId: string }) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    if (!hasPerm(me.role, "team.manage")) throw new Error("Forbidden");
    const team = await sql`select id from teams where id = ${data.teamId} and org_id = ${org.id}`;
    if (!team[0]) throw new Error("Not found");
    await sql`insert into team_members (team_id, profile_id) values (${data.teamId}, ${data.profileId}) on conflict do nothing`;
    await sql`update profiles set team_id = ${data.teamId} where id = ${data.profileId} and org_id = ${org.id}`;
    await writeAudit(sql, org.id, me.id, "team.member", "team", data.teamId, `Added member to team`);
    return { ok: true };
  });

export const addProjectMember = createServerFn({ method: "POST" })
  .validator((data: { projectId: string; profileId: string; role?: ProjectMemberRole }) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    if (!hasPerm(me.role, "project.member.add") && !hasPerm(me.role, "project.update")) throw new Error("Forbidden");
    const project = await sql`select id, name from projects where id = ${data.projectId} and org_id = ${org.id}`;
    if (!project[0]) throw new Error("Not found");
    const role: ProjectMemberRole = data.role ?? "member";
    await sql`insert into project_members (project_id, profile_id, role) values (${data.projectId}, ${data.profileId}, ${role})
      on conflict (project_id, profile_id) do update set role = ${role}`;
    const ch = await sql`select id from channels where project_id = ${data.projectId} limit 1`;
    if (ch[0]) {
      await sql`insert into channel_members (channel_id, profile_id) values (${ch[0].id as string}, ${data.profileId}) on conflict do nothing`;
    }
    await notify(
      sql,
      org.id,
      data.profileId,
      "project",
      "Added to a project",
      String(project[0].name),
      `/projects/${data.projectId}`,
    );
    await writeAudit(sql, org.id, me.id, "project.member", "project", data.projectId, `Added a member to ${project[0].name}`);
    return { ok: true };
  });

export const updateProjectMemberRole = createServerFn({ method: "POST" })
  .validator((data: { projectId: string; profileId: string; role: ProjectMemberRole }) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    if (!hasPerm(me.role, "project.update")) throw new Error("Forbidden");
    const project = await sql`select id from projects where id = ${data.projectId} and org_id = ${org.id}`;
    if (!project[0]) throw new Error("Not found");
    await sql`update project_members set role = ${data.role} where project_id = ${data.projectId} and profile_id = ${data.profileId}`;
    await writeAudit(sql, org.id, me.id, "project.member.role", "project", data.projectId, `Set project role to ${data.role}`);
    return { ok: true };
  });

export const getInvitation = createServerFn({ method: "GET" })
  .validator((token: string) => token)
  .handler(async ({ data: token }) => {
    const sql = await getSql();
    const rows = await sql`
      select i.id, i.email, i.token, i.accepted_at, i.expires_at, i.profile_id,
        p.display_name, p.role, p.employee_code, p.status, o.name as org_name
      from invitations i
      join profiles p on p.id = i.profile_id
      join organizations o on o.id = i.org_id
      where i.token = ${token}
      limit 1`;
    if (!rows[0]) return null;
    const expiresAt = String(rows[0].expires_at);
    const expired = new Date(expiresAt).getTime() < Date.now();
    const role = String(rows[0].role);
    let onboardingId: string | null = null;
    try {
      const board = await sql`select id from executive_onboardings
        where profile_id = ${String(rows[0].profile_id)} and status = ${"open"} limit 1`;
      onboardingId = board[0] ? String(board[0].id) : null;
    } catch {
      /* migration pending */
    }
    return {
      email: String(rows[0].email),
      name: String(rows[0].display_name),
      role,
      employeeCode: rows[0].employee_code ? String(rows[0].employee_code) : null,
      orgName: String(rows[0].org_name),
      accepted: Boolean(rows[0].accepted_at),
      expired,
      status: String(rows[0].status),
      onboardingId,
      executive: role === "founder" || role === "executive_assistant",
    };
  });

export const acceptInvitation = createServerFn({ method: "POST" })
  .validator((token: string) => token)
  .middleware([authMiddleware])
  .handler(async ({ context, data: token }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    const rows = await sql`select * from invitations where token = ${token} and org_id = ${org.id}`;
    if (!rows[0]) throw new Error("Invitation not found");
    if (rows[0].accepted_at) {
      return { ok: true, onboardingId: await openOnboardingId(sql, String(rows[0].profile_id)) };
    }
    if (new Date(String(rows[0].expires_at)).getTime() < Date.now()) throw new Error("This invitation has expired");
    const email = String(rows[0].email).toLowerCase();
    const mine = (me.email ?? me.workEmail ?? "").toLowerCase();
    if (mine && mine !== email) throw new Error("Sign in with the invited email to accept this invitation");
    await sql`update invitations set accepted_at = now() where id = ${rows[0].id as string}`;
    await sql`update profiles set status = ${"active"}, user_id = ${me.userId ?? me.id} where id = ${rows[0].profile_id as string}`;
    const profileId = String(rows[0].profile_id);
    await markWorkspaceLogin(sql, org.id, profileId);
    return { ok: true, onboardingId: await openOnboardingId(sql, profileId) };
  });

async function openOnboardingId(sql: Sql, profileId: string) {
  try {
    const board = await sql`select id from executive_onboardings where profile_id = ${profileId} and status = ${"open"} limit 1`;
    return board[0] ? String(board[0].id) : null;
  } catch {
    return null;
  }
}

export const getEmployeeInvite = createServerFn({ method: "GET" })
  .validator((profileId: string) => profileId)
  .middleware([authMiddleware])
  .handler(async ({ context, data: profileId }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    if (!hasPerm(me.role, "employee.create")) throw new Error("Forbidden");
    const rows = await sql`
      select token, expires_at, accepted_at from invitations
      where org_id = ${org.id} and profile_id = ${profileId}
      order by created_at desc limit 1`;
    if (!rows[0]) return null;
    return {
      token: String(rows[0].token),
      expiresAt: String(rows[0].expires_at),
      accepted: Boolean(rows[0].accepted_at),
    };
  });

export const createAnnouncement = createServerFn({ method: "POST" })
  .validator((data: { title: string; body: string }) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    if (!hasPerm(me.role, "announce.send")) throw new Error("Forbidden");
    const title = data.title.trim();
    if (!title) throw new Error("Title is required");
    const id = nid("ann");
    await sql`insert into announcements (id, org_id, author_id, title, body, scope)
      values (${id}, ${org.id}, ${me.id}, ${title}, ${data.body.trim()}, ${"company"})`;
    const people = await sql<{ id: string }>`select id from profiles where org_id = ${org.id} and status = ${"active"} and id != ${me.id}`;
    for (const p of people) {
      await notify(sql, org.id, p.id, "announce", title, data.body.trim().slice(0, 140), "/");
    }
    await writeAudit(sql, org.id, me.id, "announcement.sent", "announcement", id, title);
    return { id };
  });

export const updateOrgSettings = createServerFn({ method: "POST" })
  .validator((data: { name?: string }) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    if (!hasPerm(me.role, "admin.settings")) throw new Error("Forbidden");
    if (data.name?.trim()) {
      await sql`update organizations set name = ${data.name.trim()} where id = ${org.id}`;
    }
    await writeAudit(sql, org.id, me.id, "org.updated", "organization", org.id, "Updated organization settings");
    return { ok: true };
  });

export const listDepartments = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql, org } = await ensureActor(context.userId);
    return (await sql`select * from departments where org_id = ${org.id} order by name`).map(mapDepartment);
  });

export const listAnnouncements = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql, org } = await ensureActor(context.userId);
    return (await sql`select * from announcements where org_id = ${org.id} order by created_at desc limit 12`).map(mapAnnouncement);
  });


