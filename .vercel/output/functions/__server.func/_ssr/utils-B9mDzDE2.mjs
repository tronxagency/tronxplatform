import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-B9mDzDE2.js
var ROLES = [
	"ceo",
	"founder",
	"manager",
	"team_lead",
	"employee"
];
var TASK_STATUSES = [
	"backlog",
	"todo",
	"in_progress",
	"in_review",
	"changes_requested",
	"completed",
	"blocked"
];
var PRIORITIES = [
	"urgent",
	"high",
	"medium",
	"low"
];
var PROJECT_STATUSES = [
	"planning",
	"active",
	"on_hold",
	"completed"
];
var EMPLOYMENT_TYPES = [
	"full_time",
	"part_time",
	"contract",
	"intern"
];
var STATUS_LABEL = {
	backlog: "Backlog",
	todo: "Todo",
	in_progress: "In Progress",
	in_review: "In Review",
	changes_requested: "Changes Requested",
	completed: "Completed",
	blocked: "Blocked"
};
var PRIORITY_LABEL = {
	urgent: "Urgent",
	high: "High",
	medium: "Medium",
	low: "Low"
};
var ROLE_LABEL = {
	ceo: "CEO",
	founder: "Founder / Director",
	manager: "Manager",
	team_lead: "Team Lead",
	employee: "Employee"
};
var EMPLOYMENT_LABEL = {
	full_time: "Full-time",
	part_time: "Part-time",
	contract: "Contract",
	intern: "Intern"
};
var AVATAR_CLASS = {
	slate: "bg-slate-500",
	stone: "bg-stone-500",
	zinc: "bg-zinc-500",
	mist: "bg-teal-800",
	dusk: "bg-sky-900",
	sand: "bg-stone-600",
	pine: "bg-emerald-900",
	ink: "bg-zinc-700"
};
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function nid(prefix) {
	return `${prefix}_${(typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID().replace(/-/g, "") : `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`).slice(0, 16)}`;
}
function initials(name) {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return "?";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}
function firstName(name) {
	return name.trim().split(/\s+/)[0] || name;
}
function greetingForHour(hour) {
	if (hour < 12) return "Good morning";
	if (hour < 17) return "Good afternoon";
	return "Good evening";
}
function formatHours(minutes) {
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	if (h === 0) return `${m}m`;
	if (m === 0) return `${h}h`;
	return `${h}h ${m}m`;
}
function formatShortDate(iso) {
	if (!iso) return "—";
	const d = iso.length <= 10 ? /* @__PURE__ */ new Date(`${iso}T00:00:00`) : new Date(iso);
	if (Number.isNaN(d.getTime())) return "—";
	return d.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric"
	});
}
function dayKey(d) {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function toIso(value) {
	if (value instanceof Date) return value.toISOString();
	if (typeof value === "string") return value;
	return "";
}
function relativeTime(iso) {
	if (!iso) return "";
	const d = new Date(iso);
	const diff = Date.now() - d.getTime();
	const mins = Math.round(diff / 6e4);
	if (mins < 1) return "just now";
	if (mins < 60) return `${mins}m ago`;
	const hours = Math.round(mins / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.round(hours / 24);
	if (days < 7) return `${days}d ago`;
	return formatShortDate(iso);
}
function isOnline(lastSeenAt) {
	if (!lastSeenAt) return false;
	return Date.now() - new Date(lastSeenAt).getTime() < 48e4;
}
function parseAppHref(href) {
	if (!href || href === "/") return { kind: "home" };
	const [path, query] = href.split("?");
	const parts = (path ?? "").split("/").filter(Boolean);
	if (parts[0] === "tasks" && parts[1]) return {
		kind: "task",
		id: parts[1]
	};
	if (parts[0] === "projects" && parts[1]) return {
		kind: "project",
		id: parts[1]
	};
	if (parts[0] === "employees" && parts[1]) return {
		kind: "employee",
		id: parts[1]
	};
	if (parts[0] === "chat") return {
		kind: "chat",
		channel: new URLSearchParams(query ?? "").get("channel") ?? void 0
	};
	return {
		kind: "other",
		href
	};
}
//#endregion
export { toIso as S, initials as _, PRIORITY_LABEL as a, parseAppHref as b, ROLE_LABEL as c, cn as d, dayKey as f, greetingForHour as g, formatShortDate as h, PRIORITIES as i, STATUS_LABEL as l, formatHours as m, EMPLOYMENT_LABEL as n, PROJECT_STATUSES as o, firstName as p, EMPLOYMENT_TYPES as r, ROLES as s, AVATAR_CLASS as t, TASK_STATUSES as u, isOnline as v, relativeTime as x, nid as y };
