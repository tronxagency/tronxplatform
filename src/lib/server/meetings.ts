import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import type { Sql } from "@/lib/db";
import { canStartMeeting, hasPerm, isExecOffice, type MeetingScope } from "@/lib/permissions";
import type { Meeting } from "@/lib/types";
import { nid, toIso } from "@/lib/utils";
import { ensureActor, notify, writeActivity, writeAudit } from "./actor";
import { asString } from "./map";

export function mapMeeting(r: Record<string, unknown>, participantIds: string[] = []): Meeting {
  const status = asString(r.status, "scheduled");
  const scope = asString(r.scope, "direct") as Meeting["scope"];
  return {
    id: asString(r.id),
    orgId: asString(r.org_id),
    title: asString(r.title),
    description: asString(r.description),
    organizerId: r.organizer_id ? asString(r.organizer_id) : null,
    scope: ["company", "department", "team", "project", "direct", "selected"].includes(scope)
      ? scope
      : "direct",
    departmentId: r.department_id ? asString(r.department_id) : null,
    teamId: r.team_id ? asString(r.team_id) : null,
    projectId: r.project_id ? asString(r.project_id) : null,
    taskId: r.task_id ? asString(r.task_id) : null,
    startsAt: toIso(r.starts_at),
    endsAt: r.ends_at ? toIso(r.ends_at) : null,
    meetUrl: r.meet_url ? asString(r.meet_url) : null,
    meetProvider: asString(r.meet_provider, "google_meet"),
    status: ["scheduled", "live", "ended", "cancelled"].includes(status)
      ? (status as Meeting["status"])
      : "scheduled",
    createdAt: toIso(r.created_at),
    participantIds,
  };
}

async function resolveParticipants(
  sql: Sql,
  orgId: string,
  data: {
    scope: MeetingScope;
    departmentId?: string;
    teamId?: string;
    projectId?: string;
    profileIds?: string[];
    organizerId: string;
  },
): Promise<string[]> {
  const ids = new Set<string>([data.organizerId]);
  if (data.scope === "company") {
    const rows = await sql<{ id: string }>`select id from profiles where org_id = ${orgId} and status = ${"active"}`;
    for (const r of rows) ids.add(r.id);
  } else if (data.scope === "department" && data.departmentId) {
    const rows = await sql<{ id: string }>`select id from profiles where org_id = ${orgId} and department_id = ${data.departmentId} and status != ${"disabled"}`;
    for (const r of rows) ids.add(r.id);
  } else if (data.scope === "team" && data.teamId) {
    const rows = await sql<{ profile_id: string }>`select profile_id from team_members where team_id = ${data.teamId}`;
    for (const r of rows) ids.add(r.profile_id);
  } else if (data.scope === "project" && data.projectId) {
    const rows = await sql<{ profile_id: string }>`select profile_id from project_members where project_id = ${data.projectId}`;
    for (const r of rows) ids.add(r.profile_id);
  } else if (data.profileIds) {
    for (const id of data.profileIds) ids.add(id);
  }
  return [...ids];
}

export const createMeeting = createServerFn({ method: "POST" })
  .validator((data: {
    title?: string;
    description?: string;
    scope: MeetingScope;
    departmentId?: string;
    teamId?: string;
    projectId?: string;
    taskId?: string;
    profileIds?: string[];
    startsAt?: string;
    durationMinutes?: number;
    meetUrl?: string;
    instant?: boolean;
  }) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    if (!canStartMeeting(me.role, data.scope)) throw new Error("You cannot start that kind of meeting");
    if (data.scope === "company" && !hasPerm(me.role, "meeting.company")) throw new Error("Forbidden");
    const id = nid("mtg");
    const instant = Boolean(data.instant);
    const starts = data.startsAt ? new Date(data.startsAt) : new Date();
    const duration = data.durationMinutes ?? (instant ? 30 : 30);
    const ends = new Date(starts.getTime() + duration * 60_000);
    const title =
      data.title?.trim() ||
      (data.scope === "company"
        ? "Company meeting"
        : data.scope === "team"
          ? "Team sync"
          : data.scope === "project"
            ? "Project sync"
            : instant
              ? "Instant meeting"
              : "Meeting");
    const status = instant ? "live" : "scheduled";
    await sql`insert into meetings (
      id, org_id, title, description, organizer_id, scope, department_id, team_id, project_id, task_id,
      starts_at, ends_at, meet_url, meet_provider, status
    ) values (
      ${id}, ${org.id}, ${title}, ${data.description ?? ""}, ${me.id}, ${data.scope},
      ${data.departmentId ?? null}, ${data.teamId ?? null}, ${data.projectId ?? null}, ${data.taskId ?? null},
      ${starts.toISOString()}, ${ends.toISOString()}, ${data.meetUrl ?? null}, ${"google_meet"}, ${status}
    )`;
    const participants = await resolveParticipants(sql, org.id, {
      scope: data.scope,
      departmentId: data.departmentId,
      teamId: data.teamId,
      projectId: data.projectId,
      profileIds: data.profileIds,
      organizerId: me.id,
    });
    for (const pid of participants) {
      await sql`insert into meeting_participants (meeting_id, profile_id, role, rsvp)
        values (${id}, ${pid}, ${pid === me.id ? "organizer" : "attendee"}, ${pid === me.id ? "accepted" : "invited"})
        on conflict do nothing`;
      if (pid !== me.id) {
        await notify(
          sql,
          org.id,
          pid,
          "meeting",
          instant ? "Join meeting now" : "You're invited to a meeting",
          title,
          `/meetings/${id}`,
        );
      }
    }
    const evId = nid("evt");
    await sql`insert into calendar_events (id, org_id, title, starts_at, ends_at, type, project_id, meeting_id)
      values (${evId}, ${org.id}, ${title}, ${starts.toISOString()}, ${ends.toISOString()}, ${"meeting"}, ${data.projectId ?? null}, ${id})`;
    await writeActivity(sql, org.id, me.id, "meeting", id, instant ? "started" : "scheduled", `${instant ? "Started" : "Scheduled"} ${title}`);
    await writeAudit(sql, org.id, me.id, "meeting.created", "meeting", id, title);
    return { id };
  });

