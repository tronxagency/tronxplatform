export const ROLES = ["ceo", "founder", "manager", "team_lead", "employee"] as const;
export type Role = (typeof ROLES)[number];

export const TASK_STATUSES = [
  "backlog",
  "todo",
  "in_progress",
  "in_review",
  "changes_requested",
  "completed",
  "blocked",
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const PRIORITIES = ["urgent", "high", "medium", "low"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PROJECT_STATUSES = ["planning", "active", "on_hold", "completed"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const EMPLOYMENT_TYPES = ["full_time", "part_time", "contract", "intern"] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export type Profile = {
  id: string;
  orgId: string;
  userId: string | null;
  email: string | null;
  displayName: string;
  title: string;
  role: Role;
  status: "active" | "disabled" | "invited";
  avatarKey: string;
  lastSeenAt: string | null;
  createdAt: string;
  employeeCode: string | null;
  phone: string | null;
  gender: string | null;
  dob: string | null;
  emergencyContact: string | null;
  employmentType: EmploymentType;
  location: string | null;
  workEmail: string | null;
  username: string | null;
  bio: string;
  skills: string[];
  notes: string;
  managerId: string | null;
  teamLeadId: string | null;
  departmentId: string | null;
  teamId: string | null;
  joiningDate: string | null;
};

export type Department = {
  id: string;
  orgId: string;
  name: string;
  description: string;
  headId: string | null;
};

export type Announcement = {
  id: string;
  authorId: string | null;
  title: string;
  body: string;
  scope: string;
  createdAt: string;
};

export type Organization = {
  id: string;
  name: string;
  slug: string;
};

export type Team = {
  id: string;
  orgId: string;
  name: string;
  description: string;
  leadId: string | null;
  departmentId: string | null;
  memberIds: string[];
};

export type Project = {
  id: string;
  orgId: string;
  name: string;
  description: string;
  ownerId: string | null;
  teamId: string | null;
  status: ProjectStatus;
  priority: Priority;
  startDate: string | null;
  dueDate: string | null;
  colorKey: string;
  createdAt: string;
  memberIds: string[];
  taskTotal: number;
  taskDone: number;
  progress: number;
};

export type Milestone = {
  id: string;
  projectId: string;
  title: string;
  dueDate: string | null;
  status: "open" | "done";
};

export type Task = {
  id: string;
  orgId: string;
  projectId: string | null;
  parentId: string | null;
  title: string;
  description: string;
  creatorId: string | null;
  assigneeId: string | null;
  teamId: string | null;
  status: TaskStatus;
  priority: Priority;
  startDate: string | null;
  dueDate: string | null;
  estimatedMinutes: number;
  actualMinutes: number;
  blocked: boolean;
  blockedReason: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  checklistTotal: number;
  checklistDone: number;
  commentCount: number;
  subtaskCount: number;
};

export type ChecklistItem = {
  id: string;
  taskId: string;
  title: string;
  done: boolean;
  position: number;
};

export type Comment = {
  id: string;
  taskId: string;
  authorId: string | null;
  body: string;
  createdAt: string;
};

export type Channel = {
  id: string;
  orgId: string;
  type: "company" | "team" | "project" | "dm" | "group" | "department";
  name: string;
  projectId: string | null;
  teamId: string | null;
  unread: number;
};

export type ChatMessage = {
  id: string;
  channelId: string;
  authorId: string | null;
  body: string;
  parentId: string | null;
  createdAt: string;
  editedAt: string | null;
  reactions: { emoji: string; profileIds: string[] }[];
};

export type Attachment = {
  id: string;
  name: string;
  mime: string;
  sizeBytes: number;
  projectId: string | null;
  taskId: string | null;
  messageId: string | null;
  uploadedBy: string | null;
  createdAt: string;
};

export type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string;
  read: boolean;
  createdAt: string;
};

export type TimeEntry = {
  id: string;
  profileId: string;
  taskId: string | null;
  startedAt: string;
  endedAt: string | null;
  minutes: number;
  note: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  type: string;
  projectId: string | null;
};

export type ActivityItem = {
  id: string;
  actorId: string | null;
  entityType: string;
  entityId: string;
  action: string;
  summary: string;
  createdAt: string;
};

export type AuditItem = {
  id: string;
  actorId: string | null;
  action: string;
  targetType: string;
  targetId: string;
  summary: string;
  createdAt: string;
};

export type WorkspacePayload = {
  org: Organization;
  me: Profile;
  members: Profile[];
  teams: Team[];
  departments: Department[];
  announcements: Announcement[];
  unreadNotifications: number;
  runningTimer: TimeEntry | null;
  openTasksByProfile: Record<string, number>;
};

export type DashboardPayload = {
  stats: {
    totalEmployees: number;
    activeEmployees: number;
    totalProjects: number;
    activeProjects: number;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdue: number;
    blocked: number;
    dueToday: number;
    myActive: number;
    myCompleted: number;
    tasksThisWeek: number;
    completedThisWeek: number;
  };
  projectProgress: { id: string; name: string; progress: number; colorKey: string }[];
  todayTasks: Task[];
  overdueTasks: Task[];
  recentActivity: ActivityItem[];
  workload: { profileId: string; name: string; active: number; completed: number; overdue: number }[];
  upcoming: { id: string; title: string; dueDate: string; type: "task" | "milestone" | "event" }[];
  announcements: Announcement[];
};

export type SearchHit = {
  kind: "task" | "project" | "person" | "message" | "file";
  id: string;
  title: string;
  subtitle: string;
  href: string;
};

export const STATUS_LABEL: Record<TaskStatus, string> = {
  backlog: "Backlog",
  todo: "Todo",
  in_progress: "In Progress",
  in_review: "In Review",
  changes_requested: "Changes Requested",
  completed: "Completed",
  blocked: "Blocked",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const ROLE_LABEL: Record<Role, string> = {
  ceo: "CEO",
  founder: "Founder / Director",
  manager: "Manager",
  team_lead: "Team Lead",
  employee: "Employee",
};

export const EMPLOYMENT_LABEL: Record<EmploymentType, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  intern: "Intern",
};

export const AVATAR_CLASS: Record<string, string> = {
  slate: "bg-slate-500",
  stone: "bg-stone-500",
  zinc: "bg-zinc-500",
  mist: "bg-teal-800",
  dusk: "bg-sky-900",
  sand: "bg-stone-600",
  pine: "bg-emerald-900",
  ink: "bg-zinc-700",
};
