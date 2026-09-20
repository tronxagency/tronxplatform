import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { u as TASK_STATUSES } from "./utils-B9mDzDE2.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { u as Skeleton } from "./router-BtGOnZ5x.mjs";
import { S as listTasks, x as listProjects } from "./fns-n-8GfgDX.mjs";
import { a as useWorkspace } from "./workspace-D17jfZgR.mjs";
import { t as Button } from "./button-BypPlS3y.mjs";
import { t as Input } from "./forms-C511-LKE.mjs";
import { n as CreateTaskDialog } from "./create-dialogs-GWq-2m3G.mjs";
import { n as PageHeader, o as Surface, s as TaskRow, t as EmptyState } from "./marks-Cd80cMWe.mjs";
import { t as KanbanBoard } from "./kanban-DL0KS-zC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tasks.index-B4jgZT-J.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TasksPage() {
	const { members, me } = useWorkspace();
	const [view, setView] = (0, import_react.useState)("kanban");
	const [q, setQ] = (0, import_react.useState)("");
	const [projectId, setProjectId] = (0, import_react.useState)("");
	const [assigneeId, setAssigneeId] = (0, import_react.useState)(me.role === "employee" ? me.id : "");
	const [status, setStatus] = (0, import_react.useState)("");
	const projects = useQuery({
		queryKey: ["projects"],
		queryFn: () => listProjects()
	});
	const tasks = useQuery({
		queryKey: [
			"tasks",
			projectId,
			assigneeId,
			status,
			q
		],
		queryFn: () => listTasks({ data: {
			projectId: projectId || void 0,
			assigneeId: assigneeId || void 0,
			status: status || void 0,
			q: q || void 0
		} })
	});
	const filtered = tasks.data ?? [];
	const mine = (0, import_react.useMemo)(() => filtered.filter((t) => t.assigneeId === me.id).length, [filtered, me.id]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Execution",
				title: "Tasks",
				description: `${filtered.length} in view · ${mine} assigned to you`,
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: view === "kanban" ? "default" : "secondary",
							size: "sm",
							onClick: () => setView("kanban"),
							children: "Kanban"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: view === "list" ? "default" : "secondary",
							size: "sm",
							onClick: () => setView("list"),
							children: "List"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateTaskDialog, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							children: "New task"
						}) })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2 sm:flex-row",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: "Filter by title",
						className: "sm:max-w-xs"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: projectId,
						onChange: (e) => setProjectId(e.target.value),
						className: "h-10 rounded-lg border border-input bg-secondary px-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "All projects"
						}), (projects.data ?? []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: p.id,
							children: p.name
						}, p.id))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: assigneeId,
						onChange: (e) => setAssigneeId(e.target.value),
						className: "h-10 rounded-lg border border-input bg-secondary px-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: me.role === "employee" ? "Assigned to you" : "Everyone"
						}), members.filter((m) => m.status === "active" && (me.role !== "employee" || m.id === me.id)).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: m.id,
							children: m.displayName
						}, m.id))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: status,
						onChange: (e) => setStatus(e.target.value),
						className: "h-10 rounded-lg border border-input bg-secondary px-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Any status"
						}), TASK_STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: s,
							children: s.replaceAll("_", " ")
						}, s))]
					})
				]
			}),
			tasks.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-80" }) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "No tasks match",
				description: "Try clearing filters or creating work."
			}) : view === "kanban" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KanbanBoard, {
				tasks: filtered,
				people: members
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Surface, {
				className: "p-2",
				children: filtered.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskRow, {
					task: t,
					people: members
				}, t.id))
			})
		]
	});
}
//#endregion
export { TasksPage as component };
