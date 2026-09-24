import type { Role, TaskStatus } from "@/lib/types";
import { TASK_STATUSES } from "@/lib/types";

export const ROLE_RANK: Record<Role, number> = {
  employee: 1,
  team_lead: 2,
  manager: 3,
  executive_assistant: 3.5,
  founder: 4,
  ceo: 5,
};

export type PermKey =
  | "employee.create"
  | "employee.invite"
  | "employee.update"
  | "employee.deactivate"
  | "employee.view"
  | "manager.create"
  | "team.create"
  | "team.manage"
  | "team.member.add"
  | "department.create"
  | "project.create"
  | "project.update"
  | "project.archive"
  | "project.member.add"
  | "project.delete"
  | "task.create"
  | "task.assign"
  | "task.reassign"
  | "task.update"
  | "task.delete"
  | "task.review"
  | "task.approve"
  | "chat.company"
  | "chat.team"
  | "chat.project"
  | "chat.direct"
  | "meeting.company"
  | "meeting.department"
  | "meeting.team"
  | "meeting.project"
  | "meeting.direct"
  | "analytics.company"
  | "analytics.project"
  | "analytics.team"
  | "analytics.employee"
  | "admin.settings"
  | "admin.audit_logs"
  | "announce.send"
  | "settings.organization"
  | "audit.view"
  | "onboarding.manage"
  | "lead.view"
  | "lead.manage"
  | "finance.view"
  | "finance.manage";

const ROLE_PERMS: Record<Role, PermKey[]> = {
  ceo: [
    "employee.create",
    "employee.invite",
    "employee.update",
    "employee.deactivate",
    "employee.view",
    "manager.create",
    "team.create",
    "team.manage",
    "team.member.add",
    "department.create",
    "project.create",
    "project.update",
    "project.archive",
    "project.member.add",
    "project.delete",
    "task.create",
    "task.assign",
    "task.reassign",
    "task.update",
    "task.delete",
    "task.review",
    "task.approve",
    "chat.company",
    "chat.team",
    "chat.project",
    "chat.direct",
    "meeting.company",
    "meeting.department",
    "meeting.team",
    "meeting.project",
    "meeting.direct",
    "analytics.company",
    "analytics.project",
    "analytics.team",
    "analytics.employee",
    "admin.settings",
    "admin.audit_logs",
    "announce.send",
    "settings.organization",
    "audit.view",
    "onboarding.manage",
    "lead.view",
    "lead.manage",
    "finance.view",
    "finance.manage",
  ],
  founder: [
    "employee.create",
    "employee.invite",
    "employee.update",
    "employee.deactivate",
    "employee.view",
    "manager.create",
    "team.create",
    "team.manage",
    "team.member.add",
    "department.create",
    "project.create",
    "project.update",
    "project.archive",
    "project.member.add",
    "project.delete",
    "task.create",
    "task.assign",
    "task.reassign",
    "task.update",
    "task.delete",
    "task.review",
    "task.approve",
    "chat.company",
    "chat.team",
    "chat.project",
    "chat.direct",
    "meeting.company",
    "meeting.department",
    "meeting.team",
    "meeting.project",
    "meeting.direct",
    "analytics.company",
    "analytics.project",
    "analytics.team",
    "analytics.employee",
    "admin.audit_logs",
    "announce.send",
    "audit.view",
    "onboarding.manage",
    "lead.view",
    "lead.manage",
    "finance.view",
    "finance.manage",
  ],
  executive_assistant: [
    "employee.create",
    "employee.invite",
    "employee.view",
    "team.member.add",
    "project.member.add",
    "task.create",
    "task.assign",
    "task.reassign",
    "task.update",
    "chat.company",
    "chat.team",
    "chat.project",
    "chat.direct",
    "meeting.company",
    "meeting.department",
    "meeting.team",
    "meeting.project",
    "meeting.direct",
    "analytics.company",
    "analytics.project",
    "analytics.team",
    "analytics.employee",
    "announce.send",
    "onboarding.manage",
    "lead.view",
    "lead.manage",
    "finance.view",
  ],
  manager: [
    "employee.create",
    "employee.invite",
    "employee.update",
    "employee.deactivate",
    "employee.view",
    "team.create",
    "team.manage",
    "team.member.add",
    "department.create",
    "project.create",
    "project.update",
    "project.member.add",
    "task.create",
    "task.assign",
    "task.reassign",
    "task.update",
    "task.review",
    "task.approve",
    "chat.team",
    "chat.project",
    "chat.direct",
    "meeting.department",
    "meeting.team",
    "meeting.project",
    "meeting.direct",
    "analytics.team",
    "analytics.project",
    "analytics.employee",
    "announce.send",
    "lead.view",
    "lead.manage",
  ],
  team_lead: [
    "employee.view",
    "team.member.add",
    "project.update",
    "project.member.add",
    "task.create",
    "task.assign",
    "task.update",
    "task.review",
    "task.approve",
    "chat.team",
    "chat.project",
    "chat.direct",
    "meeting.team",
    "meeting.project",
    "meeting.direct",
    "analytics.team",
    "analytics.project",
    "analytics.employee",
  ],
  employee: [
    "employee.view",
    "task.create",
    "task.update",
    "chat.project",
    "chat.direct",
    "meeting.direct",
    "meeting.project",
    "analytics.employee",
  ],
};

