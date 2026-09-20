import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { h as formatShortDate, m as formatHours } from "./utils-B9mDzDE2.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { u as Skeleton } from "./router-BtGOnZ5x.mjs";
import { C as listTimeEntries, S as listTasks } from "./fns-n-8GfgDX.mjs";
import { a as useWorkspace } from "./workspace-D17jfZgR.mjs";
import { i as StatCard, n as PageHeader, o as Surface, s as TaskRow } from "./marks-Cd80cMWe.mjs";
import { t as KanbanBoard } from "./kanban-DL0KS-zC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/my-work-BRxhidXE.js
var import_jsx_runtime = require_jsx_runtime();
function MyWorkPage() {
	const { members, me } = useWorkspace();
	const tasks = useQuery({
		queryKey: ["tasks", "mine"],
		queryFn: () => listTasks({ data: { mine: true } })
	});
	const time = useQuery({
		queryKey: ["time"],
		queryFn: () => listTimeEntries()
	});
	const mine = tasks.data ?? [];
	const active = mine.filter((t) => t.status !== "completed" && t.status !== "backlog");
	const overdue = mine.filter((t) => t.dueDate && t.dueDate < (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) && t.status !== "completed");
	const weekMinutes = (time.data ?? []).filter((e) => Date.now() - new Date(e.startedAt).getTime() < 6048e5).reduce((s, e) => s + e.minutes, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "You",
				title: "My work",
				description: "Only the work on your plate — visible, not surveilled."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Active",
						value: active.length
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Overdue",
						value: overdue.length,
						tone: overdue.length ? "danger" : "ok"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "This week",
						value: formatHours(weekMinutes),
						hint: "Time you logged"
					})
				]
			}),
			tasks.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KanbanBoard, {
				tasks: mine,
				people: members
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
				className: "p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-sm font-semibold",
					children: "Time log"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 divide-y divide-border",
					children: (time.data ?? []).map((e) => {
						const task = mine.find((t) => t.id === e.taskId);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between py-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: task?.title ?? e.note ?? "Unlinked" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted-foreground",
								children: [
									formatHours(e.minutes),
									" · ",
									formatShortDate(e.startedAt)
								]
							})]
						}, e.id);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
				className: "p-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "px-3 pt-3 font-display text-sm font-semibold",
					children: "Overdue"
				}), overdue.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskRow, {
					task: t,
					people: members
				}, t.id))]
			})
		]
	});
}
//#endregion
export { MyWorkPage as component };
