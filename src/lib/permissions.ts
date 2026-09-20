import type { Role, TaskStatus } from "@/lib/types";
import { TASK_STATUSES } from "@/lib/types";

export const ROLE_RANK: Record<Role, number> = {
  employee: 1,
  team_lead: 2,
  manager: 3,
  founder: 4,
  ceo: 5,
};

export type PermKey =
  | "employee.create"
  | "employee.update"
  | "employee.deactivate"
  | "task.create"
  | "task.assign"
  | "task.update"
  | "task.delete"
  | "project.create"
  | "project.update"
  | "project.delete"
  | "team.create"
  | "team.manage"
  | "department.create"
  | "analytics.company"
  | "analytics.team"
  | "analytics.employee"
  | "admin.settings"
  | "admin.audit_logs"
  | "announce.send";

const ROLE_PERMS: Record<Role, PermKey[]> = {
  ceo: [
    "employee.create",
    "employee.update",
    "employee.deactivate",
    "task.create",
    "task.assign",
    "task.update",
    "task.delete",
    "project.create",
    "project.update",
    "project.delete",
    "team.create",
    "team.manage",
    "department.create",
    "analytics.company",
    "analytics.team",
    "analytics.employee",
    "admin.settings",
    "admin.audit_logs",
    "announce.send",
  ],
  founder: [
    "employee.create",
    "employee.update",
    "employee.deactivate",
    "task.create",
    "task.assign",
    "task.update",
    "task.delete",
    "project.create",
    "project.update",
    "project.delete",
    "team.create",
    "team.manage",
    "department.create",
    "analytics.company",
    "analytics.team",
    "analytics.employee",
    "admin.audit_logs",
    "announce.send",
  ],
  manager: [
    "employee.create",
    "employee.update",
    "employee.deactivate",
    "task.create",
    "task.assign",
    "task.update",
    "project.create",
    "project.update",
    "team.create",
    "team.manage",
    "department.create",
    "analytics.team",
    "analytics.employee",
    "announce.send",
  ],
  team_lead: [
    "task.create",
    "task.assign",
    "task.update",
    "project.create",
    "project.update",
    "analytics.team",
    "analytics.employee",
  ],
  employee: ["task.create", "task.update", "analytics.employee"],
};

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
};

export function hasPerm(role: Role, key: PermKey): boolean {
  return ROLE_PERMS[role]?.includes(key) ?? false;
}

export function permsFor(role: Role): Perms {
  return {
    enroll: hasPerm(role, "employee.create"),
    managePeople: hasPerm(role, "employee.update"),
    manageWork: hasPerm(role, "task.assign") || role === "team_lead",
    admin: hasPerm(role, "admin.settings") || hasPerm(role, "admin.audit_logs"),
    companyAnalytics: hasPerm(role, "analytics.company"),
    teamAnalytics: hasPerm(role, "analytics.team"),
    announce: hasPerm(role, "announce.send"),
    createProject: hasPerm(role, "project.create"),
    assignTask: hasPerm(role, "task.assign"),
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
  if (actor === "founder") return true;
  if (actor === "manager") return ROLE_RANK[target] < ROLE_RANK.manager;
  return false;
}

export function assignableRoles(actor: Role): Role[] {
  if (actor === "ceo") return ["founder", "manager", "team_lead", "employee"];
  if (actor === "founder") return ["manager", "team_lead", "employee"];
  if (actor === "manager") return ["team_lead", "employee"];
  return [];
}

export function portalLabel(role: Role): string {
  switch (role) {
    case "ceo":
      return "CEO Portal";
    case "founder":
      return "Director Portal";
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