export const ALL_PERMS: PermKey[] = ROLE_PERMS.ceo;

export const PERM_LABEL: Record<PermKey, string> = {
  "employee.create": "Create employees",
  "employee.invite": "Invite employees",
  "employee.update": "Update employees",
  "employee.deactivate": "Deactivate employees",
  "employee.view": "View employees",
  "manager.create": "Create managers",
  "team.create": "Create teams",
  "team.manage": "Manage teams",
  "team.member.add": "Add team members",
  "department.create": "Create departments",
  "project.create": "Create projects",
  "project.update": "Update projects",
  "project.archive": "Archive projects",
  "project.member.add": "Add project members",
  "project.delete": "Delete projects",
  "task.create": "Create tasks",
  "task.assign": "Assign tasks",
  "task.reassign": "Reassign tasks",
  "task.update": "Update tasks",
  "task.delete": "Delete tasks",
  "task.review": "Review work",
  "task.approve": "Approve work",
  "chat.company": "Company chat",
  "chat.team": "Team chat",
  "chat.project": "Project chat",
  "chat.direct": "Direct messages",
  "meeting.company": "Company meetings",
  "meeting.department": "Department meetings",
  "meeting.team": "Team meetings",
  "meeting.project": "Project meetings",
  "meeting.direct": "Direct meetings",
  "analytics.company": "Company analytics",
  "analytics.project": "Project analytics",
  "analytics.team": "Team analytics",
  "analytics.employee": "Own work analytics",
  "admin.settings": "Organization settings",
  "admin.audit_logs": "Audit logs",
  "announce.send": "Send announcements",
  "settings.organization": "Manage organization",
  "audit.view": "View audit trail",
  "onboarding.manage": "Run executive onboarding",
  "lead.view": "View leads",
  "lead.manage": "Manage leads",
  "finance.view": "View company money",
  "finance.manage": "Post revenue and costs",
};

export type MeetingScope = "company" | "department" | "team" | "project" | "direct" | "selected";

export type Perms = {
  enroll: boolean;
  managePeople: boolean;
  manageWork: boolean;
  admin: boolean;
  companyAnalytics: boolean;
  teamAnalytics: boolean;
  announce: boolean;
  createProject: boolean;
  assignTask: boolean;
  startCompanyMeeting: boolean;
  onboarding: boolean;
  leads: boolean;
  finance: boolean;
};

export function hasPerm(role: Role, key: PermKey): boolean {
  return ROLE_PERMS[role]?.includes(key) ?? false;
}

