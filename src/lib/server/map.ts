import type {
  ActivityItem,
  Announcement,
  Attachment,
  CalendarEvent,
  Channel,
  ChatMessage,
  ChecklistItem,
  Comment,
  Department,
  EmploymentType,
  Milestone,
  Notification,
  Organization,
  Priority,
  Profile,
  Project,
  ProjectMemberRole,
  ProjectStatus,
  Role,
  Task,
  TaskStatus,
  Team,
  TimeEntry,
} from "@/lib/types";
import { ROLES } from "@/lib/types";
import { toIso } from "@/lib/utils";

export function asString(v: unknown, fallback = ""): string {
  if (v == null) return fallback;
  return String(v);
}

export function asNum(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function mapOrg(r: Record<string, unknown>): Organization {
  return { id: asString(r.id), name: asString(r.name), slug: asString(r.slug) };
}

function asRole(v: unknown): Role {
  const s = asString(v, "employee");
  return (ROLES as readonly string[]).includes(s) ? (s as Role) : "employee";
}

function asStatus(v: unknown): Profile["status"] {
  if (v === "disabled" || v === "invited") return v;
  return "active";
}

export function mapProfile(r: Record<string, unknown>): Profile {
  return {
    id: asString(r.id),
    orgId: asString(r.org_id),
    userId: r.user_id ? asString(r.user_id) : null,
    email: r.email ? asString(r.email) : null,
    displayName: asString(r.display_name),
    title: asString(r.title, "Member"),
    role: asRole(r.role),
    status: asStatus(r.status),
    avatarKey: asString(r.avatar_key, "slate"),
    lastSeenAt: r.last_seen_at ? toIso(r.last_seen_at) : null,
    createdAt: toIso(r.created_at),
    employeeCode: r.employee_code ? asString(r.employee_code) : null,
    phone: r.phone ? asString(r.phone) : null,
    gender: r.gender ? asString(r.gender) : null,
    dob: r.dob ? asString(r.dob) : null,
    emergencyContact: r.emergency_contact ? asString(r.emergency_contact) : null,
    employmentType: (asString(r.employment_type, "full_time") as EmploymentType) || "full_time",
    location: r.location ? asString(r.location) : null,
    workEmail: r.work_email ? asString(r.work_email) : null,
    username: r.username ? asString(r.username) : null,
    bio: asString(r.bio),
    skills: asString(r.skills)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    notes: asString(r.notes),
    managerId: r.manager_id ? asString(r.manager_id) : null,
    teamLeadId: r.team_lead_id ? asString(r.team_lead_id) : null,
    departmentId: r.department_id ? asString(r.department_id) : null,
    teamId: r.team_id ? asString(r.team_id) : null,
    joiningDate: r.joining_date ? asString(r.joining_date) : null,
  };
}

export function mapDepartment(r: Record<string, unknown>): Department {
  return {
    id: asString(r.id),
    orgId: asString(r.org_id),
    name: asString(r.name),
    description: asString(r.description),
    headId: r.head_id ? asString(r.head_id) : null,
  };
}

export function mapAnnouncement(r: Record<string, unknown>): Announcement {
  return {
    id: asString(r.id),
    authorId: r.author_id ? asString(r.author_id) : null,
    title: asString(r.title),
    body: asString(r.body),
    scope: asString(r.scope, "company"),
    createdAt: toIso(r.created_at),
  };
}

export function mapTeam(r: Record<string, unknown>, memberIds: string[] = []): Team {
  return {
    id: asString(r.id),
    orgId: asString(r.org_id),
    name: asString(r.name),
    description: asString(r.description),
    leadId: r.lead_id ? asString(r.lead_id) : null,
    departmentId: r.department_id ? asString(r.department_id) : null,
    memberIds,
  };
}

export function mapProject(
  r: Record<string, unknown>,
  memberIds: string[] = [],
  memberRoles: Record<string, ProjectMemberRole> = {},
): Project {
  const total = asNum(r.task_total);
  const done = asNum(r.task_done);
  return {
    id: asString(r.id),
    orgId: asString(r.org_id),
    name: asString(r.name),
    description: asString(r.description),
    ownerId: r.owner_id ? asString(r.owner_id) : null,
    teamId: r.team_id ? asString(r.team_id) : null,
    status: (r.status as ProjectStatus) ?? "active",
    priority: (r.priority as Priority) ?? "medium",
    startDate: r.start_date ? asString(r.start_date) : null,
    dueDate: r.due_date ? asString(r.due_date) : null,
    colorKey: asString(r.color_key, "mist"),
    createdAt: toIso(r.created_at),
    memberIds,
    memberRoles,
    taskTotal: total,
    taskDone: done,
    progress: total > 0 ? Math.round((done / total) * 100) : 0,
  };
}

export function mapTask(r: Record<string, unknown>): Task {
  const status = (asString(r.status, "todo") as TaskStatus) || "todo";
  return {
    id: asString(r.id),
    orgId: asString(r.org_id),
    projectId: r.project_id ? asString(r.project_id) : null,
    parentId: r.parent_id ? asString(r.parent_id) : null,
    title: asString(r.title),
    description: asString(r.description),
    creatorId: r.creator_id ? asString(r.creator_id) : null,
    assigneeId: r.assignee_id ? asString(r.assignee_id) : null,
    teamId: r.team_id ? asString(r.team_id) : null,
    status,
    priority: (r.priority as Priority) ?? "medium",
    startDate: r.start_date ? asString(r.start_date) : null,
    dueDate: r.due_date ? asString(r.due_date) : null,
    estimatedMinutes: asNum(r.estimated_minutes),
    actualMinutes: asNum(r.actual_minutes),
    blocked: Boolean(r.blocked) || status === "blocked",
    blockedReason: asString(r.blocked_reason),
    tags: asString(r.tags)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    createdAt: toIso(r.created_at),
    updatedAt: toIso(r.updated_at),
    checklistTotal: asNum(r.checklist_total),
    checklistDone: asNum(r.checklist_done),
    commentCount: asNum(r.comment_count),
    subtaskCount: asNum(r.subtask_count),
  };
}

export function mapMilestone(r: Record<string, unknown>): Milestone {
  return {
    id: asString(r.id),
    projectId: asString(r.project_id),
    title: asString(r.title),
    dueDate: r.due_date ? asString(r.due_date) : null,
    status: r.status === "done" ? "done" : "open",
  };
}

export function mapComment(r: Record<string, unknown>): Comment {
  return {
    id: asString(r.id),
    taskId: asString(r.task_id),
    authorId: r.author_id ? asString(r.author_id) : null,
    body: asString(r.body),
    createdAt: toIso(r.created_at),
  };
}

export function mapChecklist(r: Record<string, unknown>): ChecklistItem {
  return {
    id: asString(r.id),
    taskId: asString(r.task_id),
    title: asString(r.title),
    done: Boolean(r.done),
    position: asNum(r.position),
  };
}

export function mapChannel(r: Record<string, unknown>, unread = 0): Channel {
  const type = asString(r.type, "company") as Channel["type"];
  return {
    id: asString(r.id),
    orgId: asString(r.org_id),
    type,
    name: asString(r.name),
    projectId: r.project_id ? asString(r.project_id) : null,
    teamId: r.team_id ? asString(r.team_id) : null,
    unread,
  };
}

export function mapMessage(
  r: Record<string, unknown>,
  reactions: ChatMessage["reactions"] = [],
): ChatMessage {
  return {
    id: asString(r.id),
    channelId: asString(r.channel_id),
    authorId: r.author_id ? asString(r.author_id) : null,
    body: asString(r.body),
    parentId: r.parent_id ? asString(r.parent_id) : null,
    createdAt: toIso(r.created_at),
    editedAt: r.edited_at ? toIso(r.edited_at) : null,
    reactions,
  };
}

export function mapAttachment(r: Record<string, unknown>): Attachment {
  return {
    id: asString(r.id),
    name: asString(r.name),
    mime: asString(r.mime),
    sizeBytes: asNum(r.size_bytes),
    projectId: r.project_id ? asString(r.project_id) : null,
    taskId: r.task_id ? asString(r.task_id) : null,
    messageId: r.message_id ? asString(r.message_id) : null,
    uploadedBy: r.uploaded_by ? asString(r.uploaded_by) : null,
    createdAt: toIso(r.created_at),
  };
}

export function mapNotification(r: Record<string, unknown>): Notification {
  return {
    id: asString(r.id),
    type: asString(r.type),
    title: asString(r.title),
    body: asString(r.body),
    href: asString(r.href),
    read: Boolean(r.read),
    createdAt: toIso(r.created_at),
  };
}

export function mapTime(r: Record<string, unknown>): TimeEntry {
  return {
    id: asString(r.id),
    profileId: asString(r.profile_id),
    taskId: r.task_id ? asString(r.task_id) : null,
    startedAt: toIso(r.started_at),
    endedAt: r.ended_at ? toIso(r.ended_at) : null,
    minutes: asNum(r.minutes),
    note: asString(r.note),
  };
}

export function mapEvent(r: Record<string, unknown>): CalendarEvent {
  return {
    id: asString(r.id),
    title: asString(r.title),
    startsAt: toIso(r.starts_at),
    endsAt: toIso(r.ends_at),
    type: asString(r.type, "meeting"),
    projectId: r.project_id ? asString(r.project_id) : null,
    meetingId: r.meeting_id ? asString(r.meeting_id) : null,
  };
}

export function mapActivity(r: Record<string, unknown>): ActivityItem {
  return {
    id: asString(r.id),
    actorId: r.actor_id ? asString(r.actor_id) : null,
    entityType: asString(r.entity_type),
    entityId: asString(r.entity_id),
    action: asString(r.action),
    summary: asString(r.summary),
    createdAt: toIso(r.created_at),
  };
}

export const TASK_SELECT = `
  t.*,
  (select count(*)::int from checklist_items c where c.task_id = t.id) as checklist_total,
  (select count(*)::int from checklist_items c where c.task_id = t.id and c.done) as checklist_done,
  (select count(*)::int from comments c where c.task_id = t.id) as comment_count,
  (select count(*)::int from tasks s where s.parent_id = t.id) as subtask_count
`;
