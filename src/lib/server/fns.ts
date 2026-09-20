import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { assignableRoles, allowedTaskStatuses, canManageWork, canModifyPerson, hasPerm } from "@/lib/permissions";
import type {
  AuditItem,
  DashboardPayload,
  SearchHit,
  TaskStatus,
  WorkspacePayload,
} from "@/lib/types";
import { nid, toIso } from "@/lib/utils";
import { ensureActor, nextEmployeeCode, notify, visibleProfileIds, writeActivity, writeAudit } from "./actor";
import {
  mapActivity,
  mapAnnouncement,
  mapAttachment,
  mapChannel,
  mapChecklist,
  mapComment,
  mapDepartment,
  mapEvent,
  mapMessage,
  mapMilestone,
  mapNotification,
  mapProfile,
  mapProject,
  mapTask,
  mapTeam,
  mapTime,
  TASK_SELECT,
} from "./map";

export * from "./people";


export const getWorkspace = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<WorkspacePayload> => {
    const { sql, me, org } = await ensureActor(context.userId);
    const members = (await sql`select * from profiles where org_id = ${org.id} order by display_name`).map(mapProfile);
    const teamsRaw = await sql`select * from teams where org_id = ${org.id} order by name`;
    const tm = await sql<{ team_id: string; profile_id: string }>`select team_id, profile_id from team_members tm join teams t on t.id = tm.team_id where t.org_id = ${org.id}`;
    const byTeam = new Map<string, string[]>();
    for (const row of tm) {
      const list = byTeam.get(row.team_id) ?? [];
      list.push(row.profile_id);
      byTeam.set(row.team_id, list);
    }
    const teams = teamsRaw.map((r) => mapTeam(r, byTeam.get(String(r.id)) ?? []));
    const departments = (await sql`select * from departments where org_id = ${org.id} order by name`).map(mapDepartment);
    const announcements = (await sql`select * from announcements where org_id = ${org.id} order by created_at desc limit 6`).map(mapAnnouncement);
    const unreadRows = await sql<{ c: number }>`select count(*)::int as c from notifications where profile_id = ${me.id} and read = false`;
    const running = await sql`select * from time_entries where profile_id = ${me.id} and ended_at is null order by started_at desc limit 1`;
    const loadRows = await sql<{ assignee_id: string; c: number }>`
      select assignee_id, count(*)::int as c from tasks
      where org_id = ${org.id} and parent_id is null and status not in ('completed','backlog') and assignee_id is not null
      group by assignee_id`;
    const openTasksByProfile: Record<string, number> = {};
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
      openTasksByProfile,
    };
  });

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<DashboardPayload> => {
    const { sql, me, org } = await ensureActor(context.userId);
    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const visible = await visibleProfileIds(sql, org.id, me);

    const activeProjects = await sql<{ c: number }>`select count(*)::int as c from projects where org_id = ${org.id} and status = ${"active"}`;
    const totalProjects = await sql<{ c: number }>`select count(*)::int as c from projects where org_id = ${org.id}`;
    const employees = await sql<{ c: number }>`select count(*)::int as c from profiles where org_id = ${org.id} and status in (${"active"}, ${"invited"})`;
    const activeEmployees = await sql<{ c: number }>`select count(*)::int as c from profiles where org_id = ${org.id} and status = ${"active"}`;
    const tasksWeek = await sql<{ c: number }>`select count(*)::int as c from tasks where org_id = ${org.id} and parent_id is null and created_at >= ${weekAgo}`;
    const completedWeek = await sql<{ c: number }>`select count(*)::int as c from tasks where org_id = ${org.id} and parent_id is null and status = ${"completed"} and updated_at >= ${weekAgo}`;
    const totalTasks = await sql<{ c: number }>`select count(*)::int as c from tasks where org_id = ${org.id} and parent_id is null`;
    const completedTasks = await sql<{ c: number }>`select count(*)::int as c from tasks where org_id = ${org.id} and parent_id is null and status = ${"completed"}`;
    const pendingTasks = await sql<{ c: number }>`select count(*)::int as c from tasks where org_id = ${org.id} and parent_id is null and status not in (${"completed"}, ${"backlog"})`;

    const scopeParams: unknown[] = [org.id, today];
    const assigneeSql = visible ? " and assignee_id = any($3::text[])" : "";
    if (visible) scopeParams.push(visible);

    const overdue = await sql.query<{ c: number }>(
      `select count(*)::int as c from tasks where org_id = $1 and parent_id is null and status not in ('completed','backlog') and due_date is not null and due_date < $2${assigneeSql}`,
      scopeParams,
    );
    const blocked = await sql.query<{ c: number }>(
      `select count(*)::int as c from tasks where org_id = $1 and parent_id is null and (blocked = true or status = 'blocked')${visible ? " and assignee_id = any($2::text[])" : ""}`,
      visible ? [org.id, visible] : [org.id],
    );
    const dueToday = await sql.query<{ c: number }>(
      `select count(*)::int as c from tasks where org_id = $1 and parent_id is null and due_date = $2 and status != 'completed'${assigneeSql}`,
      scopeParams,
    );
    const myActive = await sql<{ c: number }>`select count(*)::int as c from tasks where assignee_id = ${me.id} and parent_id is null and status not in (${"completed"}, ${"backlog"})`;
    const myCompleted = await sql<{ c: number }>`select count(*)::int as c from tasks where assignee_id = ${me.id} and parent_id is null and status = ${"completed"}`;

    const projects = await sql`
      select p.id, p.name, p.color_key,
        (select count(*)::int from tasks t where t.project_id = p.id and t.parent_id is null) as task_total,
        (select count(*)::int from tasks t where t.project_id = p.id and t.parent_id is null and t.status = 'completed') as task_done
      from projects p where p.org_id = ${org.id} order by p.name`;

    const todayTasks = (
      await sql.query(
        `select ${TASK_SELECT} from tasks t where t.org_id = $1 and t.parent_id is null and t.due_date = $2 and t.status != 'completed'${visible ? " and t.assignee_id = any($3::text[])" : ""} order by t.priority, t.title`,
        scopeParams,
      )
    ).map(mapTask);

    const overdueTasks = (
      await sql.query(
        `select ${TASK_SELECT} from tasks t where t.org_id = $1 and t.parent_id is null and t.status != 'completed' and t.due_date is not null and t.due_date < $2${visible ? " and t.assignee_id = any($3::text[])" : ""} order by t.due_date limit 8`,
        scopeParams,
      )
    ).map(mapTask);

    const recentActivity = (await sql`select * from activity_logs where org_id = ${org.id} order by created_at desc limit 10`).map(mapActivity);

    const workloadRows = await sql<{ profile_id: string; name: string; active: number; completed: number; overdue: number }>`
      select p.id as profile_id, p.display_name as name,
        (select count(*)::int from tasks t where t.assignee_id = p.id and t.parent_id is null and t.status not in ('completed','backlog')) as active,
        (select count(*)::int from tasks t where t.assignee_id = p.id and t.parent_id is null and t.status = 'completed') as completed,
        (select count(*)::int from tasks t where t.assignee_id = p.id and t.parent_id is null and t.status != 'completed' and t.due_date is not null and t.due_date < ${today}) as overdue
      from profiles p where p.org_id = ${org.id} and p.status = 'active' order by active desc, name`;

    const upcomingTasks = await sql<{ id: string; title: string; due_date: string }>`
      select id, title, due_date from tasks
      where org_id = ${org.id} and parent_id is null and due_date is not null and due_date >= ${today} and status != 'completed'
      order by due_date limit 6`;
    const upcomingMs = await sql<{ id: string; title: string; due_date: string }>`
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
        completedThisWeek: completedWeek[0]?.c ?? 0,
      },
      projectProgress: projects.map((p) => {
        const total = Number(p.task_total ?? 0);
        const done = Number(p.task_done ?? 0);
        return {
          id: String(p.id),
          name: String(p.name),
          colorKey: String(p.color_key),
          progress: total > 0 ? Math.round((done / total) * 100) : 0,
        };
      }),
      todayTasks,
      overdueTasks,
      recentActivity,
      workload: workloadRows
        .filter((w) => !visible || visible.includes(w.profile_id))
        .map((w) => ({
        profileId: w.profile_id,
        name: w.name,
        active: Number(w.active),
        completed: Number(w.completed),
        overdue: Number(w.overdue),
      })),
      upcoming: [
        ...upcomingTasks.map((t) => ({ id: t.id, title: t.title, dueDate: String(t.due_date), type: "task" as const })),
        ...upcomingMs.map((t) => ({ id: t.id, title: t.title, dueDate: String(t.due_date), type: "milestone" as const })),
      ].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 8),
      announcements: (await sql`select * from announcements where org_id = ${org.id} order by created_at desc limit 4`).map(mapAnnouncement),
    };
  });

const PROJECT_SELECT = `
  p.*,
  (select count(*)::int from tasks t where t.project_id = p.id and t.parent_id is null) as task_total,
  (select count(*)::int from tasks t where t.project_id = p.id and t.parent_id is null and t.status = 'completed') as task_done
`;

export const listProjects = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    const rows =
      me.role === "employee"
        ? await sql.query(
            `select ${PROJECT_SELECT} from projects p where p.org_id = $1 and (
              p.owner_id = $2
              or exists (select 1 from project_members pm where pm.project_id = p.id and pm.profile_id = $2)
              or exists (select 1 from tasks t where t.project_id = p.id and t.assignee_id = $2)
            ) order by p.name`,
            [org.id, me.id],
          )
        : await sql.query(`select ${PROJECT_SELECT} from projects p where p.org_id = $1 order by p.name`, [org.id]);
    const members = await sql<{ project_id: string; profile_id: string }>`
      select project_id, profile_id from project_members pm join projects p on p.id = pm.project_id where p.org_id = ${org.id}`;
    const map = new Map<string, string[]>();
    for (const m of members) {
      const list = map.get(m.project_id) ?? [];
      list.push(m.profile_id);
      map.set(m.project_id, list);
    }
    return rows.map((r) => mapProject(r, map.get(String(r.id)) ?? []));
  });

export const getProject = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .middleware([authMiddleware])
  .handler(async ({ context, data: id }) => {
    const { sql, org } = await ensureActor(context.userId);
    const rows = await sql.query(`select ${PROJECT_SELECT} from projects p where p.id = $1 and p.org_id = $2`, [id, org.id]);
    if (!rows[0]) return null;
    const memberRows = await sql<{ profile_id: string }>`select profile_id from project_members where project_id = ${id}`;
    const project = mapProject(rows[0], memberRows.map((m) => m.profile_id));
    const tasks = (await sql.query(`select ${TASK_SELECT} from tasks t where t.project_id = $1 and t.parent_id is null order by t.created_at`, [id])).map(mapTask);
    const milestones = (await sql`select * from milestones where project_id = ${id} order by due_date nulls last`).map(mapMilestone);
    const files = (await sql`select * from attachments where project_id = ${id} order by created_at desc`).map(mapAttachment);
    const activity = (await sql`select * from activity_logs where org_id = ${org.id} and entity_id = ${id} order by created_at desc limit 20`).map(mapActivity);
    const channel = (await sql`select * from channels where project_id = ${id} limit 1`)[0];
    return { project, tasks, milestones, files, activity, channelId: channel ? String(channel.id) : null };
  });

export const createProject = createServerFn({ method: "POST" })
  .validator((data: { name: string; description?: string; teamId?: string; priority?: string; dueDate?: string }) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
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
      const teamPeople = await sql<{ profile_id: string }>`select profile_id from team_members where team_id = ${data.teamId}`;
      for (const member of teamPeople) {
        await sql`insert into project_members (project_id, profile_id) values (${id}, ${member.profile_id}) on conflict do nothing`;
        await sql`insert into channel_members (channel_id, profile_id) values (${chId}, ${member.profile_id}) on conflict do nothing`;
        if (member.profile_id !== me.id) {
          await notify(sql, org.id, member.profile_id, "project", "Added to a project", name, `/projects/${id}`);
        }
      }
    }
    await writeActivity(sql, org.id, me.id, "project", id, "created", `Created ${name}`);
    await writeAudit(sql, org.id, me.id, "project.created", "project", id, `Created project ${name}`);
    return { id };
  });

export const updateProject = createServerFn({ method: "POST" })
  .validator((data: { id: string; name?: string; description?: string; status?: string; priority?: string; dueDate?: string | null }) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    if (!hasPerm(me.role, "project.update")) throw new Error("Forbidden");
    const rows = await sql`select * from projects where id = ${data.id} and org_id = ${org.id}`;
    if (!rows[0]) throw new Error("Not found");
    const name = data.name ?? String(rows[0].name);
    const description = data.description ?? String(rows[0].description);
    const status = data.status ?? String(rows[0].status);
    const priority = data.priority ?? String(rows[0].priority);
    const dueDate = data.dueDate === undefined ? rows[0].due_date : data.dueDate;
    await sql`update projects set name = ${name}, description = ${description}, status = ${status}, priority = ${priority}, due_date = ${dueDate} where id = ${data.id}`;
    return { ok: true };
  });

export const listTasks = createServerFn({ method: "GET" })
  .validator((data: { projectId?: string; assigneeId?: string; status?: string; q?: string; mine?: boolean } = {}) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    const clauses = ["t.org_id = $1", "t.parent_id is null"];
    const params: unknown[] = [org.id];
    const visible = await visibleProfileIds(sql, org.id, me);
    if (data.assigneeId && visible && !visible.includes(data.assigneeId)) {
      return [];
    }
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
    const rows = await sql.query(
      `select ${TASK_SELECT} from tasks t where ${clauses.join(" and ")} order by case t.priority when 'urgent' then 0 when 'high' then 1 when 'medium' then 2 else 3 end, t.due_date nulls last, t.updated_at desc`,
      params,
    );
    return rows.map(mapTask);
  });

export const getTask = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .middleware([authMiddleware])
  .handler(async ({ context, data: id }) => {
    const { sql, org } = await ensureActor(context.userId);
    const rows = await sql.query(`select ${TASK_SELECT} from tasks t where t.id = $1 and t.org_id = $2`, [id, org.id]);
    if (!rows[0]) return null;
    const task = mapTask(rows[0]);
    const subtasks = (await sql.query(`select ${TASK_SELECT} from tasks t where t.parent_id = $1 order by t.created_at`, [id])).map(mapTask);
    const checklist = (await sql`select * from checklist_items where task_id = ${id} order by position`).map(mapChecklist);
    const comments = (await sql`select * from comments where task_id = ${id} order by created_at`).map(mapComment);
    const files = (await sql`select * from attachments where task_id = ${id} order by created_at desc`).map(mapAttachment);
    const deps = await sql<{ depends_on_id: string; title: string }>`
      select d.depends_on_id, t.title from task_dependencies d join tasks t on t.id = d.depends_on_id where d.task_id = ${id}`;
    const activity = (await sql`select * from activity_logs where org_id = ${org.id} and entity_id = ${id} order by created_at desc limit 20`).map(mapActivity);
    return { task, subtasks, checklist, comments, files, dependencies: deps, activity };
  });

export const createTask = createServerFn({ method: "POST" })
  .validator((data: {
    title: string;
    description?: string;
    projectId?: string;
    assigneeId?: string;
    priority?: string;
    status?: string;
    dueDate?: string;
    estimatedMinutes?: number;
    tags?: string;
    parentId?: string;
  }) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    const title = data.title.trim();
    if (!title) throw new Error("Title is required");
    if (!canManageWork(me.role) && !data.parentId) {
      data.assigneeId = me.id;
    }
    if (data.assigneeId && data.assigneeId !== me.id && !hasPerm(me.role, "task.assign")) {
      throw new Error("You cannot assign tasks to others");
    }
    if (!canManageWork(me.role)) {
      const allowed: TaskStatus[] = ["backlog", "todo", "in_progress"];
      if (!allowed.includes((data.status ?? "todo") as TaskStatus)) {
        data.status = "todo";
      }
    }
    const id = nid("task");
    await sql`insert into tasks (id, org_id, project_id, parent_id, title, description, creator_id, assignee_id, status, priority, due_date, estimated_minutes, tags)
      values (${id}, ${org.id}, ${data.projectId ?? null}, ${data.parentId ?? null}, ${title}, ${data.description ?? ""}, ${me.id}, ${data.assigneeId ?? me.id}, ${data.status ?? "todo"}, ${data.priority ?? "medium"}, ${data.dueDate ?? null}, ${data.estimatedMinutes ?? 0}, ${data.tags ?? ""})`;
    await writeActivity(sql, org.id, me.id, "task", id, "created", `Created ${title}`);
    await writeAudit(sql, org.id, me.id, "task.created", "task", id, `Created task ${title}`);
    if (data.assigneeId && data.assigneeId !== me.id) {
      await notify(sql, org.id, data.assigneeId, "task", "New task assigned", title, `/tasks/${id}`);
    }
    return { id };
  });

export const updateTask = createServerFn({ method: "POST" })
  .validator((data: {
    id: string;
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: string;
    assigneeId?: string | null;
    dueDate?: string | null;
    blocked?: boolean;
    blockedReason?: string;
    tags?: string;
    estimatedMinutes?: number;
  }) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    const rows = await sql`select * from tasks where id = ${data.id} and org_id = ${org.id}`;
    const current = rows[0];
    if (!current) throw new Error("Not found");
    const canEdit = canManageWork(me.role) || current.assignee_id === me.id || current.creator_id === me.id;
    if (!canEdit) throw new Error("Forbidden");
    if (data.assigneeId && data.assigneeId !== current.assignee_id && !hasPerm(me.role, "task.assign")) {
      throw new Error("You cannot reassign this task");
    }
    if (data.status && data.status !== current.status) {
      const fromStatus = String(current.status) as TaskStatus;
      if (data.status === "completed" && !canManageWork(me.role)) {
        throw new Error("Only a team lead or manager can approve work as completed");
      }
      if (data.status === "changes_requested" && !canManageWork(me.role)) {
        throw new Error("Only a team lead or manager can request changes");
      }
      if (!canManageWork(me.role) && !allowedTaskStatuses(me.role, fromStatus).includes(data.status)) {
        throw new Error("That status change is not allowed");
      }
    }
    const next = {
      title: data.title ?? String(current.title),
      description: data.description ?? String(current.description),
      status: data.status ?? String(current.status),
      priority: data.priority ?? String(current.priority),
      assigneeId: data.assigneeId === undefined ? (current.assignee_id as string | null) : data.assigneeId,
      dueDate: data.dueDate === undefined ? current.due_date : data.dueDate,
      blocked: data.blocked ?? Boolean(current.blocked),
      blockedReason: data.blockedReason ?? String(current.blocked_reason ?? ""),
      tags: data.tags ?? String(current.tags ?? ""),
      estimatedMinutes: data.estimatedMinutes ?? Number(current.estimated_minutes ?? 0),
    };
    await sql`update tasks set title = ${next.title}, description = ${next.description}, status = ${next.status},
      priority = ${next.priority}, assignee_id = ${next.assigneeId}, due_date = ${next.dueDate},
      blocked = ${next.blocked}, blocked_reason = ${next.blockedReason}, tags = ${next.tags},
      estimated_minutes = ${next.estimatedMinutes}, updated_at = now() where id = ${data.id}`;
    if (data.status && data.status !== current.status) {
      await writeActivity(sql, org.id, me.id, "task", data.id, "status", `Moved ${next.title} to ${data.status.replaceAll("_", " ")}`);
      await writeAudit(sql, org.id, me.id, "task.status", "task", data.id, `Status ${current.status} → ${data.status}`);
      if (data.status === "in_review") {
        const assignee = current.assignee_id
          ? await sql`select manager_id, team_lead_id from profiles where id = ${current.assignee_id as string}`
          : [];
        const targets = new Set<string>();
        if (current.creator_id) targets.add(String(current.creator_id));
        if (assignee[0]?.manager_id) targets.add(String(assignee[0].manager_id));
        if (assignee[0]?.team_lead_id) targets.add(String(assignee[0].team_lead_id));
        for (const id of targets) {
          if (id !== me.id) {
            await notify(sql, org.id, id, "review", "Submitted for review", next.title, `/tasks/${data.id}`);
          }
        }
      }
      if (data.status === "completed" && next.assigneeId && next.assigneeId !== me.id) {
        await notify(sql, org.id, next.assigneeId, "approved", "Task approved", next.title, `/tasks/${data.id}`);
      }
      if (data.status === "changes_requested" && next.assigneeId && next.assigneeId !== me.id) {
        await notify(sql, org.id, next.assigneeId, "changes", "Changes requested", next.title, `/tasks/${data.id}`);
      }
    }
    if (data.assigneeId && data.assigneeId !== current.assignee_id) {
      await writeAudit(sql, org.id, me.id, "task.reassigned", "task", data.id, `Reassigned ${next.title}`);
      if (data.assigneeId) await notify(sql, org.id, data.assigneeId, "task", "Task assigned", next.title, `/tasks/${data.id}`);
    }
    return { ok: true };
  });

export const duplicateTask = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .middleware([authMiddleware])
  .handler(async ({ context, data: id }) => {
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

export const addComment = createServerFn({ method: "POST" })
  .validator((data: { taskId: string; body: string }) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    const body = data.body.trim();
    if (!body) throw new Error("Empty comment");
    const task = await sql`select id, assignee_id, title from tasks where id = ${data.taskId} and org_id = ${org.id}`;
    if (!task[0]) throw new Error("Not found");
    const id = nid("cmt");
    await sql`insert into comments (id, org_id, task_id, author_id, body) values (${id}, ${org.id}, ${data.taskId}, ${me.id}, ${body})`;
    if (task[0].assignee_id && task[0].assignee_id !== me.id) {
      await notify(sql, org.id, String(task[0].assignee_id), "comment", "New comment", `${me.displayName} on ${task[0].title}`, `/tasks/${data.taskId}`);
    }
    return { id };
  });

export const toggleChecklist = createServerFn({ method: "POST" })
  .validator((data: { id: string; done: boolean }) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { sql, org } = await ensureActor(context.userId);
    await sql`update checklist_items set done = ${data.done} where id = ${data.id} and task_id in (select id from tasks where org_id = ${org.id})`;
    return { ok: true };
  });

export const addChecklistItem = createServerFn({ method: "POST" })
  .validator((data: { taskId: string; title: string }) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { sql, org } = await ensureActor(context.userId);
    const task = await sql`select id from tasks where id = ${data.taskId} and org_id = ${org.id}`;
    if (!task[0]) throw new Error("Not found");
    const id = nid("chk");
    await sql`insert into checklist_items (id, task_id, title, done, position) values (${id}, ${data.taskId}, ${data.title.trim()}, ${false}, ${Date.now()})`;
    return { id };
  });

export const listChannels = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    const rows = await sql`select c.*,
      (select count(*)::int from messages m
        join channel_members cm2 on cm2.channel_id = c.id and cm2.profile_id = ${me.id}
        where m.channel_id = c.id and (cm2.last_read_at is null or m.created_at > cm2.last_read_at)
          and m.author_id != ${me.id}
      ) as unread
      from channels c
      join channel_members cm on cm.channel_id = c.id and cm.profile_id = ${me.id}
      where c.org_id = ${org.id}
      order by c.type, c.name`;
    return rows.map((r) => mapChannel(r, Number(r.unread ?? 0)));
  });

export const listMessages = createServerFn({ method: "GET" })
  .validator((channelId: string) => channelId)
  .middleware([authMiddleware])
  .handler(async ({ context, data: channelId }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    const allowed = await sql`select 1 from channel_members cm join channels c on c.id = cm.channel_id where cm.channel_id = ${channelId} and cm.profile_id = ${me.id} and c.org_id = ${org.id}`;
    if (!allowed[0]) throw new Error("Forbidden");
    const rows = await sql`select * from messages where channel_id = ${channelId} order by created_at asc limit 200`;
    const ids = rows.map((r) => String(r.id));
    const reactions = ids.length
      ? await sql.query<{ message_id: string; emoji: string; profile_id: string }>(
          `select message_id, emoji, profile_id from message_reactions where message_id in (${ids.map((_, i) => `$${i + 1}`).join(",")})`,
          ids,
        )
      : [];
    const grouped = new Map<string, Map<string, string[]>>();
    for (const r of reactions) {
      const byMsg = grouped.get(r.message_id) ?? new Map();
      const list = byMsg.get(r.emoji) ?? [];
      list.push(r.profile_id);
      byMsg.set(r.emoji, list);
      grouped.set(r.message_id, byMsg);
    }
    await sql`update channel_members set last_read_at = now() where channel_id = ${channelId} and profile_id = ${me.id}`;
    return rows.map((row) => {
      const byEmoji = grouped.get(String(row.id));
      const rx = byEmoji
        ? [...byEmoji.entries()].map(([emoji, profileIds]) => ({ emoji, profileIds }))
        : [];
      return mapMessage(row, rx);
    });
  });

export const sendMessage = createServerFn({ method: "POST" })
  .validator((data: { channelId: string; body: string; parentId?: string }) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    const body = data.body.trim();
    if (!body) throw new Error("Empty message");
    const allowed = await sql`select 1 from channel_members cm join channels c on c.id = cm.channel_id where cm.channel_id = ${data.channelId} and cm.profile_id = ${me.id} and c.org_id = ${org.id}`;
    if (!allowed[0]) throw new Error("Forbidden");
    const id = nid("msg");
    await sql`insert into messages (id, channel_id, author_id, body, parent_id) values (${id}, ${data.channelId}, ${me.id}, ${body}, ${data.parentId ?? null})`;
    const people = await sql<{ id: string; display_name: string }>`select id, display_name from profiles where org_id = ${org.id} and status = ${"active"}`;
    const lower = body.toLowerCase();
    for (const p of people) {
      if (p.id === me.id) continue;
      const name = p.display_name.toLowerCase();
      const first = name.split(/\s+/)[0] ?? name;
      if (lower.includes(`@${name}`) || lower.includes(`@${first}`)) {
        await notify(sql, org.id, p.id, "mention", "You were mentioned", `${me.displayName}: ${body.slice(0, 120)}`, `/chat?channel=${data.channelId}`);
      }
    }
    return { id };
  });

export const toggleReaction = createServerFn({ method: "POST" })
  .validator((data: { messageId: string; emoji: string }) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    const emoji = data.emoji.trim().slice(0, 16);
    if (!emoji) throw new Error("Reaction required");
    const allowed = await sql`
      select 1 from messages m
      join channels c on c.id = m.channel_id
      join channel_members cm on cm.channel_id = c.id
      where m.id = ${data.messageId} and c.org_id = ${org.id} and cm.profile_id = ${me.id}`;
    if (!allowed[0]) throw new Error("Forbidden");
    const existing = await sql`select 1 from message_reactions where message_id = ${data.messageId} and profile_id = ${me.id} and emoji = ${emoji}`;
    if (existing[0]) {
      await sql`delete from message_reactions where message_id = ${data.messageId} and profile_id = ${me.id} and emoji = ${emoji}`;
    } else {
      await sql`insert into message_reactions (message_id, profile_id, emoji) values (${data.messageId}, ${me.id}, ${emoji})`;
    }
    return { ok: true };
  });

export const editMessage = createServerFn({ method: "POST" })
  .validator((data: { id: string; body: string }) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    const body = data.body.trim();
    if (!body) throw new Error("Empty message");
    const row = await sql`
      select m.id from messages m
      join channels c on c.id = m.channel_id
      where m.id = ${data.id} and m.author_id = ${me.id} and c.org_id = ${org.id}`;
    if (!row[0]) throw new Error("Forbidden");
    await sql`update messages set body = ${body}, edited_at = now() where id = ${data.id}`;
    return { ok: true };
  });

export const deleteMessage = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .middleware([authMiddleware])
  .handler(async ({ context, data: id }) => {
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

export const openDirectMessage = createServerFn({ method: "POST" })
  .validator((profileId: string) => profileId)
  .middleware([authMiddleware])
  .handler(async ({ context, data: profileId }) => {
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

export const listNotifications = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql, me } = await ensureActor(context.userId);
    const rows = await sql`select * from notifications where profile_id = ${me.id} order by created_at desc limit 50`;
    return rows.map(mapNotification);
  });

export const markNotificationsRead = createServerFn({ method: "POST" })
  .validator((id?: string) => id)
  .middleware([authMiddleware])
  .handler(async ({ context, data: id }) => {
    const { sql, me } = await ensureActor(context.userId);
    if (id) await sql`update notifications set read = true where id = ${id} and profile_id = ${me.id}`;
    else await sql`update notifications set read = true where profile_id = ${me.id}`;
    return { ok: true };
  });

export const listFiles = createServerFn({ method: "GET" })
  .validator((data: { q?: string } = {}) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { sql, org } = await ensureActor(context.userId);
    const q = data.q?.trim();
    const rows = q
      ? await sql`select * from attachments where org_id = ${org.id} and name ilike ${`%${q}%`} order by created_at desc`
      : await sql`select * from attachments where org_id = ${org.id} order by created_at desc`;
    return rows.map(mapAttachment);
  });

export const addFile = createServerFn({ method: "POST" })
  .validator((data: { name: string; mime?: string; sizeBytes?: number; projectId?: string; taskId?: string }) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    const id = nid("file");
    await sql`insert into attachments (id, org_id, name, mime, size_bytes, project_id, task_id, uploaded_by)
      values (${id}, ${org.id}, ${data.name}, ${data.mime ?? "application/octet-stream"}, ${data.sizeBytes ?? 0}, ${data.projectId ?? null}, ${data.taskId ?? null}, ${me.id})`;
    await writeActivity(sql, org.id, me.id, "file", id, "upload", `Uploaded ${data.name}`);
    await writeAudit(sql, org.id, me.id, "file.uploaded", "file", id, `Uploaded ${data.name}`);
    return { id };
  });

export const startTimer = createServerFn({ method: "POST" })
  .validator((taskId?: string) => taskId)
  .middleware([authMiddleware])
  .handler(async ({ context, data: taskId }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    const open = await sql`select id from time_entries where profile_id = ${me.id} and ended_at is null`;
    if (open[0]) throw new Error("A timer is already running");
    const id = nid("te");
    await sql`insert into time_entries (id, org_id, profile_id, task_id, started_at) values (${id}, ${org.id}, ${me.id}, ${taskId ?? null}, now())`;
    return { id };
  });

export const stopTimer = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql, me } = await ensureActor(context.userId);
    const open = await sql`select * from time_entries where profile_id = ${me.id} and ended_at is null order by started_at desc limit 1`;
    if (!open[0]) return { ok: false };
    const started = new Date(toIso(open[0].started_at)).getTime();
    const minutes = Math.max(1, Math.round((Date.now() - started) / 60000));
    await sql`update time_entries set ended_at = now(), minutes = ${minutes} where id = ${open[0].id as string}`;
    if (open[0].task_id) {
      await sql`update tasks set actual_minutes = actual_minutes + ${minutes}, updated_at = now() where id = ${open[0].task_id as string}`;
    }
    return { ok: true, minutes };
  });

export const addTimeEntry = createServerFn({ method: "POST" })
  .validator((data: { taskId?: string; minutes: number; note?: string }) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    const minutes = Math.max(1, Math.round(data.minutes));
    const id = nid("te");
    await sql`insert into time_entries (id, org_id, profile_id, task_id, started_at, ended_at, minutes, note)
      values (${id}, ${org.id}, ${me.id}, ${data.taskId ?? null}, now(), now(), ${minutes}, ${data.note ?? ""})`;
    if (data.taskId) {
      await sql`update tasks set actual_minutes = actual_minutes + ${minutes}, updated_at = now() where id = ${data.taskId} and org_id = ${org.id}`;
    }
    return { id };
  });

export const listTimeEntries = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql, me } = await ensureActor(context.userId);
    const rows = await sql`select * from time_entries where profile_id = ${me.id} order by started_at desc limit 40`;
    return rows.map(mapTime);
  });

export const listEvents = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql, org } = await ensureActor(context.userId);
    const events = (await sql`select * from calendar_events where org_id = ${org.id} order by starts_at`).map(mapEvent);
    const tasks = await sql<{ id: string; title: string; due_date: string; project_id: string | null }>`
      select id, title, due_date, project_id from tasks where org_id = ${org.id} and parent_id is null and due_date is not null`;
    return {
      events,
      deadlines: tasks.map((t) => ({
        id: t.id,
        title: t.title,
        date: String(t.due_date),
        projectId: t.project_id,
      })),
    };
  });

export const getAnalytics = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    const today = new Date().toISOString().slice(0, 10);
    const visible = await visibleProfileIds(sql, org.id, me);
    const visSql = visible ? " and assignee_id = any($2::text[])" : "";
    const visParams = visible ? [org.id, visible] : [org.id];
    const byStatus = await sql.query<{ status: string; c: number }>(
      `select status, count(*)::int as c from tasks where org_id = $1 and parent_id is null${visSql} group by status`,
      visParams,
    );
    const byProject = await sql<{ id: string; name: string; total: number; done: number; minutes: number }>`
      select p.id, p.name,
        (select count(*)::int from tasks t where t.project_id = p.id and t.parent_id is null) as total,
        (select count(*)::int from tasks t where t.project_id = p.id and t.parent_id is null and t.status = 'completed') as done,
        (select coalesce(sum(actual_minutes),0)::int from tasks t where t.project_id = p.id) as minutes
      from projects p where p.org_id = ${org.id} order by p.name`;
    const workloadRaw = await sql<{ id: string; name: string; active: number; completed: number; overdue: number; minutes: number }>`
      select p.id, p.display_name as name,
        (select count(*)::int from tasks t where t.assignee_id = p.id and t.parent_id is null and t.status not in ('completed','backlog')) as active,
        (select count(*)::int from tasks t where t.assignee_id = p.id and t.parent_id is null and t.status = 'completed') as completed,
        (select count(*)::int from tasks t where t.assignee_id = p.id and t.parent_id is null and t.status != 'completed' and t.due_date is not null and t.due_date < ${today}) as overdue,
        (select coalesce(sum(minutes),0)::int from time_entries te where te.profile_id = p.id) as minutes
      from profiles p where p.org_id = ${org.id} and p.status = 'active' order by name`;
    const workload = visible ? workloadRaw.filter((w) => visible.includes(w.id)) : workloadRaw;
    const trend = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const row = await sql<{ c: number }>`select count(*)::int as c from tasks where org_id = ${org.id} and status = ${"completed"} and parent_id is null and updated_at::date = ${key}::date`;
      trend.push({ date: key, completed: row[0]?.c ?? 0 });
    }
    const mine = {
      active: workload.find((w) => w.id === me.id)?.active ?? 0,
      completed: workload.find((w) => w.id === me.id)?.completed ?? 0,
      overdue: workload.find((w) => w.id === me.id)?.overdue ?? 0,
      minutes: workload.find((w) => w.id === me.id)?.minutes ?? 0,
    };
    return { byStatus, byProject, workload, trend, mine, role: me.role };
  });

export const searchAll = createServerFn({ method: "GET" })
  .validator((q: string) => q)
  .middleware([authMiddleware])
  .handler(async ({ context, data: q }): Promise<SearchHit[]> => {
    const { sql, org } = await ensureActor(context.userId);
    const term = q.trim();
    if (term.length < 1) return [];
    const like = `%${term}%`;
    const hits: SearchHit[] = [];
    const tasks = await sql`select id, title, status from tasks where org_id = ${org.id} and title ilike ${like} limit 8`;
    for (const t of tasks) hits.push({ kind: "task", id: String(t.id), title: String(t.title), subtitle: String(t.status), href: `/tasks/${t.id}` });
    const projects = await sql`select id, name, status from projects where org_id = ${org.id} and name ilike ${like} limit 5`;
    for (const p of projects) hits.push({ kind: "project", id: String(p.id), title: String(p.name), subtitle: String(p.status), href: `/projects/${p.id}` });
    const people = await sql`select id, display_name, title from profiles where org_id = ${org.id} and (display_name ilike ${like} or coalesce(email,'') ilike ${like} or coalesce(work_email,'') ilike ${like} or coalesce(employee_code,'') ilike ${like}) limit 5`;
    for (const p of people) hits.push({ kind: "person", id: String(p.id), title: String(p.display_name), subtitle: String(p.title), href: `/employees/${p.id}` });
    const files = await sql`select id, name from attachments where org_id = ${org.id} and name ilike ${like} limit 5`;
    for (const f of files) hits.push({ kind: "file", id: String(f.id), title: String(f.name), subtitle: "File", href: `/files` });
    const messages = await sql`select id, body, channel_id from messages where channel_id in (select id from channels where org_id = ${org.id}) and body ilike ${like} limit 5`;
    for (const m of messages) hits.push({ kind: "message", id: String(m.id), title: String(m.body).slice(0, 80), subtitle: "Message", href: `/chat?channel=${m.channel_id}` });
    return hits;
  });

export const getAdmin = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    if (!hasPerm(me.role, "employee.update") && !hasPerm(me.role, "admin.audit_logs")) throw new Error("Forbidden");
    const members = (await sql`select * from profiles where org_id = ${org.id} order by role, display_name`).map(mapProfile);
    const audit = hasPerm(me.role, "admin.audit_logs")
      ? (await sql`select * from audit_logs where org_id = ${org.id} order by created_at desc limit 40`).map((r) => ({
          id: String(r.id),
          actorId: r.actor_id ? String(r.actor_id) : null,
          action: String(r.action),
          targetType: String(r.target_type),
          targetId: String(r.target_id),
          summary: String(r.summary),
          createdAt: toIso(r.created_at),
        }))
      : [];
    return { members, audit } satisfies { members: ReturnType<typeof mapProfile>[]; audit: AuditItem[] };
  });

export const updateMember = createServerFn({ method: "POST" })
  .validator((data: { id: string; role?: string; status?: string; title?: string }) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    if (!hasPerm(me.role, "employee.update")) throw new Error("Forbidden");
    if (data.id === me.id && data.role && data.role !== me.role) throw new Error("You cannot change your own role");
    const current = await sql`select * from profiles where id = ${data.id} and org_id = ${org.id}`;
    if (!current[0]) throw new Error("Not found");
    const currentRole = String(current[0].role) as import("@/lib/types").Role;
    if (currentRole === "ceo" && (data.role || data.status === "disabled")) {
      throw new Error("The CEO cannot be modified");
    }
    if (!canModifyPerson(me.role, currentRole)) throw new Error("You cannot change this person");
    if (data.role && !assignableRoles(me.role).includes(data.role as import("@/lib/types").Role)) {
      throw new Error("You cannot assign that role");
    }
    const role = data.role ?? String(current[0].role);
    const status = data.status ?? String(current[0].status);
    const title = data.title ?? String(current[0].title);
    await sql`update profiles set role = ${role}, status = ${status}, title = ${title} where id = ${data.id}`;
    await writeAudit(sql, org.id, me.id, "member.updated", "profile", data.id, `Updated ${current[0].display_name}`);
    return { ok: true };
  });

export const inviteMember = createServerFn({ method: "POST" })
  .validator((data: { name: string; email: string; title?: string; role?: string }) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    if (!hasPerm(me.role, "employee.create")) throw new Error("Only the CEO, a director or a manager can enroll employees");
    const email = data.email.trim().toLowerCase();
    const name = data.name.trim();
    if (!email || !name) throw new Error("Name and email are required");
    const role = (data.role ?? "employee") as "ceo" | "founder" | "manager" | "team_lead" | "employee";
    if (!assignableRoles(me.role).includes(role)) throw new Error("You cannot assign that role");
    const exists = await sql`select id from profiles where org_id = ${org.id} and (
      lower(coalesce(email,'')) = ${email} or lower(coalesce(work_email,'')) = ${email}
    )`;
    if (exists[0]) throw new Error("A member with that email already exists");
    const id = nid("prf");
    const code = await nextEmployeeCode(sql, org.id);
    await sql`insert into profiles (id, org_id, email, work_email, display_name, title, role, avatar_key, status, employee_code, username, invited_by)
      values (${id}, ${org.id}, ${email}, ${email}, ${name}, ${data.title ?? "Employee"}, ${role}, ${"zinc"}, ${"invited"}, ${code}, ${email.split("@")[0]}, ${me.id})`;
    const general = await sql`select id from channels where org_id = ${org.id} and name = ${"general"} limit 1`;
    if (general[0]) await sql`insert into channel_members (channel_id, profile_id) values (${general[0].id as string}, ${id}) on conflict do nothing`;
    await writeAudit(sql, org.id, me.id, "member.invited", "profile", id, `Invited ${name}`);
    await notify(sql, org.id, id, "employee", "You're enrolled in TRONX", `Your employee ID is ${code}. Sign in with ${email}.`, "/");
    return { id, employeeCode: code };
  });

export const askTronxAi = createServerFn({ method: "POST" })
  .validator((data: { prompt: string }) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    const prompt = data.prompt.trim();
    if (!prompt) return { ok: false as const, error: "Ask something first." };
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "TRONX AI is not available in this environment." };

    const today = new Date().toISOString().slice(0, 10);
    const visible = await visibleProfileIds(sql, org.id, me);
    const visSql = visible ? " and assignee_id = any($3::text[])" : "";
    const visParams = visible ? [org.id, today, visible] : [org.id, today];
    const projects =
      me.role === "employee"
        ? await sql`select name, status from projects p where org_id = ${org.id} and (
            owner_id = ${me.id}
            or exists (select 1 from project_members pm where pm.project_id = p.id and pm.profile_id = ${me.id})
          )`
        : await sql`select name, status from projects where org_id = ${org.id}`;
    const overdue = await sql.query<{ title: string; assignee_id: string | null }>(
      `select title, assignee_id from tasks where org_id = $1 and parent_id is null and status != 'completed' and due_date is not null and due_date < $2${visSql} limit 20`,
      visParams,
    );
    const blocked = await sql.query<{ title: string; blocked_reason: string }>(
      `select title, blocked_reason from tasks where org_id = $1 and blocked = true and status != 'completed'${visible ? " and assignee_id = any($2::text[])" : ""}`,
      visible ? [org.id, visible] : [org.id],
    );
    const dueToday = await sql.query<{ title: string; assignee_id: string | null }>(
      `select title, assignee_id, project_id from tasks where org_id = $1 and parent_id is null and due_date = $2 and status != 'completed'${visSql}`,
      visParams,
    );
    const members = await sql`select id, display_name, title, role from profiles where org_id = ${org.id} and status = 'active'`;
    const workload = await sql<{ name: string; active: number }>`
      select p.display_name as name,
        (select count(*)::int from tasks t where t.assignee_id = p.id and t.parent_id is null and t.status not in ('completed','backlog')) as active
      from profiles p where p.org_id = ${org.id}`;
    const recent = visible
      ? await sql.query(
          `select summary, created_at from activity_logs where org_id = $1 and (actor_id = any($2::text[]) or entity_id = any($2::text[])) order by created_at desc limit 12`,
          [org.id, visible],
        )
      : await sql`select summary, created_at from activity_logs where org_id = ${org.id} order by created_at desc limit 12`;
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
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 900,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!res.ok) return { ok: false as const, error: `TRONX AI is temporarily unavailable (${res.status}).` };
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return { ok: true as const, text: body.choices?.[0]?.message?.content ?? "No response." };
  });

export const listActivity = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql, org } = await ensureActor(context.userId);
    const rows = await sql`select * from activity_logs where org_id = ${org.id} order by created_at desc limit 40`;
    return rows.map(mapActivity);
  });
