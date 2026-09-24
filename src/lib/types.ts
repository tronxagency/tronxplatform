export const ROLES = ["ceo", "founder", "executive_assistant", "manager", "team_lead", "employee"] as const;
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

export const THEMES = ["light", "dark", "system"] as const;
export type ThemeMode = (typeof THEMES)[number];

export const ACCENTS = ["teal", "ink", "dusk", "sand"] as const;
export type Accent = (typeof ACCENTS)[number];

export const DENSITIES = ["comfortable", "compact"] as const;
export type Density = (typeof DENSITIES)[number];

export type Appearance = {
  theme: ThemeMode;
  accent: Accent;
  density: Density;
};

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

export type ProjectMemberRole = "owner" | "manager" | "lead" | "member" | "observer";

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
  memberRoles?: Record<string, ProjectMemberRole>;
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
  meetingId?: string | null;
};

export type Meeting = {
  id: string;
  orgId: string;
  title: string;
  description: string;
  organizerId: string | null;
  scope: "company" | "department" | "team" | "project" | "direct" | "selected";
  departmentId: string | null;
  teamId: string | null;
  projectId: string | null;
  taskId: string | null;
  startsAt: string;
  endsAt: string | null;
  meetUrl: string | null;
  meetProvider: string;
  status: "scheduled" | "live" | "ended" | "cancelled";
  createdAt: string;
  participantIds: string[];
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

export type OnboardingStatus = "open" | "completed" | "cancelled";

export type OnboardingStep = {
  id: string;
  onboardingId: string;
  key: string;
  title: string;
  description: string;
  category: "setup" | "access" | "people" | "rhythm";
  ownerKind: "desk" | "self" | "both";
  dueOffsetDays: number;
  position: number;
  done: boolean;
  doneAt: string | null;
  doneBy: string | null;
  href: string | null;
};

export type OnboardingSummary = {
  id: string;
  profileId: string;
  displayName: string;
  title: string;
  role: Role;
  avatarKey: string;
  status: OnboardingStatus;
  ownerId: string | null;
  ownerName: string | null;
  startedAt: string;
  dueAt: string | null;
  completedAt: string | null;
  kickoffMeetingId: string | null;
  stepTotal: number;
  stepDone: number;
  progress: number;
};

export type OnboardingDetail = OnboardingSummary & {
  notes: string;
  steps: OnboardingStep[];
};

export const LEAD_STAGES = ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"] as const;
export type LeadStage = (typeof LEAD_STAGES)[number];

export const LEAD_SOURCES = ["inbound", "referral", "outbound", "website", "partner", "event"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_TEMPS = ["hot", "warm", "cold"] as const;
export type LeadTemperature = (typeof LEAD_TEMPS)[number];

export const LEAD_ACTIVITY_KINDS = ["note", "call", "email", "meet", "whatsapp", "follow_up"] as const;
export type LeadActivityKind = (typeof LEAD_ACTIVITY_KINDS)[number];

export const FINANCE_KINDS = ["revenue", "expense"] as const;
export type FinanceKind = (typeof FINANCE_KINDS)[number];

export const REVENUE_CATEGORIES = ["project", "retainer", "license", "support", "other"] as const;
export const EXPENSE_CATEGORIES = ["payroll", "tools", "cloud", "vendors", "office", "travel", "marketing", "tax", "other"] as const;
export type FinanceCategory = (typeof REVENUE_CATEGORIES)[number] | (typeof EXPENSE_CATEGORIES)[number];

export type Lead = {
  id: string;
  orgId: string;
  name: string;
  company: string;
  email: string | null;
  phone: string | null;
  title: string;
  source: LeadSource;
  stage: LeadStage;
  temperature: LeadTemperature;
  valueInr: number;
  score: number;
  ownerId: string | null;
  nextFollowUp: string | null;
  lastContactAt: string | null;
  city: string | null;
  website: string | null;
  industry: string | null;
  notes: string;
  lostReason: string | null;
  convertedProjectId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LeadActivity = {
  id: string;
  leadId: string;
  actorId: string | null;
  kind: LeadActivityKind;
  body: string;
  nextFollowUp: string | null;
  createdAt: string;
};

export type FinanceEntry = {
  id: string;
  orgId: string;
  kind: FinanceKind;
  category: string;
  amountInr: number;
  entryDate: string;
  title: string;
  notes: string;
  vendor: string | null;
  leadId: string | null;
  projectId: string | null;
  status: "posted" | "pending";
  createdBy: string | null;
  createdAt: string;
};

export type CommercialBrief = {
  revenueYtd: number;
  costYtd: number;
  profitYtd: number;
  marginPct: number;
  revenueMonth: number;
  costMonth: number;
  profitMonth: number;
  pipelineOpen: number;
  pipelineWeighted: number;
  openLeads: number;
  wonMonth: number;
  overdueFollowups: number;
  dueTodayFollowups: number;
  followups: { id: string; name: string; company: string; stage: LeadStage; nextFollowUp: string | null; valueInr: number }[];
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
  appearance: Appearance;
  liveMeetingCount: number;
  openOnboardingCount: number;
  overdueFollowUps: number;
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
    invitedEmployees: number;
    meetingsToday: number;
    pendingReview: number;
  };
  projectProgress: { id: string; name: string; progress: number; colorKey: string; status?: string; dueDate?: string | null }[];
  todayTasks: Task[];
  overdueTasks: Task[];
  recentActivity: ActivityItem[];
  workload: { profileId: string; name: string; active: number; completed: number; overdue: number }[];
  upcoming: { id: string; title: string; dueDate: string; type: "task" | "milestone" | "event" | "meeting"; href?: string }[];
  announcements: Announcement[];
  brief: {
    attentionProjects: number;
    dueToday: number;
    overdue: number;
    blocked: number;
    invited: number;
    meetingsToday: number;
  };
  atRisk: { id: string; name: string; reason: string }[];
  meetingsToday: Meeting[];
  execOnboarding: OnboardingSummary[];
  myOnboarding: OnboardingSummary | null;
  commercial: CommercialBrief | null;
};

export type SearchHit = {
  kind: "task" | "project" | "person" | "message" | "file" | "meeting" | "lead";
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
  executive_assistant: "Executive Assistant",
  manager: "Manager",
  team_lead: "Team Lead",
  employee: "Employee",
};

export const LEAD_STAGE_LABEL: Record<LeadStage, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

export const LEAD_SOURCE_LABEL: Record<LeadSource, string> = {
  inbound: "Inbound",
  referral: "Referral",
  outbound: "Outbound",
  website: "Website",
  partner: "Partner",
  event: "Event",
};

export const LEAD_TEMP_LABEL: Record<LeadTemperature, string> = {
  hot: "Hot",
  warm: "Warm",
  cold: "Cold",
};

export const LEAD_ACTIVITY_LABEL: Record<LeadActivityKind, string> = {
  note: "Note",
  call: "Call",
  email: "Email",
  meet: "Meeting",
  whatsapp: "WhatsApp",
  follow_up: "Follow-up",
};

export const FINANCE_KIND_LABEL: Record<FinanceKind, string> = {
  revenue: "Revenue",
  expense: "Cost",
};

export const FINANCE_CATEGORY_LABEL: Record<string, string> = {
  project: "Project",
  retainer: "Retainer",
  license: "License",
  support: "Support",
  payroll: "Payroll",
  tools: "Tools",
  cloud: "Cloud",
  vendors: "Vendors",
  office: "Office",
  travel: "Travel",
  marketing: "Marketing",
  tax: "Tax",
  other: "Other",
};

export const ONBOARDING_STATUS_LABEL: Record<OnboardingStatus, string> = {
  open: "Open",
  completed: "Complete",
  cancelled: "Cancelled",
};

export const ONBOARDING_CATEGORY_LABEL: Record<OnboardingStep["category"], string> = {
  setup: "Setup",
  access: "Access",
  people: "People",
  rhythm: "Rhythm",
};

export const EMPLOYMENT_LABEL: Record<EmploymentType, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  intern: "Intern",
};

export const ACCENT_LABEL: Record<Accent, string> = {
  teal: "Teal",
  ink: "Ink",
  dusk: "Dusk",
  sand: "Sand",
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
