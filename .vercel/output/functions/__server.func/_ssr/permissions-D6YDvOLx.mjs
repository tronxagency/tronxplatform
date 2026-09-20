import { u as TASK_STATUSES } from "./utils-B9mDzDE2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/permissions-D6YDvOLx.js
var ROLE_RANK = {
	employee: 1,
	team_lead: 2,
	manager: 3,
	founder: 4,
	ceo: 5
};
var ROLE_PERMS = {
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
		"announce.send"
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
		"announce.send"
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
		"announce.send"
	],
	team_lead: [
		"task.create",
		"task.assign",
		"task.update",
		"project.create",
		"project.update",
		"analytics.team",
		"analytics.employee"
	],
	employee: [
		"task.create",
		"task.update",
		"analytics.employee"
	]
};
function hasPerm(role, key) {
	return ROLE_PERMS[role]?.includes(key) ?? false;
}
function canEnroll(role) {
	return hasPerm(role, "employee.create");
}
function canManageWork(role) {
	return ROLE_RANK[role] >= ROLE_RANK.team_lead;
}
function canModifyPerson(actor, target) {
	if (target === "ceo") return false;
	if (actor === "ceo") return true;
	if (actor === "founder") return true;
	if (actor === "manager") return ROLE_RANK[target] < ROLE_RANK.manager;
	return false;
}
function assignableRoles(actor) {
	if (actor === "ceo") return [
		"founder",
		"manager",
		"team_lead",
		"employee"
	];
	if (actor === "founder") return [
		"manager",
		"team_lead",
		"employee"
	];
	if (actor === "manager") return ["team_lead", "employee"];
	return [];
}
function portalLabel(role) {
	switch (role) {
		case "ceo": return "CEO Portal";
		case "founder": return "Director Portal";
		case "manager": return "Manager Portal";
		case "team_lead": return "Team Lead Portal";
		default: return "Employee Portal";
	}
}
var EMPLOYEE_TRANSITIONS = {
	backlog: ["todo", "in_progress"],
	todo: [
		"in_progress",
		"blocked",
		"backlog"
	],
	in_progress: [
		"in_review",
		"blocked",
		"todo"
	],
	in_review: ["in_progress"],
	changes_requested: ["in_progress", "in_review"],
	blocked: ["in_progress", "todo"],
	completed: []
};
function allowedTaskStatuses(role, current) {
	if (canManageWork(role)) return [...TASK_STATUSES];
	return [current, ...(EMPLOYEE_TRANSITIONS[current] ?? []).filter((s) => s !== current)];
}
//#endregion
export { canModifyPerson as a, canManageWork as i, assignableRoles as n, hasPerm as o, canEnroll as r, portalLabel as s, allowedTaskStatuses as t };
