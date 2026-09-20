import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as PRIORITY_LABEL, d as cn, h as formatShortDate, l as STATUS_LABEL } from "./utils-B9mDzDE2.mjs";
import { o as Badge, s as PersonAvatar } from "./router-BtGOnZ5x.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/marks-Cd80cMWe.js
var import_jsx_runtime = require_jsx_runtime();
function StatusBadge({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		tone: {
			backlog: "muted",
			todo: "info",
			in_progress: "brand",
			in_review: "warn",
			changes_requested: "danger",
			completed: "ok",
			blocked: "danger"
		}[status],
		children: STATUS_LABEL[status]
	});
}
function PriorityBadge({ priority }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		tone: priority === "urgent" || priority === "high" ? "danger" : priority === "medium" ? "warn" : "muted",
		children: PRIORITY_LABEL[priority]
	});
}
function PageHeader({ eyebrow, title, description, actions }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [
				eyebrow ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase",
					children: eyebrow
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display mt-1 text-2xl font-semibold tracking-tight sm:text-3xl",
					children: title
				}),
				description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-2xl text-sm text-muted-foreground",
					children: description
				}) : null
			]
		}), actions ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex shrink-0 flex-wrap items-center gap-2",
			children: actions
		}) : null]
	});
}
function StatCard({ label, value, hint, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-4 shadow-soft",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("mt-3 font-display text-3xl font-semibold tabular-nums tracking-tight", tone === "danger" ? "text-danger" : tone === "ok" ? "text-ok" : tone === "brand" ? "text-brand" : "text-foreground"),
				children: value
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: hint
			}) : null
		]
	});
}
function EmptyState({ title, description, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid place-items-center rounded-2xl border border-dashed border-border px-6 py-16 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-10 rounded-full border border-border bg-secondary" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-4 font-display text-base font-semibold",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-sm text-sm text-muted-foreground",
				children: description
			}),
			action ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: action
			}) : null
		]
	});
}
function TaskRow({ task, people, compact }) {
	const assignee = people.find((p) => p.id === task.assigneeId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/tasks/$taskId",
		params: { taskId: task.id },
		className: "group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 transition-colors duration-150 hover:border-border hover:bg-accent/70",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-1.5 shrink-0 rounded-full", task.blocked ? "bg-danger" : task.status === "completed" ? "bg-ok" : task.priority === "urgent" ? "bg-danger" : "bg-brand") }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-sm text-foreground group-hover:text-foreground",
					children: task.title
				}), !compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-xs text-muted-foreground",
					children: task.blocked ? `Blocked · ${task.blockedReason}` : STATUS_LABEL[task.status]
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: task.status }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden w-16 text-right text-xs text-muted-foreground sm:block",
				children: formatShortDate(task.dueDate)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAvatar, {
				person: assignee,
				size: "sm"
			})
		]
	});
}
function Surface({ className, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("rounded-2xl border border-border bg-card shadow-soft", className),
		children
	});
}
//#endregion
export { StatusBadge as a, StatCard as i, PageHeader as n, Surface as o, PriorityBadge as r, TaskRow as s, EmptyState as t };
