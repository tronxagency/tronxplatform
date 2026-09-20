import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { S as toIso, y as nid } from "./utils-B9mDzDE2.mjs";
import { t as authMiddleware } from "./middleware-Dvrw-DGo.mjs";
import { a as canModifyPerson, i as canManageWork, n as assignableRoles, o as hasPerm, t as allowedTaskStatuses } from "./permissions-D6YDvOLx.mjs";
import { a as createTeam, c as listAnnouncements, d as updateOrgSettings, i as createDepartment, l as listDepartments, n as addTeamMember, o as enrollEmployee, r as createAnnouncement, s as getEmployee, t as addProjectMember, u as updateEmployee } from "./people-CSPjn2TS.mjs";
import { C as writeActivity, S as visibleProfileIds, _ as mapTeam, a as mapAttachment, b as notify, c as mapComment, d as mapMessage, f as mapMilestone, g as mapTask, h as mapProject, i as mapAnnouncement, l as mapDepartment, m as mapProfile, n as ensureActor, o as mapChannel, p as mapNotification, r as mapActivity, s as mapChecklist, t as TASK_SELECT, u as mapEvent, v as mapTime, w as writeAudit, y as nextEmployeeCode } from "./actor-DTONjTga.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/fns-CjbglzB4.js
var getWorkspace_createServerFn_handler = createServerRpc({
	id: "dd7c9103efefcdca45961590d4cd86a00e5c05911955a315404e8f4343c8c896",
	name: "getWorkspace",
	filename: "src/lib/server/fns.ts"
}, (opts) => getWorkspace.__executeServer(opts));
var getWorkspace = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getWorkspace_createServerFn_handler, async ({ context }) => {
	const { sql, me, org } = await ensureActor(context.userId);
	const members = (await sql`select * from profiles where org_id = ${org.id} order by display_name`).map(mapProfile);
	const teamsRaw = await sql`select * from teams where org_id = ${org.id} order by name`;
	const tm = await sql`select team_id, profile_id from team_members tm join teams t on t.id = tm.team_id where t.org_id = ${org.id}`;
	const byTeam = /* @__PURE__ */ new Map();
	for (const row of tm) {
		const list = byTeam.get(row.team_id) ?? [];
		list.push(row.profile_id);
		byTeam.set(row.team_id, list);
	}
	const teams = teamsRaw.map((r) => mapTeam(r, byTeam.get(String(r.id)) ?? []));
	const departments = (await sql`select * from departments where org_id = ${org.id} order by name`).map(mapDepartment);
	const announcements = (await sql`select * from announcements where org_id = ${org.id} order by created_at desc limit 6`).map(mapAnnouncement);
	const unreadRows = await sql`select count(*)::int as c from notifications where profile_id = ${me.id} and read = false`;
	const running = await sql`select * from time_entries where profile_id = ${me.id} and ended_at is null order by started_at desc limit 1`;
	const loadRows = await sql`
      select assignee_id, count(*)::int as c from tasks
      where org_id = ${org.id} and parent_id is null and status not in ('completed','backlog') and assignee_id is not null
      group by assignee_id`;
	const openTasksByProfile = {};
	for (const r of loadRows) openTasksByProfile[r.assignee_id] = Number(r.c);
	return {
		org,
		me,
		members,
		teams,
		departments,
		announcements,
		unreadNotifications: unreadRows[0]?.c ?? 0,
		runningTimer: running[0] ? mapTime(running[0]) : null,
		openTasksByProfile
	};
});
var getDashboard_createServerFn_handler = createServerRpc({
	id: "acca3fbf74b302df3c984c5468c7a02595c98a0b51b88b96a1fe324ce9a245e4",
	name: "getDashboard",
	filename: "src/lib/server/fns.ts"
}, (opts) => getDashboard.__executeServer(opts));
var getDashboard = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getDashboard_createServerFn_handler, async ({ context }) => {
	const { sql, me, org } = await ensureActor(context.userId);
	const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	const weekAgo = (/* @__PURE__ */ new Date(Date.now() - 6048e5)).toISOString();
	const visible = await visibleProfileIds(sql, org.id, me);
	const activeProjects = await sql`select count(*)::int as c from projects where org_id = ${org.id} and status = ${"active"}`;
	const totalProjects = await sql`select count(*)::int as c from projects where org_id = ${org.id}`;
	const employees = await sql`select count(*)::int as c from profiles where org_id = ${org.id} and status in (${"active"}, ${"invited"})`;
	const activeEmployees = await sql`select count(*)::int as c from profiles where org_id = ${org.id} and status = ${"active"}`;
	const tasksWeek = await sql`select count(*)::int as c from tasks where org_id = ${org.id} and parent_id is null and created_at >= ${weekAgo}`;
	const completedWeek = await sql`select count(*)::int as c from tasks where org_id = ${org.id} and parent_id is null and status = ${"completed"} and updated_at >= ${weekAgo}`;
	const totalTasks = await sql`select count(*)::int as c from tasks where org_id = ${org.id} and parent_id is null`;
	const completedTasks = await sql`select count(*)::int as c from tasks where org_id = ${org.id} and parent_id is null and status = ${"completed"}`;
	const pendingTasks = await sql`select count(*)::int as c from tasks where org_id = ${org.id} and parent_id is null and status not in (${"completed"}, ${"backlog"})`;
	const scopeParams = [org.id, today];
	const assigneeSql = visible ? " and assignee_id = any($3::text[])" : "";
	if (visible) scopeParams.push(visible);
	const overdue = await sql.query(`select count(*)::int as c from tasks where org_id = $1 and parent_id is null and status not in ('completed','backlog') and due_date is not null and due_date < $2${assigneeSql}`, scopeParams);
	const blocked = await sql.query(`select count(*)::int as c from tasks where org_id = $1 and parent_id is null and (blocked = true or status = 'blocked')${visible ? " and assignee_id = any($2::text[])" : ""}`, visible ? [org.id, visible] : [org.id]);
	const dueToday = await sql.query(`select count(*)::int as c from tasks where org_id = $1 and parent_id is null and due_date = $2 and status != 'completed'${assigneeSql}`, scopeParams);
	const myActive = await sql`select count(*)::int as c from tasks where assignee_id = ${me.id} and parent_id is null and status not in (${"completed"}, ${"backlog"})`;
	const myCompleted = await sql`select count(*)::int as c from tasks where assignee_id = ${me.id} and parent_id is null and status = ${"completed"}`;
	const projects = await sql`
      select p.id, p.name, p.color_key,
        (select count(*)::int from tasks t where t.project_id = p.id and t.parent_id is null) as task_total,
        (select count(*)::int from tasks t where t.project_id = p.id and t.parent_id is null and t.status = 'completed') as task_done
      from projects p where p.org_id = ${org.id} order by p.name`;
	const todayTasks = (await sql.query(`select ${TASK_SELECT} from tasks t where t.org_id = $1 and t.parent_id is null and t.due_date = $2 and t.status != 'completed'${visible ? " and t.assignee_id = any($3::text[])" : ""} order by t.priority, t.title`, scopeParams)).map(mapTask);
	const overdueTasks = (await sql.query(`select ${TASK_SELECT} from tasks t where t.org_id = $1 and t.parent_id is null and t.status != 'completed' and t.due_date is not null and t.due_date < $2${visible ? " and t.assignee_id = any($3::text[])" : ""} order by t.due_date limit 8`, scopeParams)).map(mapTask);
	const recentActivity = (await sql`select * from activity_logs where org_id = ${org.id} order by created_at desc limit 10`).map(mapActivity);
	const workloadRows = await sql`
      select p.id as profile_id, p.display_name as name,
        (select count(*)::int from tasks t where t.assignee_id = p.id and t.parent_id is null and t.status not in ('completed','backlog')) as active,
        (select count(*)::int from tasks t where t.assignee_id = p.id and t.parent_id is null and t.status = 'completed') as completed,
        (select count(*)::int from tasks t where t.assignee_id = p.id and t.parent_id is null and t.status != 'completed' and t.due_date is not null and t.due_date < ${today}) as overdue
      from profiles p where p.org_id = ${org.id} and p.status = 'active' order by active desc, name`;
	const upcomingTasks = await sql`
      select id, title, due_date from tasks
      where org_id = ${org.id} and parent_id is null and due_date is not null and due_date >= ${today} and status != 'completed'
      order by due_date limit 6`;
	const upcomingMs = await sql`
      select m.id, m.title, m.due_date from milestones m
      join projects p on p.id = m.project_id
      where p.org_id = ${org.id} and m.status = 'open' and m.due_date is not null and m.due_date >= ${today}
      order by m.due_date limit 4`;
	return {
		stats: {
			totalEmployees: employees[0]?.c ?? 0,
			activeEmployees: activeEmployees[0]?.c ?? 0,
			totalProjects: totalProjects[0]?.c ?? 0,
			activeProjects: activeProjects[0]?.c ?? 0,
			totalTasks: totalTasks[0]?.c ?? 0,
			completedTasks: completedTasks[0]?.c ?? 0,
			pendingTasks: pendingTasks[0]?.c ?? 0,
			overdue: overdue[0]?.c ?? 0,
			blocked: blocked[0]?.c ?? 0,
			dueToday: dueToday[0]?.c ?? 0,
			myActive: myActive[0]?.c ?? 0,
			myCompleted: myCompleted[0]?.c ?? 0,
			tasksThisWeek: tasksWeek[0]?.c ?? 0,
			completedThisWeek: completedWeek[0]?.c ?? 0
		},
		projectProgress: projects.map((p) => {
			const total = Number(p.task_total ?? 0);
			const done = Number(p.task_done ?? 0);
			return {
				id: String(p.id),
				name: String(p.name),
				colorKey: String(p.color_key),
				progress: total > 0 ? Math.round(done / total * 100) : 0
			};
		}),
		todayTasks,
		overdueTasks,
		recentActivity,
		workload: workloadRows.filter((w) => !visible || visible.includes(w.profile_id)).map((w) => ({
			profileId: w.profile_id,
			name: w.name,
			active: Number(w.active),
			completed: Number(w.completed),
			overdue: Number(w.overdue)
		})),
		upcoming: [...upcomingTasks.map((t) => ({
			id: t.id,
			title: t.title,
			dueDate: String(t.due_date),
			type: "task"
		})), ...upcomingMs.map((t) => ({
			id: t.id,
			title: t.title,
			dueDate: String(t.due_date),
			type: "milestone"
		}))].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 8),
		announcements: (await sql`select * from announcements where org_id = ${org.id} order by created_at desc limit 4`).map(mapAnnouncement)
	};
});
var PROJECT_SELECT = `
  p.*,
  (select count(*)::int from tasks t where t.project_id = p.id and t.parent_id is null) as task_total,
  (select count(*)::int from tasks t where t.project_id = p.id and t.parent_id is null and t.status = 'completed') as task_done
`;
var listProjects_createServerFn_handler = createServerRpc({
	id: "03f47c37305e7402d7443ea543a23ccf3db3be53450bc0a678b724f91b85fd59",
	name: "listProjects",
	filename: "src/lib/server/fns.ts"
}, (opts) => listProjects.__executeServer(opts));
var listProjects = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listProjects_createServerFn_handler, async ({ context }) => {
	const { sql, me, org } = await ensureActor(context.userId);
	const rows = me.role === "employee" ? await sql.query(`select ${PROJECT_SELECT} from projects p where p.org_id = $1 and (
              p.owner_id = $2
              or exists (select 1 from project_members pm where pm.project_id = p.id and pm.profile_id = $2)
              or exists (select 1 from tasks t where t.project_id = p.id and t.assignee_id = $2)
            ) order by p.name`, [org.id, me.id]) : await sql.query(`select ${PROJECT_SELECT} from projects p where p.org_id = $1 order by p.name`, [org.id]);
	const members = await sql`
      select project_id, profile_id from project_members pm join projects p on p.id = pm.project_id where p.org_id = ${org.id}`;
	const map = /* @__PURE__ */ new Map();
	for (const m of members) {
		const list = map.get(m.project_id) ?? [];
		list.push(m.profile_id);
		map.set(m.project_id, list);
	}
	return rows.map((r) => mapProject(r, map.get(String(r.id)) ?? []));
});
var getProject_createServerFn_handler = createServerRpc({
	id: "ede5082090c9ee7ff5951d8bf3046e2185067268802e9e4af848e5aa082e61bd",
	name: "getProject",
	filename: "src/lib/server/fns.ts"
}, (opts) => getProject.__executeServer(opts));
var getProject = createServerFn({ method: "GET" }).validator((id) => id).middleware([authMiddleware]).handler(getProject_createServerFn_handler, async ({ context, data: id }) => {
	const { sql, org } = await ensureActor(context.userId);
	const rows = await sql.query(`select ${PROJECT_SELECT} from projects p where p.id = $1 and p.org_id = $2`, [id, org.id]);
	if (!rows[0]) return null;
	const memberRows = await sql`select profile_id from project_members where project_id = ${id}`;
	const project = mapProject(rows[0], memberRows.map((m) => m.profile_id));
	const tasks = (await sql.query(`select ${TASK_SELECT} from tasks t where t.project_id = $1 and t.parent_id is null order by t.created_at`, [id])).map(mapTask);
	const milestones = (await sql`select * from milestones where project_id = ${id} order by due_date nulls last`).map(mapMilestone);
	const files = (await sql`select * from attachments where project_id = ${id} order by created_at desc`).map(mapAttachment);
	const activity = (await sql`select * from activity_logs where org_id = ${org.id} and entity_id = ${id} order by created_at desc limit 20`).map(mapActivity);
	const channel = (await sql`select * from channels where project_id = ${id} limit 1`)[0];
	return {
		project,
		tasks,
		milestones,
		files,
		activity,
		channelId: channel ? String(channel.id) : null
	};
});
var createProject_createServerFn_handler = createServerRpc({
	id: "92f5bc1c13eaa6e0dcddd152687b4af115ce151b84b4c4b9e7902d23cdd534e7",
	name: "createProject",
	filename: "src/lib/server/fns.ts"
}, (opts) => createProject.__executeServer(opts));
var createProject = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(createProject_createServerFn_handler, async ({ context, data }) => {
	const { sql, me, org } = await ensureActor(context.userId);
	if (!hasPerm(me.role, "project.create")) throw new Error("You cannot create projects");
	const id = nid("prj");
	const name = data.name.trim();
	if (!name) throw new Error("Name is required");
	await sql`insert into projects (id, org_id, name, description, owner_id, team_id, priority, due_date)
      values (${id}, ${org.id}, ${name}, ${data.description ?? ""}, ${me.id}, ${data.teamId ?? null}, ${data.priority ?? "medium"}, ${data.dueDate ?? null})`;
	await sql`insert into project_members (project_id, profile_id) values (${id}, ${me.id})`;
	const chId = nid("ch");
	const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 32) || "project";
	await sql`insert into channels (id, org_id, type, name, project_id) values (${chId}, ${org.id}, ${"project"}, ${slug}, ${id})`;
	await sql`insert into channel_members (channel_id, profile_id) values (${chId}, ${me.id})`;
	if (data.teamId) {
		const teamPeople = await sql`select profile_id from team_members where team_id = ${data.teamId}`;
		for (const member of teamPeople) {
			await sql`insert into project_members (project_id, profile_id) values (${id}, ${member.profile_id}) on conflict do nothing`;
			await sql`insert into channel_members (channel_id, profile_id) values (${chId}, ${member.profile_id}) on conflict do nothing`;
			if (member.profile_id !== me.id) await notify(sql, org.id, member.profile_id, "project", "Added to a project", name, `/projects/${id}`);
		}
	}
	await writeActivity(sql, org.id, me.id, "project", id, "created", `Created ${name}`);
	await writeAudit(sql, org.id, me.id, "project.created", "project", id, `Created project ${name}`);
	return { id };
});
var updateProject_createServerFn_handler = createServerRpc({
	id: "b6eead53bf1a0a055d98c9170ab4d99f5b79eb1ee0f5dc5874b19cc0bd6d54ac",
	name: "updateProject",
	filename: "src/lib/server/fns.ts"
}, (opts) => updateProject.__executeServer(opts));
var updateProject = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(updateProject_createServerFn_handler, async ({ context, data }) => {
	const { sql, me, org } = await ensureActor(context.userId);
	if (!hasPerm(me.role, "project.update")) throw new Error("Forbidden");
	const rows = await sql`select * from projects where id = ${data.id} and org_id = ${org.id}`;
	if (!rows[0]) throw new Error("Not found");
	await sql`update projects set name = ${data.name ?? String(rows[0].name)}, description = ${data.description ?? String(rows[0].description)}, status = ${data.status ?? String(rows[0].status)}, priority = ${data.priority ?? String(rows[0].priority)}, due_date = ${data.dueDate === void 0 ? rows[0].due_date : data.dueDate} where id = ${data.id}`;
	return { ok: true };
});
var listTasks_createServerFn_handler = createServerRpc({
	id: "8e7a859a59a76980285b1e104f6340edaea5c57db7a5490cb6e1f5132cf3918f",
	name: "listTasks",
	filename: "src/lib/server/fns.ts"
}, (opts) => listTasks.__executeServer(opts));
var listTasks = createServerFn({ method: "GET" }).validator((data = {}) => data).middleware([authMiddleware]).handler(listTasks_createServerFn_handler, async ({ context, data }) => {
	const { sql, me, org } = await ensureActor(context.userId);
	const clauses = ["t.org_id = $1", "t.parent_id is null"];
	const params = [org.id];
	const visible = await visibleProfileIds(sql, org.id, me);
	if (data.assigneeId && visible && !visible.includes(data.assigneeId)) return [];
	if (data.projectId) {
		params.push(data.projectId);
		clauses.push(`t.project_id = $${params.length}`);
	}
	if (data.assigneeId) {
		params.push(data.assigneeId);
		clauses.push(`t.assignee_id = $${params.length}`);
	}
	if (data.mine) {
		params.push(me.id);
		clauses.push(`t.assignee_id = $${params.length}`);
	}
	if (!data.mine && !data.assigneeId && visible) {
		params.push(visible);
		clauses.push(`t.assignee_id = any($${params.length}::text[])`);
	}
	if (data.status) {
		params.push(data.status);
		clauses.push(`t.status = $${params.length}`);
	}
	if (data.q?.trim()) {
		params.push(`%${data.q.trim()}%`);
		clauses.push(`(t.title ilike $${params.length} or t.description ilike $${params.length})`);
	}
	return (await sql.query(`select ${TASK_SELECT} from tasks t where ${clauses.join(" and ")} order by case t.priority when 'urgent' then 0 when 'high' then 1 when 'medium' then 2 else 3 end, t.due_date nulls last, t.updated_at desc`, params)).map(mapTask);
});
var getTask_createServerFn_handler = createServerRpc({
	id: "ea6cdd1056347046daa283c29f8b50da0d404a25dcc5fa90891bc32d1192e585",
	name: "getTask",
	filename: "src/lib/server/fns.ts"
}, (opts) => getTask.__executeServer(opts));
var getTask = createServerFn({ method: "GET" }).validator((id) => id).middleware([authMiddleware]).handler(getTask_createServerFn_handler, async ({ context, data: id }) => {
	const { sql, org } = await ensureActor(context.userId);
	const rows = await sql.query(`select ${TASK_SELECT} from tasks t where t.id = $1 and t.org_id = $2`, [id, org.id]);
	if (!rows[0]) return null;
	return {
		task: mapTask(rows[0]),
		subtasks: (await sql.query(`select ${TASK_SELECT} from tasks t where t.parent_id = $1 order by t.created_at`, [id])).map(mapTask),
		checklist: (await sql`select * from checklist_items where task_id = ${id} order by position`).map(mapChecklist),
		comments: (await sql`select * from comments where task_id = ${id} order by created_at`).map(mapComment),
		files: (await sql`select * from attachments where task_id = ${id} order by created_at desc`).map(mapAttachment),
		dependencies: await sql`
      select d.depends_on_id, t.title from task_dependencies d join tasks t on t.id = d.depends_on_id where d.task_id = ${id}`,
		activity: (await sql`select * from activity_logs where org_id = ${org.id} and entity_id = ${id} order by created_at desc limit 20`).map(mapActivity)
	};
});
var createTask_createServerFn_handler = createServerRpc({
	id: "f3af199901d96be5c1f82a9ee992ac6868a8a95d9968e736bccc32b808b6b611",
	name: "createTask",
	filename: "src/lib/server/fns.ts"
}, (opts) => createTask.__executeServer(opts));
var createTask = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(createTask_createServerFn_handler, async ({ context, data }) => {
	const { sql, me, org } = await ensureActor(context.userId);
	const title = data.title.trim();
	if (!title) throw new Error("Title is required");
	if (!canManageWork(me.role) && !data.parentId) data.assigneeId = me.id;
	if (data.assigneeId && data.assigneeId !== me.id && !hasPerm(me.role, "task.assign")) throw new Error("You cannot assign tasks to others");
	if (!canManageWork(me.role)) {
		if (![
			"backlog",
			"todo",
			"in_progress"
		].includes(data.status ?? "todo")) data.status = "todo";
	}
	const id = nid("task");
	await sql`insert into tasks (id, org_id, project_id, parent_id, title, description, creator_id, assignee_id, status, priority, due_date, estimated_minutes, tags)
      values (${id}, ${org.id}, ${data.projectId ?? null}, ${data.parentId ?? null}, ${title}, ${data.description ?? ""}, ${me.id}, ${data.assigneeId ?? me.id}, ${data.status ?? "todo"}, ${data.priority ?? "medium"}, ${data.dueDate ?? null}, ${data.estimatedMinutes ?? 0}, ${data.tags ?? ""})`;
	await writeActivity(sql, org.id, me.id, "task", id, "created", `Created ${title}`);
	await writeAudit(sql, org.id, me.id, "task.created", "task", id, `Created task ${title}`);
	if (data.assigneeId && data.assigneeId !== me.id) await notify(sql, org.id, data.assigneeId, "task", "New task assigned", title, `/tasks/${id}`);
	return { id };
});
var updateTask_createServerFn_handler = createServerRpc({
	id: "314d564bc4432b74b06860e726bafd7c90c924fdec6cf0265831e52d85afe8d8",
	name: "updateTask",
	filename: "src/lib/server/fns.ts"
}, (opts) => updateTask.__executeServer(opts));
var updateTask = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(updateTask_createServerFn_handler, async ({ context, data }) => {
	const { sql, me, org } = await ensureActor(context.userId);
	const current = (await sql`select * from tasks where id = ${data.id} and org_id = ${org.id}`)[0];
	if (!current) throw new Error("Not found");
	if (!(canManageWork(me.role) || current.assignee_id === me.id || current.creator_id === me.id)) throw new Error("Forbidden");
	if (data.assigneeId && data.assigneeId !== current.assignee_id && !hasPerm(me.role, "task.assign")) throw new Error("You cannot reassign this task");
	if (data.status && data.status !== current.status) {
		const fromStatus = String(current.status);
		if (data.status === "completed" && !canManageWork(me.role)) throw new Error("Only a team lead or manager can approve work as completed");
		if (data.status === "changes_requested" && !canManageWork(me.role)) throw new Error("Only a team lead or manager can request changes");
		if (!canManageWork(me.role) && !allowedTaskStatuses(me.role, fromStatus).includes(data.status)) throw new Error("That status change is not allowed");
	}
	const next = {
		title: data.title ?? String(current.title),
		description: data.description ?? String(current.description),
		status: data.status ?? String(current.status),
		priority: data.priority ?? String(current.priority),
		assigneeId: data.assigneeId === void 0 ? current.assignee_id : data.assigneeId,
		dueDate: data.dueDate === void 0 ? current.due_date : data.dueDate,
		blocked: data.blocked ?? Boolean(current.blocked),
		blockedReason: data.blockedReason ?? String(current.blocked_reason ?? ""),
		tags: data.tags ?? String(current.tags ?? ""),
		estimatedMinutes: data.estimatedMinutes ?? Number(current.estimated_minutes ?? 0)
	};
	await sql`update tasks set title = ${next.title}, description = ${next.description}, status = ${next.status},
      priority = ${next.priority}, assignee_id = ${next.assigneeId}, due_date = ${next.dueDate},
      blocked = ${next.blocked}, blocked_reason = ${next.blockedReason}, tags = ${next.tags},
      estimated_minutes = ${next.estimatedMinutes}, updated_at = now() where id = ${data.id}`;
	if (data.status && data.status !== current.status) {
		await writeActivity(sql, org.id, me.id, "task", data.id, "status", `Moved ${next.title} to ${data.status.replaceAll("_", " ")}`);
		await writeAudit(sql, org.id, me.id, "task.status", "task", data.id, `Status ${current.status} → ${data.status}`);
		if (data.status === "in_review") {
			const assignee = current.assignee_id ? await sql`select manager_id, team_lead_id from profiles where id = ${current.assignee_id}` : [];
			const targets = /* @__PURE__ */ new Set();
			if (current.creator_id) targets.add(String(current.creator_id));
			if (assignee[0]?.manager_id) targets.add(String(assignee[0].manager_id));
			if (assignee[0]?.team_lead_id) targets.add(String(assignee[0].team_lead_id));
			for (const id of targets) if (id !== me.id) await notify(sql, org.id, id, "review", "Submitted for review", next.title, `/tasks/${data.id}`);
		}
		if (data.status === "completed" && next.assigneeId && next.assigneeId !== me.id) await notify(sql, org.id, next.assigneeId, "approved", "Task approved", next.title, `/tasks/${data.id}`);
		if (data.status === "changes_requested" && next.assigneeId && next.assigneeId !== me.id) await notify(sql, org.id, next.assigneeId, "changes", "Changes requested", next.title, `/tasks/${data.id}`);
	}
	if (data.assigneeId && data.assigneeId !== current.assignee_id) {
		await writeAudit(sql, org.id, me.id, "task.reassigned", "task", data.id, `Reassigned ${next.title}`);
		if (data.assigneeId) await notify(sql, org.id, data.assigneeId, "task", "Task assigned", next.title, `/tasks/${data.id}`);
	}
	return { ok: true };
});
var duplicateTask_createServerFn_handler = createServerRpc({
	id: "803e0bd7de18277d082fc1c212522d830dbff1209b059aed96f87b162f113b10",
	name: "duplicateTask",
	filename: "src/lib/server/fns.ts"
}, (opts) => duplicateTask.__executeServer(opts));
var duplicateTask = createServerFn({ method: "POST" }).validator((id) => id).middleware([authMiddleware]).handler(duplicateTask_createServerFn_handler, async ({ context, data: id }) => {
	const { sql, me, org } = await ensureActor(context.userId);
	if (!canManageWork(me.role)) throw new Error("Forbidden");
	const rows = await sql`select * from tasks where id = ${id} and org_id = ${org.id}`;
	if (!rows[0]) throw new Error("Not found");
	const t = rows[0];
	const newId = nid("task");
	await sql`insert into tasks (id, org_id, project_id, parent_id, title, description, creator_id, assignee_id, team_id, status, priority, start_date, due_date, estimated_minutes, tags)
      values (${newId}, ${org.id}, ${t.project_id}, ${t.parent_id}, ${`${String(t.title)} (copy)`}, ${t.description}, ${me.id}, ${t.assignee_id}, ${t.team_id}, ${"todo"}, ${t.priority}, ${t.start_date}, ${t.due_date}, ${t.estimated_minutes}, ${t.tags})`;
	return { id: newId };
});
var addComment_createServerFn_handler = createServerRpc({
	id: "a11a788abefa30eb7e55ed0a00920e47e65089b02f60093e1f76788212379dd1",
	name: "addComment",
	filename: "src/lib/server/fns.ts"
}, (opts) => addComment.__executeServer(opts));
var addComment = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(addComment_createServerFn_handler, async ({ context, data }) => {
	const { sql, me, org } = await ensureActor(context.userId);
	const body = data.body.trim();
	if (!body) throw new Error("Empty comment");
	const task = await sql`select id, assignee_id, title from tasks where id = ${data.taskId} and org_id = ${org.id}`;
	if (!task[0]) throw new Error("Not found");
	const id = nid("cmt");
	await sql`insert into comments (id, org_id, task_id, author_id, body) values (${id}, ${org.id}, ${data.taskId}, ${me.id}, ${body})`;
	if (task[0].assignee_id && task[0].assignee_id !== me.id) await notify(sql, org.id, String(task[0].assignee_id), "comment", "New comment", `${me.displayName} on ${task[0].title}`, `/tasks/${data.taskId}`);
	return { id };
});
var toggleChecklist_createServerFn_handler = createServerRpc({
	id: "c81ab6caa902e75caa80c48b4954f26bfdedc7a5c2c1292bf8d891aa5d149e5d",
	name: "toggleChecklist",
	filename: "src/lib/server/fns.ts"
}, (opts) => toggleChecklist.__executeServer(opts));
var toggleChecklist = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(toggleChecklist_createServerFn_handler, async ({ context, data }) => {
	const { sql, org } = await ensureActor(context.userId);
	await sql`update checklist_items set done = ${data.done} where id = ${data.id} and task_id in (select id from tasks where org_id = ${org.id})`;
	return { ok: true };
});
var addChecklistItem_createServerFn_handler = createServerRpc({
	id: "dd1aaa595a8b559a4b4908f1fa658d947912dfb596facacc8863898c39f629ea",
	name: "addChecklistItem",
	filename: "src/lib/server/fns.ts"
}, (opts) => addChecklistItem.__executeServer(opts));
var addChecklistItem = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(addChecklistItem_createServerFn_handler, async ({ context, data }) => {
	const { sql, org } = await ensureActor(context.userId);
	if (!(await sql`select id from tasks where id = ${data.taskId} and org_id = ${org.id}`)[0]) throw new Error("Not found");
	const id = nid("chk");
	await sql`insert into checklist_items (id, task_id, title, done, position) values (${id}, ${data.taskId}, ${data.title.trim()}, ${false}, ${Date.now()})`;
	return { id };
});
var listChannels_createServerFn_handler = createServerRpc({
	id: "8b9439757133813db630daba7c76f8dd91491986a888ecc02e4c98675b500cd0",
	name: "listChannels",
	filename: "src/lib/server/fns.ts"
}, (opts) => listChannels.__executeServer(opts));
var listChannels = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listChannels_createServerFn_handler, async ({ context }) => {
	const { sql, me, org } = await ensureActor(context.userId);
	return (await sql`select c.*,
      (select count(*)::int from messages m
        join channel_members cm2 on cm2.channel_id = c.id and cm2.profile_id = ${me.id}
        where m.channel_id = c.id and (cm2.last_read_at is null or m.created_at > cm2.last_read_at)
          and m.author_id != ${me.id}
      ) as unread
      from channels c
      join channel_members cm on cm.channel_id = c.id and cm.profile_id = ${me.id}
      where c.org_id = ${org.id}
      order by c.type, c.name`).map((r) => mapChannel(r, Number(r.unread ?? 0)));
});
var listMessages_createServerFn_handler = createServerRpc({
	id: "40139dbbb0d16d80861b47715a77ef55a6ace2a05b4c2bc10dafa6282bcf4581",
	name: "listMessages",
	filename: "src/lib/server/fns.ts"
}, (opts) => listMessages.__executeServer(opts));
var listMessages = createServerFn({ method: "GET" }).validator((channelId) => channelId).middleware([authMiddleware]).handler(listMessages_createServerFn_handler, async ({ context, data: channelId }) => {
	const { sql, me, org } = await ensureActor(context.userId);
	if (!(await sql`select 1 from channel_members cm join channels c on c.id = cm.channel_id where cm.channel_id = ${channelId} and cm.profile_id = ${me.id} and c.org_id = ${org.id}`)[0]) throw new Error("Forbidden");
	const rows = await sql`select * from messages where channel_id = ${channelId} order by created_at asc limit 200`;
	const ids = rows.map((r) => String(r.id));
	const reactions = ids.length ? await sql.query(`select message_id, emoji, profile_id from message_reactions where message_id in (${ids.map((_, i) => `$${i + 1}`).join(",")})`, ids) : [];
	const grouped = /* @__PURE__ */ new Map();
	for (const r of reactions) {
		const byMsg = grouped.get(r.message_id) ?? /* @__PURE__ */ new Map();
		const list = byMsg.get(r.emoji) ?? [];
		list.push(r.profile_id);
		byMsg.set(r.emoji, list);
		grouped.set(r.message_id, byMsg);
	}
	await sql`update channel_members set last_read_at = now() where channel_id = ${channelId} and profile_id = ${me.id}`;
	return rows.map((row) => {
		const byEmoji = grouped.get(String(row.id));
		const rx = byEmoji ? [...byEmoji.entries()].map(([emoji, profileIds]) => ({
			emoji,
			profileIds
		})) : [];
		return mapMessage(row, rx);
	});
});
var sendMessage_createServerFn_handler = createServerRpc({
	id: "f49b08c1a8a35a1ebabc3c8f2cfdf42e164451ff5c5add62ed251ca1075059de",
	name: "sendMessage",
	filename: "src/lib/server/fns.ts"
}, (opts) => sendMessage.__executeServer(opts));
var sendMessage = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(sendMessage_createServerFn_handler, async ({ context, data }) => {
	const { sql, me, org } = await ensureActor(context.userId);
	const body = data.body.trim();
	if (!body) throw new Error("Empty message");
	if (!(await sql`select 1 from channel_members cm join channels c on c.id = cm.channel_id where cm.channel_id = ${data.channelId} and cm.profile_id = ${me.id} and c.org_id = ${org.id}`)[0]) throw new Error("Forbidden");
	const id = nid("msg");
	await sql`insert into messages (id, channel_id, author_id, body, parent_id) values (${id}, ${data.channelId}, ${me.id}, ${body}, ${data.parentId ?? null})`;
	const people = await sql`select id, display_name from profiles where org_id = ${org.id} and status = ${"active"}`;
	const lower = body.toLowerCase();
	for (const p of people) {
		if (p.id === me.id) continue;
		const name = p.display_name.toLowerCase();
		const first = name.split(/\s+/)[0] ?? name;
		if (lower.includes(`@${name}`) || lower.includes(`@${first}`)) await notify(sql, org.id, p.id, "mention", "You were mentioned", `${me.displayName}: ${body.slice(0, 120)}`, `/chat?channel=${data.channelId}`);
	}
	return { id };
});
var toggleReaction_createServerFn_handler = createServerRpc({
	id: "620608cc1c75e7d99b3d33e40f486f24a251bc74ee6ad12bc3c373845a5df545",
	name: "toggleReaction",
	filename: "src/lib/server/fns.ts"
}, (opts) => toggleReaction.__executeServer(opts));
var toggleReaction = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(toggleReaction_createServerFn_handler, async ({ context, data }) => {
	const { sql, me, org } = await ensureActor(context.userId);
	const emoji = data.emoji.trim().slice(0, 16);
	if (!emoji) throw new Error("Reaction required");
	if (!(await sql`
      select 1 from messages m
      join channels c on c.id = m.channel_id
      join channel_members cm on cm.channel_id = c.id
      where m.id = ${data.messageId} and c.org_id = ${org.id} and cm.profile_id = ${me.id}`)[0]) throw new Error("Forbidden");
	if ((await sql`select 1 from message_reactions where message_id = ${data.messageId} and profile_id = ${me.id} and emoji = ${emoji}`)[0]) await sql`delete from message_reactions where message_id = ${data.messageId} and profile_id = ${me.id} and emoji = ${emoji}`;
	else await sql`insert into message_reactions (message_id, profile_id, emoji) values (${data.messageId}, ${me.id}, ${emoji})`;
	return { ok: true };
});
var editMessage_createServerFn_handler = createServerRpc({
	id: "72211a908303779876ba035da9199fa5865a0e7712fefe5e5a3e829c1a7e405c",
	name: "editMessage",
	filename: "src/lib/server/fns.ts"
}, (opts) => editMessage.__executeServer(opts));
var editMessage = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(editMessage_createServerFn_handler, async ({ context, data }) => {
	const { sql, me, org } = await ensureActor(context.userId);
	const body = data.body.trim();
	if (!body) throw new Error("Empty message");
	if (!(await sql`
      select m.id from messages m
      join channels c on c.id = m.channel_id
      where m.id = ${data.id} and m.author_id = ${me.id} and c.org_id = ${org.id}`)[0]) throw new Error("Forbidden");
	await sql`update messages set body = ${body}, edited_at = now() where id = ${data.id}`;
	return { ok: true };
});
var deleteMessage_createServerFn_handler = createServerRpc({
	id: "f689e068f897edab9fa848e0d06bb509dbf5469a0d96e66bef619cfc1eb2b695",
	name: "deleteMessage",
	filename: "src/lib/server/fns.ts"
}, (opts) => deleteMessage.__executeServer(opts));
var deleteMessage = createServerFn({ method: "POST" }).validator((id) => id).middleware([authMiddleware]).handler(deleteMessage_createServerFn_handler, async ({ context, data: id }) => {
	const { sql, me, org } = await ensureActor(context.userId);
	const row = await sql`
      select m.author_id from messages m
      join channels c on c.id = m.channel_id
      where m.id = ${id} and c.org_id = ${org.id}`;
	if (!row[0]) throw new Error("Not found");
	if (String(row[0].author_id) !== me.id && !canManageWork(me.role)) throw new Error("Forbidden");
	await sql`delete from messages where id = ${id}`;
	return { ok: true };
});
var openDirectMessage_createServerFn_handler = createServerRpc({
	id: "52d4c5684213e1d9364b77676a4e4a2d0b339a3432356893bb90f2e0d07ac560",
	name: "openDirectMessage",
	filename: "src/lib/server/fns.ts"
}, (opts) => openDirectMessage.__executeServer(opts));
var openDirectMessage = createServerFn({ method: "POST" }).validator((profileId) => profileId).middleware([authMiddleware]).handler(openDirectMessage_createServerFn_handler, async ({ context, data: profileId }) => {
	const { sql, me, org } = await ensureActor(context.userId);
	if (profileId === me.id) throw new Error("Cannot message yourself");
	const other = await sql`select * from profiles where id = ${profileId} and org_id = ${org.id}`;
	if (!other[0]) throw new Error("Not found");
	const existing = await sql`
      select c.id from channels c
      join channel_members a on a.channel_id = c.id and a.profile_id = ${me.id}
      join channel_members b on b.channel_id = c.id and b.profile_id = ${profileId}
      where c.org_id = ${org.id} and c.type = ${"dm"}
      limit 1`;
	if (existing[0]) return { id: String(existing[0].id) };
	const id = nid("dm");
	const name = [me.displayName, String(other[0].display_name)].sort().join(" · ");
	await sql`insert into channels (id, org_id, type, name) values (${id}, ${org.id}, ${"dm"}, ${name})`;
	await sql`insert into channel_members (channel_id, profile_id) values (${id}, ${me.id}), (${id}, ${profileId})`;
	return { id };
});
var listNotifications_createServerFn_handler = createServerRpc({
	id: "4b7c74445b8a677f03c5007fec61ada7c69581953c832b505253b8eb5664d0a9",
	name: "listNotifications",
	filename: "src/lib/server/fns.ts"
}, (opts) => listNotifications.__executeServer(opts));
var listNotifications = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listNotifications_createServerFn_handler, async ({ context }) => {
	const { sql, me } = await ensureActor(context.userId);
	return (await sql`select * from notifications where profile_id = ${me.id} order by created_at desc limit 50`).map(mapNotification);
});
var markNotificationsRead_createServerFn_handler = createServerRpc({
	id: "1faf4fb973ae17893b2883efbf91dd4795c92133d809485a348e452d75632c2c",
	name: "markNotificationsRead",
	filename: "src/lib/server/fns.ts"
}, (opts) => markNotificationsRead.__executeServer(opts));
var markNotificationsRead = createServerFn({ method: "POST" }).validator((id) => id).middleware([authMiddleware]).handler(markNotificationsRead_createServerFn_handler, async ({ context, data: id }) => {
	const { sql, me } = await ensureActor(context.userId);
	if (id) await sql`update notifications set read = true where id = ${id} and profile_id = ${me.id}`;
	else await sql`update notifications set read = true where profile_id = ${me.id}`;
	return { ok: true };
});
var listFiles_createServerFn_handler = createServerRpc({
	id: "6dffcb81d0b4aab913a54d97f5a92eaab16cca1b41db6d5f83df5b7d41f6c623",
	name: "listFiles",
	filename: "src/lib/server/fns.ts"
}, (opts) => listFiles.__executeServer(opts));
var listFiles = createServerFn({ method: "GET" }).validator((data = {}) => data).middleware([authMiddleware]).handler(listFiles_createServerFn_handler, async ({ context, data }) => {
	const { sql, org } = await ensureActor(context.userId);
	const q = data.q?.trim();
	return (q ? await sql`select * from attachments where org_id = ${org.id} and name ilike ${`%${q}%`} order by created_at desc` : await sql`select * from attachments where org_id = ${org.id} order by created_at desc`).map(mapAttachment);
});
var addFile_createServerFn_handler = createServerRpc({
	id: "e2e85975a83130273915746965b87d33f3c45e3f5267ba6fcd84efd6b78c1f2f",
	name: "addFile",
	filename: "src/lib/server/fns.ts"
}, (opts) => addFile.__executeServer(opts));
var addFile = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(addFile_createServerFn_handler, async ({ context, data }) => {
	const { sql, me, org } = await ensureActor(context.userId);
	const id = nid("file");
	await sql`insert into attachments (id, org_id, name, mime, size_bytes, project_id, task_id, uploaded_by)
      values (${id}, ${org.id}, ${data.name}, ${data.mime ?? "application/octet-stream"}, ${data.sizeBytes ?? 0}, ${data.projectId ?? null}, ${data.taskId ?? null}, ${me.id})`;
	await writeActivity(sql, org.id, me.id, "file", id, "upload", `Uploaded ${data.name}`);
	await writeAudit(sql, org.id, me.id, "file.uploaded", "file", id, `Uploaded ${data.name}`);
	return { id };
});
var startTimer_createServerFn_handler = createServerRpc({
	id: "1fee03a4ecc8e706bd8c5187188fc5733e2db31ec9c337a082a5c5cb7503a3c7",
	name: "startTimer",
	filename: "src/lib/server/fns.ts"
}, (opts) => startTimer.__executeServer(opts));
var startTimer = createServerFn({ method: "POST" }).validator((taskId) => taskId).middleware([authMiddleware]).handler(startTimer_createServerFn_handler, async ({ context, data: taskId }) => {
	const { sql, me, org } = await ensureActor(context.userId);
	if ((await sql`select id from time_entries where profile_id = ${me.id} and ended_at is null`)[0]) throw new Error("A timer is already running");
	const id = nid("te");
	await sql`insert into time_entries (id, org_id, profile_id, task_id, started_at) values (${id}, ${org.id}, ${me.id}, ${taskId ?? null}, now())`;
	return { id };
});
var stopTimer_createServerFn_handler = createServerRpc({
	id: "99214031f5d2e86c90c66689fbd390ea12455bf512e5f96f251ab5033a6c75ad",
	name: "stopTimer",
	filename: "src/lib/server/fns.ts"
}, (opts) => stopTimer.__executeServer(opts));
var stopTimer = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(stopTimer_createServerFn_handler, async ({ context }) => {
	const { sql, me } = await ensureActor(context.userId);
	const open = await sql`select * from time_entries where profile_id = ${me.id} and ended_at is null order by started_at desc limit 1`;
	if (!open[0]) return { ok: false };
	const started = new Date(toIso(open[0].started_at)).getTime();
	const minutes = Math.max(1, Math.round((Date.now() - started) / 6e4));
	await sql`update time_entries set ended_at = now(), minutes = ${minutes} where id = ${open[0].id}`;
	if (open[0].task_id) await sql`update tasks set actual_minutes = actual_minutes + ${minutes}, updated_at = now() where id = ${open[0].task_id}`;
	return {
		ok: true,
		minutes
	};
});
var addTimeEntry_createServerFn_handler = createServerRpc({
	id: "cfa102b9ccd2bc2b7c4eed4879e13477e56195a64fa5247574acd6768d875005",
	name: "addTimeEntry",
	filename: "src/lib/server/fns.ts"
}, (opts) => addTimeEntry.__executeServer(opts));
var addTimeEntry = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(addTimeEntry_createServerFn_handler, async ({ context, data }) => {
	const { sql, me, org } = await ensureActor(context.userId);
	const minutes = Math.max(1, Math.round(data.minutes));
	const id = nid("te");
	await sql`insert into time_entries (id, org_id, profile_id, task_id, started_at, ended_at, minutes, note)
      values (${id}, ${org.id}, ${me.id}, ${data.taskId ?? null}, now(), now(), ${minutes}, ${data.note ?? ""})`;
	if (data.taskId) await sql`update tasks set actual_minutes = actual_minutes + ${minutes}, updated_at = now() where id = ${data.taskId} and org_id = ${org.id}`;
	return { id };
});
var listTimeEntries_createServerFn_handler = createServerRpc({
	id: "da28597580cebbacfa078e8f3eff2dac5c907a3c9e11b651de5d5261138b43dc",
	name: "listTimeEntries",
	filename: "src/lib/server/fns.ts"
}, (opts) => listTimeEntries.__executeServer(opts));
var listTimeEntries = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listTimeEntries_createServerFn_handler, async ({ context }) => {
	const { sql, me } = await ensureActor(context.userId);
	return (await sql`select * from time_entries where profile_id = ${me.id} order by started_at desc limit 40`).map(mapTime);
});
var listEvents_createServerFn_handler = createServerRpc({
	id: "530839d64b9e7f530c678a40e0cd83b68d89cb3ade688966ad9210866de07ce0",
	name: "listEvents",
	filename: "src/lib/server/fns.ts"
}, (opts) => listEvents.__executeServer(opts));
var listEvents = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listEvents_createServerFn_handler, async ({ context }) => {
	const { sql, org } = await ensureActor(context.userId);
	return {
		events: (await sql`select * from calendar_events where org_id = ${org.id} order by starts_at`).map(mapEvent),
		deadlines: (await sql`
      select id, title, due_date, project_id from tasks where org_id = ${org.id} and parent_id is null and due_date is not null`).map((t) => ({
			id: t.id,
			title: t.title,
			date: String(t.due_date),
			projectId: t.project_id
		}))
	};
});
var getAnalytics_createServerFn_handler = createServerRpc({
	id: "abc60e14b4bfb39fa0ea6273dfec4baf7482f9a9cee8fb6274406bfc2e979615",
	name: "getAnalytics",
	filename: "src/lib/server/fns.ts"
}, (opts) => getAnalytics.__executeServer(opts));
var getAnalytics = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getAnalytics_createServerFn_handler, async ({ context }) => {
	const { sql, me, org } = await ensureActor(context.userId);
	const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	const visible = await visibleProfileIds(sql, org.id, me);
	const visSql = visible ? " and assignee_id = any($2::text[])" : "";
	const visParams = visible ? [org.id, visible] : [org.id];
	const byStatus = await sql.query(`select status, count(*)::int as c from tasks where org_id = $1 and parent_id is null${visSql} group by status`, visParams);
	const byProject = await sql`
      select p.id, p.name,
        (select count(*)::int from tasks t where t.project_id = p.id and t.parent_id is null) as total,
        (select count(*)::int from tasks t where t.project_id = p.id and t.parent_id is null and t.status = 'completed') as done,
        (select coalesce(sum(actual_minutes),0)::int from tasks t where t.project_id = p.id) as minutes
      from projects p where p.org_id = ${org.id} order by p.name`;
	const workloadRaw = await sql`
      select p.id, p.display_name as name,
        (select count(*)::int from tasks t where t.assignee_id = p.id and t.parent_id is null and t.status not in ('completed','backlog')) as active,
        (select count(*)::int from tasks t where t.assignee_id = p.id and t.parent_id is null and t.status = 'completed') as completed,
        (select count(*)::int from tasks t where t.assignee_id = p.id and t.parent_id is null and t.status != 'completed' and t.due_date is not null and t.due_date < ${today}) as overdue,
        (select coalesce(sum(minutes),0)::int from time_entries te where te.profile_id = p.id) as minutes
      from profiles p where p.org_id = ${org.id} and p.status = 'active' order by name`;
	const workload = visible ? workloadRaw.filter((w) => visible.includes(w.id)) : workloadRaw;
	const trend = [];
	for (let i = 6; i >= 0; i -= 1) {
		const d = /* @__PURE__ */ new Date();
		d.setDate(d.getDate() - i);
		const key = d.toISOString().slice(0, 10);
		const row = await sql`select count(*)::int as c from tasks where org_id = ${org.id} and status = ${"completed"} and parent_id is null and updated_at::date = ${key}::date`;
		trend.push({
			date: key,
			completed: row[0]?.c ?? 0
		});
	}
	return {
		byStatus,
		byProject,
		workload,
		trend,
		mine: {
			active: workload.find((w) => w.id === me.id)?.active ?? 0,
			completed: workload.find((w) => w.id === me.id)?.completed ?? 0,
			overdue: workload.find((w) => w.id === me.id)?.overdue ?? 0,
			minutes: workload.find((w) => w.id === me.id)?.minutes ?? 0
		},
		role: me.role
	};
});
var searchAll_createServerFn_handler = createServerRpc({
	id: "8a9eea916f583a0e8d841a3b27782831911de1ab7bff833e78e31cb5b8effd5e",
	name: "searchAll",
	filename: "src/lib/server/fns.ts"
}, (opts) => searchAll.__executeServer(opts));
var searchAll = createServerFn({ method: "GET" }).validator((q) => q).middleware([authMiddleware]).handler(searchAll_createServerFn_handler, async ({ context, data: q }) => {
	const { sql, org } = await ensureActor(context.userId);
	const term = q.trim();
	if (term.length < 1) return [];
	const like = `%${term}%`;
	const hits = [];
	const tasks = await sql`select id, title, status from tasks where org_id = ${org.id} and title ilike ${like} limit 8`;
	for (const t of tasks) hits.push({
		kind: "task",
		id: String(t.id),
		title: String(t.title),
		subtitle: String(t.status),
		href: `/tasks/${t.id}`
	});
	const projects = await sql`select id, name, status from projects where org_id = ${org.id} and name ilike ${like} limit 5`;
	for (const p of projects) hits.push({
		kind: "project",
		id: String(p.id),
		title: String(p.name),
		subtitle: String(p.status),
		href: `/projects/${p.id}`
	});
	const people = await sql`select id, display_name, title from profiles where org_id = ${org.id} and (display_name ilike ${like} or coalesce(email,'') ilike ${like} or coalesce(work_email,'') ilike ${like} or coalesce(employee_code,'') ilike ${like}) limit 5`;
	for (const p of people) hits.push({
		kind: "person",
		id: String(p.id),
		title: String(p.display_name),
		subtitle: String(p.title),
		href: `/employees/${p.id}`
	});
	const files = await sql`select id, name from attachments where org_id = ${org.id} and name ilike ${like} limit 5`;
	for (const f of files) hits.push({
		kind: "file",
		id: String(f.id),
		title: String(f.name),
		subtitle: "File",
		href: `/files`
	});
	const messages = await sql`select id, body, channel_id from messages where channel_id in (select id from channels where org_id = ${org.id}) and body ilike ${like} limit 5`;
	for (const m of messages) hits.push({
		kind: "message",
		id: String(m.id),
		title: String(m.body).slice(0, 80),
		subtitle: "Message",
		href: `/chat?channel=${m.channel_id}`
	});
	return hits;
});
var getAdmin_createServerFn_handler = createServerRpc({
	id: "4c4c30fa918c71526a397cf23eeebbb8aeaafef02db54bfe092584afe45f82d7",
	name: "getAdmin",
	filename: "src/lib/server/fns.ts"
}, (opts) => getAdmin.__executeServer(opts));
var getAdmin = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getAdmin_createServerFn_handler, async ({ context }) => {
	const { sql, me, org } = await ensureActor(context.userId);
	if (!hasPerm(me.role, "employee.update") && !hasPerm(me.role, "admin.audit_logs")) throw new Error("Forbidden");
	return {
		members: (await sql`select * from profiles where org_id = ${org.id} order by role, display_name`).map(mapProfile),
		audit: hasPerm(me.role, "admin.audit_logs") ? (await sql`select * from audit_logs where org_id = ${org.id} order by created_at desc limit 40`).map((r) => ({
			id: String(r.id),
			actorId: r.actor_id ? String(r.actor_id) : null,
			action: String(r.action),
			targetType: String(r.target_type),
			targetId: String(r.target_id),
			summary: String(r.summary),
			createdAt: toIso(r.created_at)
		})) : []
	};
});
var updateMember_createServerFn_handler = createServerRpc({
	id: "b300470cf5f771d77c83154217d5c45fc199086b994b78b68999a4e0a05e4b3c",
	name: "updateMember",
	filename: "src/lib/server/fns.ts"
}, (opts) => updateMember.__executeServer(opts));
var updateMember = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(updateMember_createServerFn_handler, async ({ context, data }) => {
	const { sql, me, org } = await ensureActor(context.userId);
	if (!hasPerm(me.role, "employee.update")) throw new Error("Forbidden");
	if (data.id === me.id && data.role && data.role !== me.role) throw new Error("You cannot change your own role");
	const current = await sql`select * from profiles where id = ${data.id} and org_id = ${org.id}`;
	if (!current[0]) throw new Error("Not found");
	const currentRole = String(current[0].role);
	if (currentRole === "ceo" && (data.role || data.status === "disabled")) throw new Error("The CEO cannot be modified");
	if (!canModifyPerson(me.role, currentRole)) throw new Error("You cannot change this person");
	if (data.role && !assignableRoles(me.role).includes(data.role)) throw new Error("You cannot assign that role");
	await sql`update profiles set role = ${data.role ?? String(current[0].role)}, status = ${data.status ?? String(current[0].status)}, title = ${data.title ?? String(current[0].title)} where id = ${data.id}`;
	await writeAudit(sql, org.id, me.id, "member.updated", "profile", data.id, `Updated ${current[0].display_name}`);
	return { ok: true };
});
var inviteMember_createServerFn_handler = createServerRpc({
	id: "07a26c15da5ba01692a96d025845b1dcc299aec6fa006a8f1b3c766a05808ec7",
	name: "inviteMember",
	filename: "src/lib/server/fns.ts"
}, (opts) => inviteMember.__executeServer(opts));
var inviteMember = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(inviteMember_createServerFn_handler, async ({ context, data }) => {
	const { sql, me, org } = await ensureActor(context.userId);
	if (!hasPerm(me.role, "employee.create")) throw new Error("Only the CEO, a director or a manager can enroll employees");
	const email = data.email.trim().toLowerCase();
	const name = data.name.trim();
	if (!email || !name) throw new Error("Name and email are required");
	const role = data.role ?? "employee";
	if (!assignableRoles(me.role).includes(role)) throw new Error("You cannot assign that role");
	if ((await sql`select id from profiles where org_id = ${org.id} and (
      lower(coalesce(email,'')) = ${email} or lower(coalesce(work_email,'')) = ${email}
    )`)[0]) throw new Error("A member with that email already exists");
	const id = nid("prf");
	const code = await nextEmployeeCode(sql, org.id);
	await sql`insert into profiles (id, org_id, email, work_email, display_name, title, role, avatar_key, status, employee_code, username, invited_by)
      values (${id}, ${org.id}, ${email}, ${email}, ${name}, ${data.title ?? "Employee"}, ${role}, ${"zinc"}, ${"invited"}, ${code}, ${email.split("@")[0]}, ${me.id})`;
	const general = await sql`select id from channels where org_id = ${org.id} and name = ${"general"} limit 1`;
	if (general[0]) await sql`insert into channel_members (channel_id, profile_id) values (${general[0].id}, ${id}) on conflict do nothing`;
	await writeAudit(sql, org.id, me.id, "member.invited", "profile", id, `Invited ${name}`);
	await notify(sql, org.id, id, "employee", "You're enrolled in TRONX", `Your employee ID is ${code}. Sign in with ${email}.`, "/");
	return {
		id,
		employeeCode: code
	};
});
var askTronxAi_createServerFn_handler = createServerRpc({
	id: "1aad18c9bb0c68fe122cfe53c431d44d724f3315054b383fb0242b5331c3d940",
	name: "askTronxAi",
	filename: "src/lib/server/fns.ts"
}, (opts) => askTronxAi.__executeServer(opts));
var askTronxAi = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(askTronxAi_createServerFn_handler, async ({ context, data }) => {
	const { sql, me, org } = await ensureActor(context.userId);
	const prompt = data.prompt.trim();
	if (!prompt) return {
		ok: false,
		error: "Ask something first."
	};
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "TRONX AI is not available in this environment."
	};
	const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	const visible = await visibleProfileIds(sql, org.id, me);
	const visSql = visible ? " and assignee_id = any($3::text[])" : "";
	const visParams = visible ? [
		org.id,
		today,
		visible
	] : [org.id, today];
	const projects = me.role === "employee" ? await sql`select name, status from projects p where org_id = ${org.id} and (
            owner_id = ${me.id}
            or exists (select 1 from project_members pm where pm.project_id = p.id and pm.profile_id = ${me.id})
          )` : await sql`select name, status from projects where org_id = ${org.id}`;
	const overdue = await sql.query(`select title, assignee_id from tasks where org_id = $1 and parent_id is null and status != 'completed' and due_date is not null and due_date < $2${visSql} limit 20`, visParams);
	const blocked = await sql.query(`select title, blocked_reason from tasks where org_id = $1 and blocked = true and status != 'completed'${visible ? " and assignee_id = any($2::text[])" : ""}`, visible ? [org.id, visible] : [org.id]);
	const dueToday = await sql.query(`select title, assignee_id, project_id from tasks where org_id = $1 and parent_id is null and due_date = $2 and status != 'completed'${visSql}`, visParams);
	const members = await sql`select id, display_name, title, role from profiles where org_id = ${org.id} and status = 'active'`;
	const workload = await sql`
      select p.display_name as name,
        (select count(*)::int from tasks t where t.assignee_id = p.id and t.parent_id is null and t.status not in ('completed','backlog')) as active
      from profiles p where p.org_id = ${org.id}`;
	const recent = visible ? await sql.query(`select summary, created_at from activity_logs where org_id = $1 and (actor_id = any($2::text[]) or entity_id = any($2::text[])) order by created_at desc limit 12`, [org.id, visible]) : await sql`select summary, created_at from activity_logs where org_id = ${org.id} order by created_at desc limit 12`;
	const memberFilter = visible ? members.filter((m) => visible.includes(String(m.id))) : members;
	const system = `You are TRONX AI, the internal operations assistant for ${org.name}.
Today is ${today}. The current user is ${me.displayName} (${me.role}, ${me.title}).
Answer using only the workspace data below. Be concise, specific, and operational. Use markdown. Do not invent people or projects.
Respect role permissions: never reveal information the current user is not authorized to access.

Members: ${JSON.stringify(memberFilter)}
Projects: ${JSON.stringify(projects)}
Due today: ${JSON.stringify(dueToday)}
Overdue: ${JSON.stringify(overdue)}
Blocked: ${JSON.stringify(blocked)}
Workload (active tasks): ${JSON.stringify(visible ? workload.filter((w) => memberFilter.some((m) => m.display_name === w.name)) : workload)}
Recent activity: ${JSON.stringify(recent)}`;
	const res = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "grok-4.5",
			max_tokens: 900,
			messages: [{
				role: "system",
				content: system
			}, {
				role: "user",
				content: prompt
			}]
		})
	});
	if (!res.ok) return {
		ok: false,
		error: `TRONX AI is temporarily unavailable (${res.status}).`
	};
	return {
		ok: true,
		text: (await res.json()).choices?.[0]?.message?.content ?? "No response."
	};
});
var listActivity_createServerFn_handler = createServerRpc({
	id: "ce13689992aafbc0270795db366a300c96143296c53d661767a18c91a679ad98",
	name: "listActivity",
	filename: "src/lib/server/fns.ts"
}, (opts) => listActivity.__executeServer(opts));
var listActivity = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listActivity_createServerFn_handler, async ({ context }) => {
	const { sql, org } = await ensureActor(context.userId);
	return (await sql`select * from activity_logs where org_id = ${org.id} order by created_at desc limit 40`).map(mapActivity);
});
//#endregion
export { addChecklistItem_createServerFn_handler, addComment_createServerFn_handler, addFile_createServerFn_handler, addProjectMember, addTeamMember, addTimeEntry_createServerFn_handler, askTronxAi_createServerFn_handler, createAnnouncement, createDepartment, createProject_createServerFn_handler, createTask_createServerFn_handler, createTeam, deleteMessage_createServerFn_handler, duplicateTask_createServerFn_handler, editMessage_createServerFn_handler, enrollEmployee, getAdmin_createServerFn_handler, getAnalytics_createServerFn_handler, getDashboard_createServerFn_handler, getEmployee, getProject_createServerFn_handler, getTask_createServerFn_handler, getWorkspace_createServerFn_handler, inviteMember_createServerFn_handler, listActivity_createServerFn_handler, listAnnouncements, listChannels_createServerFn_handler, listDepartments, listEvents_createServerFn_handler, listFiles_createServerFn_handler, listMessages_createServerFn_handler, listNotifications_createServerFn_handler, listProjects_createServerFn_handler, listTasks_createServerFn_handler, listTimeEntries_createServerFn_handler, markNotificationsRead_createServerFn_handler, openDirectMessage_createServerFn_handler, searchAll_createServerFn_handler, sendMessage_createServerFn_handler, startTimer_createServerFn_handler, stopTimer_createServerFn_handler, toggleChecklist_createServerFn_handler, toggleReaction_createServerFn_handler, updateEmployee, updateMember_createServerFn_handler, updateOrgSettings, updateProject_createServerFn_handler, updateTask_createServerFn_handler };