export const listMeetings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    const rows = await sql`
      select m.* from meetings m
      join meeting_participants mp on mp.meeting_id = m.id
      where m.org_id = ${org.id} and mp.profile_id = ${me.id} and m.status != ${"cancelled"}
      order by m.starts_at desc
      limit 80`;
    const ids = rows.map((r) => asString(r.id));
    const parts = ids.length
      ? await sql.query<{ meeting_id: string; profile_id: string }>(
          `select meeting_id, profile_id from meeting_participants where meeting_id = any($1::text[])`,
          [ids],
        )
      : [];
    const by = new Map<string, string[]>();
    for (const p of parts) {
      const list = by.get(p.meeting_id) ?? [];
      list.push(p.profile_id);
      by.set(p.meeting_id, list);
    }
    return rows.map((r) => mapMeeting(r, by.get(asString(r.id)) ?? []));
  });

export const getMeeting = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .middleware([authMiddleware])
  .handler(async ({ context, data: id }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    const rows = await sql`select * from meetings where id = ${id} and org_id = ${org.id}`;
    if (!rows[0]) return null;
    const member = await sql`select 1 from meeting_participants where meeting_id = ${id} and profile_id = ${me.id}`;
    if (!member[0] && !isExecOffice(me.role)) throw new Error("Forbidden");
    const parts = await sql<{ profile_id: string; role: string; rsvp: string }>`
      select profile_id, role, rsvp from meeting_participants where meeting_id = ${id}`;
    return {
      meeting: mapMeeting(
        rows[0],
        parts.map((p) => p.profile_id),
      ),
      participants: parts,
    };
  });

export const updateMeeting = createServerFn({ method: "POST" })
  .validator((data: { id: string; meetUrl?: string; status?: Meeting["status"]; title?: string }) => data)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { sql, me, org } = await ensureActor(context.userId);
    const rows = await sql`select * from meetings where id = ${data.id} and org_id = ${org.id}`;
    if (!rows[0]) throw new Error("Not found");
    if (asString(rows[0].organizer_id) !== me.id && !isExecOffice(me.role)) {
      throw new Error("Only the organizer can update this meeting");
    }
    const meetUrl = data.meetUrl === undefined ? rows[0].meet_url : data.meetUrl || null;
    const status = data.status ?? asString(rows[0].status);
    const title = data.title ?? asString(rows[0].title);
    await sql`update meetings set meet_url = ${meetUrl}, status = ${status}, title = ${title} where id = ${data.id}`;
    if (data.status === "cancelled") {
      await writeAudit(sql, org.id, me.id, "meeting.cancelled", "meeting", data.id, title);
    }
    return { ok: true };
  });

export const googleCalendarProbe = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async () => {
    const { callTool } = await import("@/lib/app-data/client.server");
    const { ConnectorType, GoogleCalendarTools } = await import("@/lib/app-data/types");
    const result = await callTool(GoogleCalendarTools.listCalendars, {}, { connectorType: ConnectorType.GoogleCalendar });
    return {
      ok: result.ok,
      pending: Boolean(result.pending),
      loginRequired: Boolean(result.loginRequired),
      loginUrl: result.loginUrl ?? null,
      error: result.errorMessage ?? null,
    };
  });
