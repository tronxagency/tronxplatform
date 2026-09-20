import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { h as formatShortDate, i as PRIORITIES, l as STATUS_LABEL, o as PROJECT_STATUSES, x as relativeTime } from "./utils-B9mDzDE2.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { c as ProgressRail, d as Tabs, f as TabsContent, m as TabsTrigger, p as TabsList, r as Route$3, s as PersonAvatar, u as Skeleton } from "./router-BtGOnZ5x.mjs";
import { N as updateProject, p as getProject } from "./fns-n-8GfgDX.mjs";
import { a as useWorkspace } from "./workspace-D17jfZgR.mjs";
import { t as Button } from "./button-BypPlS3y.mjs";
import { o as hasPerm } from "./permissions-D6YDvOLx.mjs";
import { i as Textarea, n as Label, r as Select, t as Input } from "./forms-C511-LKE.mjs";
import { n as DialogContent, r as DialogTrigger, t as Dialog } from "./overlay-BrkklbCo.mjs";
import { n as CreateTaskDialog } from "./create-dialogs-GWq-2m3G.mjs";
import { n as PageHeader, o as Surface, s as TaskRow, t as EmptyState } from "./marks-Cd80cMWe.mjs";
import { t as addProjectMember } from "./people-CSPjn2TS.mjs";
import { t as KanbanBoard } from "./kanban-DL0KS-zC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/projects._projectId-4h9qpg0Q.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProjectDetailPage() {
	const { projectId } = Route$3.useParams();
	const { members, me } = useWorkspace();
	const qc = useQueryClient();
	const q = useQuery({
		queryKey: ["project", projectId],
		queryFn: () => getProject({ data: projectId })
	});
	const add = useMutation({
		mutationFn: (profileId) => addProjectMember({ data: {
			projectId,
			profileId
		} }),
		onSuccess: async () => {
			toast.success("Member added");
			await qc.invalidateQueries({ queryKey: ["project", projectId] });
			await qc.invalidateQueries({ queryKey: ["channels"] });
		},
		onError: (e) => toast.error(e.message)
	});
	if (q.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-96" });
	if (!q.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		title: "Project not found",
		description: "It may have been archived."
	});
	const { project, tasks, milestones, files, activity, channelId } = q.data;
	const byTag = /* @__PURE__ */ new Map();
	for (const t of tasks) {
		const key = t.tags[0] || "general";
		const cur = byTag.get(key) ?? {
			total: 0,
			done: 0
		};
		cur.total += 1;
		if (t.status === "completed") cur.done += 1;
		byTag.set(key, cur);
	}
	const available = members.filter((m) => m.status === "active" && !project.memberIds.includes(m.id));
	const byStatus = Object.entries(tasks.reduce((acc, t) => {
		acc[t.status] = (acc[t.status] ?? 0) + 1;
		return acc;
	}, {}));
	const canUpdate = hasPerm(me.role, "project.update");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Project",
				title: project.name,
				description: project.description,
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [canUpdate ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditProjectDialog, {
						projectId: project.id,
						name: project.name,
						description: project.description,
						status: project.status,
						priority: project.priority,
						dueDate: project.dueDate
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateTaskDialog, {
						projectId: project.id,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "Add task" })
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
						className: "p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs tracking-wide text-muted-foreground uppercase",
								children: "Progress"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 font-display text-3xl font-semibold tabular-nums",
								children: [project.progress, "%"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressRail, {
								value: project.progress,
								className: "mt-3"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
						className: "p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs tracking-wide text-muted-foreground uppercase",
								children: "Deadline"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-display text-3xl font-semibold",
								children: formatShortDate(project.dueDate)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted-foreground capitalize",
								children: project.status.replace("_", " ")
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
						className: "p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tracking-wide text-muted-foreground uppercase",
							children: "Team"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex -space-x-1.5",
							children: project.memberIds.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAvatar, {
								person: members.find((m) => m.id === id),
								size: "sm",
								className: "ring-2 ring-card"
							}, id))
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "overview",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "max-w-full overflow-x-auto",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "overview",
								children: "Overview"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "kanban",
								children: "Kanban"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "list",
								children: "Tasks"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "calendar",
								children: "Calendar"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "team",
								children: "Team"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "files",
								children: "Files"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "chat",
								children: "Chat"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "activity",
								children: "Activity"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "analytics",
								children: "Analytics"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "overview",
						className: "mt-5 space-y-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
							className: "p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-sm font-semibold",
								children: "Workstreams"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 space-y-3",
								children: byTag.size === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: "No tasks yet."
								}) : [...byTag.entries()].map(([tag, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-1 flex justify-between text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "capitalize",
										children: tag
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "tabular-nums text-muted-foreground",
										children: [v.total === 0 ? 0 : Math.round(v.done / v.total * 100), "%"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressRail, { value: v.total === 0 ? 0 : Math.round(v.done / v.total * 100) })] }, tag))
							})]
						}), milestones.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Surface, {
							className: "divide-y divide-border",
							children: milestones.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between px-4 py-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: m.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-muted-foreground",
									children: [
										m.status,
										" · ",
										formatShortDate(m.dueDate)
									]
								})]
							}, m.id))
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "kanban",
						className: "mt-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KanbanBoard, {
							tasks,
							people: members
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "list",
						className: "mt-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Surface, {
							className: "p-2",
							children: tasks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "p-4 text-sm text-muted-foreground",
								children: "No tasks in this project."
							}) : tasks.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskRow, {
								task: t,
								people: members
							}, t.id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "calendar",
						className: "mt-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
							className: "divide-y divide-border",
							children: [tasks.filter((t) => t.dueDate).sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? "")).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskRow, {
								task: t,
								people: members
							}, t.id)), tasks.every((t) => !t.dueDate) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "p-6 text-sm text-muted-foreground",
								children: "No dated tasks yet."
							}) : null]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "team",
						className: "mt-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Surface, {
							className: "divide-y divide-border",
							children: project.memberIds.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "p-6 text-sm text-muted-foreground",
								children: "No members yet."
							}) : project.memberIds.map((id) => {
								const person = members.find((m) => m.id === id);
								if (!person) return null;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/employees/$employeeId",
									params: { employeeId: id },
									className: "flex items-center gap-3 px-4 py-3 hover:bg-accent/40",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAvatar, { person }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm",
										children: person.displayName
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: person.title
									})] })]
								}, id);
							})
						}), canUpdate && available.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "mt-3 h-10 rounded-lg border border-input bg-secondary px-3 text-sm",
							defaultValue: "",
							onChange: (e) => {
								if (e.target.value) add.mutate(e.target.value);
								e.target.value = "";
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Add member…"
							}), available.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: m.id,
								children: m.displayName
							}, m.id))]
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "files",
						className: "mt-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Surface, {
							className: "divide-y divide-border",
							children: files.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "p-6 text-sm text-muted-foreground",
								children: "No files yet."
							}) : files.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between px-4 py-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: f.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: relativeTime(f.createdAt)
								})]
							}, f.id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "chat",
						className: "mt-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
							className: "p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Every project has its own channel. Conversation, mentions and files live there."
							}), channelId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/chat",
								search: { channel: channelId },
								className: "mt-4 inline-flex",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "Open project chat" })
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-muted-foreground",
								children: "No channel yet."
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "activity",
						className: "mt-5",
						children: activity.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "No activity yet."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-3",
							children: activity.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "text-sm",
								children: [a.summary, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-2 text-xs text-muted-foreground",
									children: relativeTime(a.createdAt)
								})]
							}, a.id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "analytics",
						className: "mt-5 space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
									className: "p-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Tasks"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 font-display text-2xl font-semibold tabular-nums",
										children: tasks.length
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
									className: "p-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Completed"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 font-display text-2xl font-semibold tabular-nums",
										children: tasks.filter((t) => t.status === "completed").length
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
									className: "p-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Overdue"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 font-display text-2xl font-semibold tabular-nums",
										children: tasks.filter((t) => t.dueDate && t.dueDate < (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) && t.status !== "completed").length
									})]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
							className: "p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-sm font-semibold",
								children: "By status"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 space-y-3",
								children: byStatus.map(([status, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-1 flex justify-between text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: STATUS_LABEL[status] ?? status }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tabular-nums text-muted-foreground",
										children: count
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressRail, { value: tasks.length ? Math.round(count / tasks.length * 100) : 0 })] }, status))
							})]
						})]
					})
				]
			})
		]
	});
}
function EditProjectDialog({ projectId, name, description, status, priority, dueDate }) {
	const qc = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const mut = useMutation({
		mutationFn: (data) => updateProject({ data }),
		onSuccess: async () => {
			toast.success("Project updated");
			setOpen(false);
			await qc.invalidateQueries({ queryKey: ["project", projectId] });
			await qc.invalidateQueries({ queryKey: ["projects"] });
		},
		onError: (e) => toast.error(e.message)
	});
	function onSubmit(e) {
		e.preventDefault();
		const fd = new FormData(e.currentTarget);
		mut.mutate({
			id: projectId,
			name: String(fd.get("name") ?? ""),
			description: String(fd.get("description") ?? ""),
			status: String(fd.get("status") ?? ""),
			priority: String(fd.get("priority") ?? ""),
			dueDate: String(fd.get("dueDate") || "") || null
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				children: "Edit"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
			title: "Edit project",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-4 space-y-3",
				onSubmit,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "prj-name",
							children: "Name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "prj-name",
							name: "name",
							defaultValue: name,
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "prj-desc",
							children: "Description"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "prj-desc",
							name: "description",
							defaultValue: description
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "prj-status",
								children: "Status"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
								id: "prj-status",
								name: "status",
								defaultValue: status,
								children: PROJECT_STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: s,
									children: s.replaceAll("_", " ")
								}, s))
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "prj-pri",
								children: "Priority"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
								id: "prj-pri",
								name: "priority",
								defaultValue: priority,
								children: PRIORITIES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: s,
									children: s
								}, s))
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "prj-due",
							children: "Deadline"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "prj-due",
							name: "dueDate",
							type: "date",
							defaultValue: dueDate ?? ""
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: mut.isPending,
							children: "Save"
						})
					})
				]
			})
		})]
	});
}
//#endregion
export { ProjectDetailPage as component };
