import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { h as formatShortDate, i as PRIORITIES, m as formatHours, x as relativeTime } from "./utils-B9mDzDE2.mjs";
import { c as Square, g as Play } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Route$1, s as PersonAvatar, u as Skeleton } from "./router-BtGOnZ5x.mjs";
import { A as toggleChecklist, O as startTimer, P as updateTask, i as addTimeEntry, k as stopTimer, m as getTask, n as addComment, s as createTask, t as addChecklistItem } from "./fns-n-8GfgDX.mjs";
import { a as useWorkspace } from "./workspace-D17jfZgR.mjs";
import { t as Button } from "./button-BypPlS3y.mjs";
import { i as canManageWork, o as hasPerm, t as allowedTaskStatuses } from "./permissions-D6YDvOLx.mjs";
import { i as Textarea, t as Input } from "./forms-C511-LKE.mjs";
import { a as StatusBadge, o as Surface, r as PriorityBadge } from "./marks-Cd80cMWe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tasks._taskId-B9o0TX2a.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TaskPage() {
	const { taskId } = Route$1.useParams();
	const { members, me, runningTimer } = useWorkspace();
	const qc = useQueryClient();
	const q = useQuery({
		queryKey: ["task", taskId],
		queryFn: () => getTask({ data: taskId })
	});
	const [comment, setComment] = (0, import_react.useState)("");
	const [subTitle, setSubTitle] = (0, import_react.useState)("");
	const [checkTitle, setCheckTitle] = (0, import_react.useState)("");
	const save = useMutation({
		mutationFn: (data) => updateTask({ data }),
		onSuccess: async () => {
			await qc.invalidateQueries();
			toast.success("Saved");
		},
		onError: (e) => toast.error(e.message)
	});
	const commentMut = useMutation({
		mutationFn: (body) => addComment({ data: {
			taskId,
			body
		} }),
		onSuccess: async () => {
			setComment("");
			await qc.invalidateQueries({ queryKey: ["task", taskId] });
		}
	});
	const subMut = useMutation({
		mutationFn: (title) => createTask({ data: {
			title,
			parentId: taskId
		} }),
		onSuccess: async () => {
			setSubTitle("");
			await qc.invalidateQueries({ queryKey: ["task", taskId] });
		},
		onError: (e) => toast.error(e.message)
	});
	const checkMut = useMutation({
		mutationFn: (title) => addChecklistItem({ data: {
			taskId,
			title
		} }),
		onSuccess: async () => {
			setCheckTitle("");
			await qc.invalidateQueries({ queryKey: ["task", taskId] });
		}
	});
	const toggle = useMutation({
		mutationFn: (data) => toggleChecklist({ data }),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["task", taskId] })
	});
	const timerStart = useMutation({
		mutationFn: () => startTimer({ data: taskId }),
		onSuccess: async () => {
			toast.success("Timer started");
			await qc.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	const timerStop = useMutation({
		mutationFn: () => stopTimer(),
		onSuccess: async (r) => {
			if (r.ok) toast.success(`Logged ${r.minutes}m`);
			await qc.invalidateQueries();
		}
	});
	const manualTime = useMutation({
		mutationFn: (minutes) => addTimeEntry({ data: {
			taskId,
			minutes
		} }),
		onSuccess: async () => {
			toast.success("Time added");
			await qc.invalidateQueries();
		}
	});
	if (q.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-96" });
	if (!q.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "Task not found."
	});
	const { task, subtasks, checklist, comments, files, dependencies, activity } = q.data;
	const assignee = members.find((m) => m.id === task.assigneeId);
	const creator = members.find((m) => m.id === task.creatorId);
	const statuses = allowedTaskStatuses(me.role, task.status);
	function patch(key, value) {
		save.mutate({
			id: task.id,
			[key]: value
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/tasks",
						className: "text-xs text-muted-foreground hover:text-foreground",
						children: "Tasks"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						defaultValue: task.title,
						className: "mt-2 w-full bg-transparent font-display text-2xl font-semibold tracking-tight outline-none",
						onBlur: (e) => {
							if (e.target.value.trim() && e.target.value !== task.title) patch("title", e.target.value);
						}
					}, task.title),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: task.status }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriorityBadge, { priority: task.priority }),
							task.blocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-danger",
								children: "Blocked"
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkflowBar, {
						task,
						canReview: canManageWork(me.role),
						isOwner: task.assigneeId === me.id || task.creatorId === me.id,
						onStatus: (status) => save.mutate({
							id: task.id,
							status
						}),
						pending: save.isPending
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
					className: "p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] tracking-wide text-muted-foreground uppercase",
						children: "Description"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						defaultValue: task.description,
						className: "mt-2 min-h-32 border-transparent bg-transparent px-0",
						onBlur: (e) => {
							if (e.target.value !== task.description) patch("description", e.target.value);
						}
					}, task.description)]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
					className: "p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] tracking-wide text-muted-foreground uppercase",
							children: "Checklist"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 space-y-2",
							children: checklist.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center gap-2 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: c.done,
									onChange: (e) => toggle.mutate({
										id: c.id,
										done: e.target.checked
									}),
									className: "size-4 accent-brand"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: c.done ? "text-muted-foreground line-through" : "",
									children: c.title
								})]
							}, c.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-3 flex gap-2",
							onSubmit: (e) => {
								e.preventDefault();
								if (checkTitle.trim()) checkMut.mutate(checkTitle.trim());
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: checkTitle,
								onChange: (e) => setCheckTitle(e.target.value),
								placeholder: "Add item"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								variant: "secondary",
								size: "sm",
								children: "Add"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
					className: "p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] tracking-wide text-muted-foreground uppercase",
							children: "Subtasks"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 space-y-2",
							children: subtasks.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/tasks/$taskId",
								params: { taskId: s.id },
								className: "text-sm hover:underline",
								children: s.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-2 text-xs text-muted-foreground",
								children: s.status.replaceAll("_", " ")
							})] }, s.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-3 flex gap-2",
							onSubmit: (e) => {
								e.preventDefault();
								if (subTitle.trim()) subMut.mutate(subTitle.trim());
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: subTitle,
								onChange: (e) => setSubTitle(e.target.value),
								placeholder: "New subtask"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								variant: "secondary",
								size: "sm",
								children: "Add"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
					className: "p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] tracking-wide text-muted-foreground uppercase",
							children: "Discussion"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 space-y-3",
							children: comments.map((c) => {
								const author = members.find((m) => m.id === c.authorId);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAvatar, {
										person: author,
										size: "sm"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground",
										children: [
											author?.displayName,
											" · ",
											relativeTime(c.createdAt)
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm",
										children: c.body
									})] })]
								}, c.id);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-4 flex gap-2",
							onSubmit: (e) => {
								e.preventDefault();
								if (comment.trim()) commentMut.mutate(comment.trim());
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: comment,
								onChange: (e) => setComment(e.target.value),
								placeholder: "Write a comment…"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								size: "sm",
								children: "Send"
							})]
						})
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
					className: "space-y-3 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Status",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: task.status,
								onChange: (e) => save.mutate({
									id: task.id,
									status: e.target.value
								}),
								className: "h-9 w-full rounded-lg border border-input bg-secondary px-2 text-sm",
								children: statuses.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: s,
									children: s.replaceAll("_", " ")
								}, s))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Priority",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: task.priority,
								onChange: (e) => save.mutate({
									id: task.id,
									priority: e.target.value
								}),
								className: "h-9 w-full rounded-lg border border-input bg-secondary px-2 text-sm",
								children: PRIORITIES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: s,
									children: s
								}, s))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Assignee",
							children: hasPerm(me.role, "task.assign") ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: task.assigneeId ?? "",
								onChange: (e) => save.mutate({
									id: task.id,
									assigneeId: e.target.value || null
								}),
								className: "h-9 w-full rounded-lg border border-input bg-secondary px-2 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Unassigned"
								}), members.filter((m) => m.status === "active").map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: m.id,
									children: m.displayName
								}, m.id))]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "flex h-9 items-center text-sm",
								children: assignee?.displayName ?? "Unassigned"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Due",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								defaultValue: task.dueDate ?? "",
								onBlur: (e) => save.mutate({
									id: task.id,
									dueDate: e.target.value || null
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Estimate",
							children: formatHours(task.estimatedMinutes)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Logged",
							children: formatHours(task.actualMinutes)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Creator",
							children: creator?.displayName ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Assignee now",
							children: assignee?.displayName ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Due date",
							children: formatShortDate(task.dueDate)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
					className: "p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] tracking-wide text-muted-foreground uppercase",
						children: "Time"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [runningTimer ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => timerStop.mutate(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "size-3.5" }), "Stop"]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: () => timerStart.mutate(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3.5" }), "Start timer"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => manualTime.mutate(30),
							children: "+30m"
						})]
					})]
				}),
				dependencies.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
					className: "p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] tracking-wide text-muted-foreground uppercase",
						children: "Depends on"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 space-y-1 text-sm",
						children: dependencies.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/tasks/$taskId",
							params: { taskId: d.depends_on_id },
							className: "hover:underline",
							children: d.title
						}) }, d.depends_on_id))
					})]
				}) : null,
				files.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
					className: "p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] tracking-wide text-muted-foreground uppercase",
						children: "Files"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 space-y-1 text-sm",
						children: files.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: f.name }, f.id))
					})]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
					className: "p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] tracking-wide text-muted-foreground uppercase",
						children: "Activity"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 space-y-2 text-xs text-muted-foreground",
						children: activity.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							a.summary,
							" · ",
							relativeTime(a.createdAt)
						] }, a.id))
					})]
				})
			]
		})]
	});
}
function WorkflowBar({ task, canReview, isOwner, onStatus, pending }) {
	const actions = [];
	if (isOwner || canReview) {
		if (task.status === "todo" || task.status === "backlog" || task.status === "changes_requested") actions.push({
			label: "Start work",
			status: "in_progress"
		});
		if (task.status === "in_progress") {
			actions.push({
				label: "Submit for review",
				status: "in_review"
			});
			actions.push({
				label: "Mark blocked",
				status: "blocked",
				variant: "secondary"
			});
		}
		if (task.status === "blocked") actions.push({
			label: "Resume",
			status: "in_progress"
		});
	}
	if (canReview && task.status === "in_review") {
		actions.push({
			label: "Approve",
			status: "completed"
		});
		actions.push({
			label: "Request changes",
			status: "changes_requested",
			variant: "secondary"
		});
	}
	if (actions.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-4 flex flex-wrap gap-2",
		children: actions.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			size: "sm",
			variant: a.variant ?? "default",
			disabled: pending,
			onClick: () => onStatus(a.status),
			children: a.label
		}, a.status))
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[11px] tracking-wide text-muted-foreground uppercase",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1",
			children
		})]
	});
}
//#endregion
export { TaskPage as component };
