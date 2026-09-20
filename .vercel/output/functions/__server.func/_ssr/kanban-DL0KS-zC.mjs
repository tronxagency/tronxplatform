import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { d as cn, h as formatShortDate, l as STATUS_LABEL, u as TASK_STATUSES } from "./utils-B9mDzDE2.mjs";
import { i as useQueryClient, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { s as PersonAvatar } from "./router-BtGOnZ5x.mjs";
import { P as updateTask } from "./fns-n-8GfgDX.mjs";
import { a as useWorkspace } from "./workspace-D17jfZgR.mjs";
import { t as allowedTaskStatuses } from "./permissions-D6YDvOLx.mjs";
import { r as PriorityBadge } from "./marks-Cd80cMWe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/kanban-DL0KS-zC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function KanbanBoard({ tasks, people }) {
	const { me } = useWorkspace();
	const qc = useQueryClient();
	const [over, setOver] = (0, import_react.useState)(null);
	const mut = useMutation({
		mutationFn: (data) => updateTask({ data }),
		onSuccess: () => qc.invalidateQueries(),
		onError: (e) => toast.error(e.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex gap-3 overflow-x-auto pb-4",
		children: TASK_STATUSES.map((status) => {
			const col = tasks.filter((t) => t.status === status);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				onDragOver: (e) => {
					e.preventDefault();
					setOver(status);
				},
				onDrop: (e) => {
					e.preventDefault();
					const id = e.dataTransfer.getData("text/task-id");
					const task = tasks.find((t) => t.id === id);
					if (id && task && !allowedTaskStatuses(me.role, task.status).includes(status)) {
						toast.error("That status change is not allowed for your role");
						setOver(null);
						return;
					}
					if (id) mut.mutate({
						id,
						status
					});
					setOver(null);
				},
				onDragLeave: () => setOver((s) => s === status ? null : s),
				className: cn("flex w-72 shrink-0 flex-col rounded-2xl border border-border bg-secondary/60 p-2", over === status && "border-brand/40 bg-brand/5"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex items-center justify-between px-2 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-xs font-medium tracking-wide text-muted-foreground uppercase",
						children: STATUS_LABEL[status]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs tabular-nums text-muted-foreground",
						children: col.length
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-col gap-2",
					children: col.map((task) => {
						const person = people.find((p) => p.id === task.assigneeId);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/tasks/$taskId",
							params: { taskId: task.id },
							draggable: true,
							onDragStart: (e) => {
								e.dataTransfer.setData("text/task-id", task.id);
								e.dataTransfer.effectAllowed = "move";
							},
							className: "rounded-xl border border-border bg-card p-3 shadow-soft transition-transform duration-150 hover:-translate-y-0.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm leading-snug",
									children: task.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriorityBadge, { priority: task.priority }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[11px] text-muted-foreground",
											children: formatShortDate(task.dueDate)
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAvatar, {
											person,
											size: "sm"
										})]
									})]
								}),
								task.blocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-[11px] text-danger",
									children: "Blocked"
								}) : null
							]
						}, task.id);
					})
				})]
			}, status);
		})
	});
}
//#endregion
export { KanbanBoard as t };
