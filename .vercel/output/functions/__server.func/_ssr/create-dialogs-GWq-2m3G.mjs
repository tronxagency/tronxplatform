import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as PRIORITIES, u as TASK_STATUSES } from "./utils-B9mDzDE2.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { o as createProject, s as createTask, x as listProjects } from "./fns-n-8GfgDX.mjs";
import { a as useWorkspace } from "./workspace-D17jfZgR.mjs";
import { t as Button } from "./button-BypPlS3y.mjs";
import { i as canManageWork, o as hasPerm } from "./permissions-D6YDvOLx.mjs";
import { i as Textarea, n as Label, t as Input } from "./forms-C511-LKE.mjs";
import { n as DialogContent, r as DialogTrigger, t as Dialog } from "./overlay-BrkklbCo.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/create-dialogs-GWq-2m3G.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CreateTaskDialog({ children, projectId, open: controlledOpen, onOpenChange }) {
	const { members, me } = useWorkspace();
	const projects = useQuery({
		queryKey: ["projects"],
		queryFn: () => listProjects()
	}).data ?? [];
	const qc = useQueryClient();
	const navigate = useNavigate();
	const [internalOpen, setInternalOpen] = (0, import_react.useState)(false);
	const open = controlledOpen ?? internalOpen;
	const setOpen = onOpenChange ?? setInternalOpen;
	const mut = useMutation({
		mutationFn: (payload) => createTask({ data: payload }),
		onSuccess: async (res) => {
			toast.success("Task created");
			setOpen(false);
			await qc.invalidateQueries();
			if (res.id) await navigate({
				to: "/tasks/$taskId",
				params: { taskId: res.id }
			});
		},
		onError: (e) => toast.error(e.message)
	});
	function onSubmit(e) {
		e.preventDefault();
		const fd = new FormData(e.currentTarget);
		mut.mutate({
			title: String(fd.get("title") ?? ""),
			description: String(fd.get("description") ?? ""),
			projectId: String(fd.get("projectId") || projectId || "") || void 0,
			assigneeId: String(fd.get("assigneeId") || me.id),
			priority: String(fd.get("priority") || "medium"),
			status: String(fd.get("status") || "todo"),
			dueDate: String(fd.get("dueDate") || "") || void 0
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [children ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
			title: "New task",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-4 space-y-3",
				onSubmit,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "title",
							children: "Title"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "title",
							name: "title",
							required: true,
							placeholder: "What needs to be done?",
							autoFocus: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "description",
							children: "Description"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "description",
							name: "description",
							placeholder: "Context, acceptance, links"
						})]
					}),
					!projectId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "projectId",
							children: "Project"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							id: "projectId",
							name: "projectId",
							className: "h-10 w-full rounded-lg border border-input bg-secondary px-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "None"
							}), projects.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: p.id,
								children: p.name
							}, p.id))]
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "hidden",
						name: "projectId",
						value: projectId
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "assigneeId",
									children: "Assignee"
								}), hasPerm(me.role, "task.assign") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									id: "assigneeId",
									name: "assigneeId",
									defaultValue: me.id,
									className: "h-10 w-full rounded-lg border border-input bg-secondary px-3 text-sm",
									children: members.filter((m) => m.status === "active").map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: m.id,
										children: m.displayName
									}, m.id))
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "hidden",
									name: "assigneeId",
									value: me.id
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "flex h-10 items-center text-sm text-muted-foreground",
									children: "Assigned to you"
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "priority",
									children: "Priority"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									id: "priority",
									name: "priority",
									defaultValue: "medium",
									className: "h-10 w-full rounded-lg border border-input bg-secondary px-3 text-sm",
									children: PRIORITIES.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: p,
										children: p
									}, p))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "status",
									children: "Status"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									id: "status",
									name: "status",
									defaultValue: "todo",
									className: "h-10 w-full rounded-lg border border-input bg-secondary px-3 text-sm",
									children: (canManageWork(me.role) ? TASK_STATUSES : [
										"backlog",
										"todo",
										"in_progress"
									]).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: p,
										children: p.replaceAll("_", " ")
									}, p))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "dueDate",
									children: "Due date"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "dueDate",
									name: "dueDate",
									type: "date"
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-end pt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: mut.isPending,
							children: mut.isPending ? "Creating…" : "Create task"
						})
					})
				]
			})
		})]
	});
}
function CreateProjectDialog({ children }) {
	const { teams, me } = useWorkspace();
	const qc = useQueryClient();
	const navigate = useNavigate();
	const [open, setOpen] = (0, import_react.useState)(false);
	const mut = useMutation({
		mutationFn: (payload) => createProject({ data: payload }),
		onSuccess: async (res) => {
			toast.success("Project created");
			setOpen(false);
			await qc.invalidateQueries();
			if (res.id) await navigate({
				to: "/projects/$projectId",
				params: { projectId: res.id }
			});
		},
		onError: (e) => toast.error(e.message)
	});
	if (!hasPerm(me.role, "project.create")) return null;
	function onSubmit(e) {
		e.preventDefault();
		const fd = new FormData(e.currentTarget);
		mut.mutate({
			name: String(fd.get("name") ?? ""),
			description: String(fd.get("description") ?? ""),
			teamId: String(fd.get("teamId") || "") || void 0,
			priority: String(fd.get("priority") || "medium"),
			dueDate: String(fd.get("dueDate") || "") || void 0
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
			title: "New project",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-4 space-y-3",
				onSubmit,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "name",
							children: "Name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "name",
							name: "name",
							required: true,
							placeholder: "Restaurant SaaS",
							autoFocus: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "pdesc",
							children: "Description"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "pdesc",
							name: "description"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "teamId",
								children: "Team"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								id: "teamId",
								name: "teamId",
								className: "h-10 w-full rounded-lg border border-input bg-secondary px-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "None"
								}), teams.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: t.id,
									children: t.name
								}, t.id))]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "pdue",
								children: "Deadline"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "pdue",
								name: "dueDate",
								type: "date"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-end pt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: mut.isPending,
							children: mut.isPending ? "Creating…" : "Create project"
						})
					})
				]
			})
		})]
	});
}
//#endregion
export { CreateTaskDialog as n, CreateProjectDialog as t };