export function permsFor(role: Role): Perms {
  return {
    enroll: hasPerm(role, "employee.create"),
    managePeople: hasPerm(role, "employee.update"),
    manageWork: hasPerm(role, "task.assign") || role === "team_lead" || role === "executive_assistant",
    admin: hasPerm(role, "admin.settings") || hasPerm(role, "admin.audit_logs"),
    companyAnalytics: hasPerm(role, "analytics.company"),
    teamAnalytics: hasPerm(role, "analytics.team"),
    announce: hasPerm(role, "announce.send"),
    createProject: hasPerm(role, "project.create"),
    assignTask: hasPerm(role, "task.assign"),
    startCompanyMeeting: hasPerm(role, "meeting.company"),
    onboarding: hasPerm(role, "onboarding.manage"),
    leads: hasPerm(role, "lead.view"),
    finance: hasPerm(role, "finance.view"),
  };
}

export function canEnroll(role: Role): boolean {
  return hasPerm(role, "employee.create");
}

export function canManageWork(role: Role): boolean {
  return ROLE_RANK[role] >= ROLE_RANK.team_lead;
}

export function canModifyPerson(actor: Role, target: Role): boolean {
  if (target === "ceo") return false;
  if (actor === "ceo") return true;
  if (actor === "founder") return ROLE_RANK[target] < ROLE_RANK.founder;
  if (actor === "executive_assistant") return target === "employee";
  if (actor === "manager") return ROLE_RANK[target] < ROLE_RANK.manager;
  return false;
}

export function assignableRoles(actor: Role): Role[] {
  if (actor === "ceo") return ["founder", "executive_assistant", "manager", "team_lead", "employee"];
  if (actor === "founder") return ["executive_assistant", "manager", "team_lead", "employee"];
  if (actor === "executive_assistant") return ["employee"];
  if (actor === "manager") return ["team_lead", "employee"];
  return [];
}

export function isExecOffice(role: Role): boolean {
  return role === "ceo" || role === "founder" || role === "executive_assistant";
}

export function canStartMeeting(role: Role, scope: MeetingScope): boolean {
  if (scope === "selected") return ROLE_RANK[role] >= ROLE_RANK.team_lead;
  const map: Record<Exclude<MeetingScope, "selected">, PermKey> = {
    company: "meeting.company",
    department: "meeting.department",
    team: "meeting.team",
    project: "meeting.project",
    direct: "meeting.direct",
  };
  return hasPerm(role, map[scope]);
}

export function meetingScopesFor(role: Role): MeetingScope[] {
  const all: MeetingScope[] = ["company", "department", "team", "project", "selected", "direct"];
  return all.filter((s) => canStartMeeting(role, s));
}

export function portalLabel(role: Role): string {
  switch (role) {
    case "ceo":
      return "Executive Command";
    case "founder":
      return "Leadership Command";
    case "executive_assistant":
      return "Executive Support";
    case "manager":
      return "Team Operations";
    case "team_lead":
      return "Team Command";
    default:
      return "My Work Center";
  }
}

export function portalEyebrow(role: Role): string {
  switch (role) {
    case "ceo":
      return "CEO Portal";
    case "founder":
      return "Director Portal";
    case "executive_assistant":
      return "Assistant Portal";
    case "manager":
      return "Manager Portal";
    case "team_lead":
      return "Team Lead Portal";
    default:
      return "Employee Portal";
  }
}

const EMPLOYEE_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  backlog: ["todo", "in_progress"],
  todo: ["in_progress", "blocked", "backlog"],
  in_progress: ["in_review", "blocked", "todo"],
  in_review: ["in_progress"],
  changes_requested: ["in_progress", "in_review"],
  blocked: ["in_progress", "todo"],
  completed: [],
};

export function allowedTaskStatuses(role: Role, current: TaskStatus): TaskStatus[] {
  if (canManageWork(role)) return [...TASK_STATUSES];
  const next = EMPLOYEE_TRANSITIONS[current] ?? [];
  return [current, ...next.filter((s) => s !== current)];
}
