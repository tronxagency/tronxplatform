import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { y as nid } from "./utils-B9mDzDE2.mjs";
import { t as authMiddleware } from "./middleware-Dvrw-DGo.mjs";
import { a as canModifyPerson, n as assignableRoles, o as hasPerm } from "./permissions-D6YDvOLx.mjs";
import { C as writeActivity, a as mapAttachment, b as notify, g as mapTask, h as mapProject, i as mapAnnouncement, l as mapDepartment, m as mapProfile, n as ensureActor, r as mapActivity, t as TASK_SELECT, v as mapTime, w as writeAudit, x as requireEnroll, y as nextEmployeeCode } from "./actor-DTONjTga.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/people-u3mmrOMS.js
var enrollEmployee_createServerFn_handler = createServerRpc({
	id: "e37c4335e4a9357aa4c8f59ebdca42ef5cd6dd0e6f363f6656e939f0c012cd48",
	name: "enrollEmployee",
	filename: "src/lib/server/people.ts"
}, (opts) => enrollEmployee.__executeServer(opts));
var enrollEmployee = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(enrollEmployee_createServerFn_handler, async ({ context, data }) => {
	const { sql, me, org } = await ensureActor(context.userId);
	requireEnroll(me.role);
	const name = data.name.trim();
	const email = data.email.trim().toLowerCase();
	if (!name || !email) throw new Error("Name and email are required");
	const role = data.role ?? "employee";
	if (!assignableRoles(me.role).includes(role)) throw new Error("You cannot assign that role");
	if ((await sql`select id from profiles where org_id = ${org.id} and (
      lower(coalesce(email,'')) = ${email} or lower(coalesce(work_email,'')) = ${email}
    )`)[0]) throw new Error("An employee with that email already exists");
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
	if (data.teamId) await sql`insert into team_members (team_id, profile_id) values (${data.teamId}, ${id}) on conflict do nothing`;
	const general = await sql`select id from channels where org_id = ${org.id} and name = ${"general"} limit 1`;
	if (general[0]) await sql`insert into channel_members (channel_id, profile_id) values (${general[0].id}, ${id}) on conflict do nothing`;
	if (data.departmentId) {
		const depCh = await sql`select id from channels where org_id = ${org.id} and department_id = ${data.departmentId} limit 1`;
		if (depCh[0]) await sql`insert into channel_members (channel_id, profile_id) values (${depCh[0].id}, ${id}) on conflict do nothing`;
	}
	if (data.teamId) {
		const teamCh = await sql`select id from channels where org_id = ${org.id} and team_id = ${data.teamId} limit 1`;
		if (teamCh[0]) await sql`insert into channel_members (channel_id, profile_id) values (${teamCh[0].id}, ${id}) on conflict do nothing`;
	}
	await writeAudit(sql, org.id, me.id, "employee.enrolled", "profile", id, `Enrolled ${name} as ${role}`);
	await writeActivity(sql, org.id, me.id, "employee", id, "enrolled", `Enrolled ${name}`);
	await notify(sql, org.id, id, "employee", "You're enrolled in TRONX", `Welcome ${name}. Your employee ID is ${code}. Sign in with ${email} to open your portal.`, "/");
	const leaders = await sql`select id from profiles where org_id = ${org.id} and role in ('ceo','founder','manager') and id != ${me.id}`;
	for (const l of leaders) await notify(sql, org.id, l.id, "employee", "New employee enrolled", `${name} joined as ${data.title || role}`, `/employees/${id}`);
	return {
		id,
		employeeCode: code
	};
});
var updateEmployee_createServerFn_handler = createServerRpc({
	id: "ddd8aa2223805cfa66b3ab970729655993aeff56eed1d0ad6f8f3a1b6b4f7dce",
	name: "updateEmployee",
	filename: "src/lib/server/people.ts"
}, (opts) => updateEmployee.__executeServer(opts));
var updateEmployee = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(updateEmployee_createServerFn_handler, async ({ context, data }) => {
	const { sql, me, org } = await ensureActor(context.userId);
	const current = await sql`select * from profiles where id = ${data.id} and org_id = ${org.id}`;
	if (!current[0]) throw new Error("Not found");
	const targetRole = String(current[0].role);
	if (data.id !== me.id) {
		if (!hasPerm(me.role, "employee.update")) throw new Error("Forbidden");
		requireModifyCheck(me.role, targetRole);
	}
	if (data.role && data.role !== targetRole) {
		if (targetRole === "ceo") throw new Error("The CEO cannot be reassigned");
		if (!assignableRoles(me.role).includes(data.role)) throw new Error("You cannot assign that role");
	}
	if (data.status === "disabled" && targetRole === "ceo") throw new Error("The CEO cannot be deactivated");
	const next = {
		name: data.name?.trim() || String(current[0].display_name),
		title: data.title ?? String(current[0].title),
		role: data.role ?? String(current[0].role),
		status: data.status ?? String(current[0].status),
		phone: data.phone ?? current[0].phone,
		gender: data.gender ?? current[0].gender,
		dob: data.dob === void 0 ? current[0].dob : data.dob || null,
		emergencyContact: data.emergencyContact ?? current[0].emergency_contact,
		employmentType: data.employmentType ?? current[0].employment_type,
		location: data.location ?? current[0].location,
		workEmail: data.workEmail ?? current[0].work_email,
		bio: data.bio ?? current[0].bio,
		skills: data.skills ?? current[0].skills,
		notes: hasPerm(me.role, "employee.update") ? data.notes ?? current[0].notes : current[0].notes,
		managerId: data.managerId === void 0 ? current[0].manager_id : data.managerId || null,
		teamLeadId: data.teamLeadId === void 0 ? current[0].team_lead_id : data.teamLeadId || null,
		departmentId: data.departmentId === void 0 ? current[0].department_id : data.departmentId || null,
		teamId: data.teamId === void 0 ? current[0].team_id : data.teamId || null,
		joiningDate: data.joiningDate === void 0 ? current[0].joining_date : data.joiningDate || null,
		avatarKey: data.avatarKey ?? current[0].avatar_key
	};
	await sql`update profiles set
      display_name = ${next.name}, title = ${next.title}, role = ${next.role}, status = ${next.status},
      phone = ${next.phone}, gender = ${next.gender}, dob = ${next.dob}, emergency_contact = ${next.emergencyContact},
      employment_type = ${next.employmentType}, location = ${next.location}, work_email = ${next.workEmail},
      bio = ${next.bio}, skills = ${next.skills}, notes = ${next.notes}, manager_id = ${next.managerId},
      team_lead_id = ${next.teamLeadId}, department_id = ${next.departmentId}, team_id = ${next.teamId},
      joining_date = ${next.joiningDate}, avatar_key = ${next.avatarKey}
      where id = ${data.id}`;
	if (data.teamId && data.teamId !== current[0].team_id) await sql`insert into team_members (team_id, profile_id) values (${data.teamId}, ${data.id}) on conflict do nothing`;
	await writeAudit(sql, org.id, me.id, "employee.updated", "profile", data.id, `Updated ${next.name}`);
	return { ok: true };
});
function requireModifyCheck(actor, target) {
	if (!canModifyPerson(actor, target)) throw new Error("You cannot change this person");
}
var getEmployee_createServerFn_handler = createServerRpc({
	id: "c46560c2f9c0611d56dcb57289fdc80f2e28388e420cfc2de0b3c59a7aa3e43f",
	name: "getEmployee",
	filename: "src/lib/server/people.ts"
}, (opts) => getEmployee.__executeServer(opts));
var getEmployee = createServerFn({ method: "GET" }).validator((id) => id).middleware([authMiddleware]).handler(getEmployee_createServerFn_handler, async ({ context, data: id }) => {
	const { sql, me, org } = await ensureActor(context.userId);
	const rows = await sql`select * from profiles where id = ${id} and org_id = ${org.id}`;
	if (!rows[0]) return null;
	const profile = mapProfile(rows[0]);
	if (!hasPerm(me.role, "employee.update") && me.id !== id) profile.notes = "";
	const tasks = (await sql.query(`select ${TASK_SELECT} from tasks t where t.org_id = $1 and t.parent_id is null and t.assignee_id = $2 order by t.updated_at desc`, [org.id, id])).map(mapTask);
	const projects = (await sql.query(`select p.*,
        (select count(*)::int from tasks t where t.project_id = p.id and t.parent_id is null) as task_total,
        (select count(*)::int from tasks t where t.project_id = p.id and t.parent_id is null and t.status = 'completed') as task_done
       from projects p
       join project_members pm on pm.project_id = p.id
       where pm.profile_id = $1 and p.org_id = $2`, [id, org.id])).map((r) => mapProject(r, []));
	const activity = (await sql`select * from activity_logs where org_id = ${org.id} and (actor_id = ${id} or entity_id = ${id}) order by created_at desc limit 20`).map(mapActivity);
	const files = (await sql`select * from attachments where org_id = ${org.id} and uploaded_by = ${id} order by created_at desc`).map(mapAttachment);
	const time = (await sql`select * from time_entries where profile_id = ${id} order by started_at desc limit 20`).map(mapTime);
	const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	return {
		profile,
		tasks,
		projects,
		activity,
		files,
		time,
		summary: {
			total: tasks.length,
			completed: tasks.filter((t) => t.status === "completed").length,
			pending: tasks.filter((t) => t.status !== "completed" && t.status !== "backlog").length,
			overdue: tasks.filter((t) => t.status !== "completed" && t.dueDate && t.dueDate < today).length,
			minutes: time.reduce((s, e) => s + e.minutes, 0)
		}
	};
});
var createDepartment_createServerFn_handler = createServerRpc({
	id: "cc78eda34cda3efbb4ec8ee35a47b5bf25192cb2daa17763b828f10cf70d88c8",
	name: "createDepartment",
	filename: "src/lib/server/people.ts"
}, (opts) => createDepartment.__executeServer(opts));
var createDepartment = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(createDepartment_createServerFn_handler, async ({ context, data }) => {
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
var createTeam_createServerFn_handler = createServerRpc({
	id: "be059087a561207d7009e3affdae4bf7ce55825a00827de7ebbea556aa0ad469",
	name: "createTeam",
	filename: "src/lib/server/people.ts"
}, (opts) => createTeam.__executeServer(opts));
var createTeam = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(createTeam_createServerFn_handler, async ({ context, data }) => {
	const { sql, me, org } = await ensureActor(context.userId);
	if (!hasPerm(me.role, "team.create")) throw new Error("Forbidden");
	const name = data.name.trim();
	if (!name) throw new Error("Name is required");
	const id = nid("team");
	await sql`insert into teams (id, org_id, name, description, lead_id, department_id)
      values (${id}, ${org.id}, ${name}, ${data.description ?? ""}, ${data.leadId || null}, ${data.departmentId || null})`;
	if (data.leadId) await sql`insert into team_members (team_id, profile_id) values (${id}, ${data.leadId}) on conflict do nothing`;
	await sql`insert into team_members (team_id, profile_id) values (${id}, ${me.id}) on conflict do nothing`;
	const ch = nid("ch");
	const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 32) || "team";
	await sql`insert into channels (id, org_id, type, name, team_id) values (${ch}, ${org.id}, ${"team"}, ${slug}, ${id})`;
	await sql`insert into channel_members (channel_id, profile_id) values (${ch}, ${me.id})`;
	await writeAudit(sql, org.id, me.id, "team.created", "team", id, `Created team ${name}`);
	return { id };
});
var addTeamMember_createServerFn_handler = createServerRpc({
	id: "e70944e9e8cfc7bfff2e58b45dbef092decc6f1ac6b3b1acca0f08e33069ddc3",
	name: "addTeamMember",
	filename: "src/lib/server/people.ts"
}, (opts) => addTeamMember.__executeServer(opts));
var addTeamMember = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(addTeamMember_createServerFn_handler, async ({ context, data }) => {
	const { sql, me, org } = await ensureActor(context.userId);
	if (!hasPerm(me.role, "team.manage")) throw new Error("Forbidden");
	if (!(await sql`select id from teams where id = ${data.teamId} and org_id = ${org.id}`)[0]) throw new Error("Not found");
	await sql`insert into team_members (team_id, profile_id) values (${data.teamId}, ${data.profileId}) on conflict do nothing`;
	await sql`update profiles set team_id = ${data.teamId} where id = ${data.profileId} and org_id = ${org.id}`;
	await writeAudit(sql, org.id, me.id, "team.member", "team", data.teamId, `Added member to team`);
	return { ok: true };
});
var addProjectMember_createServerFn_handler = createServerRpc({
	id: "815acc2a07a197e59ef5c40c0e8eb1d1910e34351c967092e6dae469e6c42c1b",
	name: "addProjectMember",
	filename: "src/lib/server/people.ts"
}, (opts) => addProjectMember.__executeServer(opts));
var addProjectMember = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(addProjectMember_createServerFn_handler, async ({ context, data }) => {
	const { sql, me, org } = await ensureActor(context.userId);
	if (!hasPerm(me.role, "project.update")) throw new Error("Forbidden");
	const project = await sql`select id, name from projects where id = ${data.projectId} and org_id = ${org.id}`;
	if (!project[0]) throw new Error("Not found");
	await sql`insert into project_members (project_id, profile_id) values (${data.projectId}, ${data.profileId}) on conflict do nothing`;
	const ch = await sql`select id from channels where project_id = ${data.projectId} limit 1`;
	if (ch[0]) await sql`insert into channel_members (channel_id, profile_id) values (${ch[0].id}, ${data.profileId}) on conflict do nothing`;
	await notify(sql, org.id, data.profileId, "project", "Added to a project", String(project[0].name), `/projects/${data.projectId}`);
	await writeAudit(sql, org.id, me.id, "project.member", "project", data.projectId, `Added a member to ${project[0].name}`);
	return { ok: true };
});
var createAnnouncement_createServerFn_handler = createServerRpc({
	id: "9becb063cbc890fc7c8593dd902390a4d4e0681a352064129fa518659c3d9d5b",
	name: "createAnnouncement",
	filename: "src/lib/server/people.ts"
}, (opts) => createAnnouncement.__executeServer(opts));
var createAnnouncement = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(createAnnouncement_createServerFn_handler, async ({ context, data }) => {
	const { sql, me, org } = await ensureActor(context.userId);
	if (!hasPerm(me.role, "announce.send")) throw new Error("Forbidden");
	const title = data.title.trim();
	if (!title) throw new Error("Title is required");
	const id = nid("ann");
	await sql`insert into announcements (id, org_id, author_id, title, body, scope)
      values (${id}, ${org.id}, ${me.id}, ${title}, ${data.body.trim()}, ${"company"})`;
	const people = await sql`select id from profiles where org_id = ${org.id} and status = ${"active"} and id != ${me.id}`;
	for (const p of people) await notify(sql, org.id, p.id, "announce", title, data.body.trim().slice(0, 140), "/");
	await writeAudit(sql, org.id, me.id, "announcement.sent", "announcement", id, title);
	return { id };
});
var updateOrgSettings_createServerFn_handler = createServerRpc({
	id: "87bafe2938a189cee4300e5a52b365cc9a2b5daf8d1a76b83e6464033714ff4b",
	name: "updateOrgSettings",
	filename: "src/lib/server/people.ts"
}, (opts) => updateOrgSettings.__executeServer(opts));
var updateOrgSettings = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(updateOrgSettings_createServerFn_handler, async ({ context, data }) => {
	const { sql, me, org } = await ensureActor(context.userId);
	if (!hasPerm(me.role, "admin.settings")) throw new Error("Forbidden");
	if (data.name?.trim()) await sql`update organizations set name = ${data.name.trim()} where id = ${org.id}`;
	await writeAudit(sql, org.id, me.id, "org.updated", "organization", org.id, "Updated organization settings");
	return { ok: true };
});
var listDepartments_createServerFn_handler = createServerRpc({
	id: "5ee461b4a0c456c03572865f4686b96998f61e7d7215b3905cf80801ddc7e851",
	name: "listDepartments",
	filename: "src/lib/server/people.ts"
}, (opts) => listDepartments.__executeServer(opts));
var listDepartments = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listDepartments_createServerFn_handler, async ({ context }) => {
	const { sql, org } = await ensureActor(context.userId);
	return (await sql`select * from departments where org_id = ${org.id} order by name`).map(mapDepartment);
});
var listAnnouncements_createServerFn_handler = createServerRpc({
	id: "5e72e0cabfada41a517ce8ac95fa1d791e779ac4c0228dd6be1aebf91ba9e98d",
	name: "listAnnouncements",
	filename: "src/lib/server/people.ts"
}, (opts) => listAnnouncements.__executeServer(opts));
var listAnnouncements = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listAnnouncements_createServerFn_handler, async ({ context }) => {
	const { sql, org } = await ensureActor(context.userId);
	return (await sql`select * from announcements where org_id = ${org.id} order by created_at desc limit 12`).map(mapAnnouncement);
});
//#endregion
export { addProjectMember_createServerFn_handler, addTeamMember_createServerFn_handler, createAnnouncement_createServerFn_handler, createDepartment_createServerFn_handler, createTeam_createServerFn_handler, enrollEmployee_createServerFn_handler, getEmployee_createServerFn_handler, listAnnouncements_createServerFn_handler, listDepartments_createServerFn_handler, updateEmployee_createServerFn_handler, updateOrgSettings_createServerFn_handler };
