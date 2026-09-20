import { v as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "./_libs/@radix-ui/react-collection+[...].mjs";
import { g as greetingForHour, h as formatShortDate, p as firstName, x as relativeTime } from "./_ssr/utils-B9mDzDE2.mjs";
import { n as useQuery } from "./_libs/tanstack__react-query.mjs";
import { c as ProgressRail, s as PersonAvatar, u as Skeleton } from "./_ssr/router-BtGOnZ5x.mjs";
import { f as getDashboard, x as listProjects } from "./_ssr/fns-n-8GfgDX.mjs";
import { a as useWorkspace } from "./_ssr/workspace-D17jfZgR.mjs";
import { t as Button } from "./_ssr/button-BypPlS3y.mjs";
import { n as CreateTaskDialog } from "./_ssr/create-dialogs-GWq-2m3G.mjs";
import { i as StatCard, n as PageHeader, o as Surface, s as TaskRow, t as EmptyState } from "./_ssr/marks-Cd80cMWe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app-AzDT3ele.js
var import_jsx_runtime = require_jsx_runtime();
function DashboardPage() {
	const { me, members } = useWorkspace();
	const dash = useQuery({
		queryKey: ["dashboard"],
		queryFn: () => getDashboard()
	});
	const projects = useQuery({
		queryKey: ["projects"],
		queryFn: () => listProjects()
	});
	const hour = (/* @__PURE__ */ new Date()).getHours();
	if (dash.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-72" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3 sm:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28" })
			]
		})]
	});
	if (!dash.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		title: "Dashboard unavailable",
		description: "Refresh to load your workspace."
	});
	const d = dash.data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: me.role === "employee" ? "Employee Portal" : me.role === "team_lead" ? "Team Lead Portal" : me.role === "manager" ? "Manager Portal" : me.role === "founder" ? "Director Portal" : "CEO Portal",
				title: `${greetingForHour(hour)}, ${firstName(me.displayName)}`,
				description: "A quiet view of work in motion — tasks, projects and the people carrying them.",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateTaskDialog, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "New task" }) })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "stagger-in grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Tasks",
						value: d.stats.myActive,
						hint: "Assigned to you, in motion"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Active projects",
						value: d.stats.activeProjects,
						hint: `${d.stats.activeEmployees} people in the org`,
						tone: "brand"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Due today",
						value: d.stats.dueToday,
						hint: d.stats.overdue ? `${d.stats.overdue} overdue` : "Nothing slipping",
						tone: d.stats.dueToday > 0 ? "danger" : "ok"
					})
				]
			}),
			me.role === "ceo" || me.role === "founder" || me.role === "manager" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3 sm:grid-cols-3 lg:grid-cols-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Employees",
						value: d.stats.activeEmployees,
						hint: `${d.stats.totalEmployees} on file`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Projects",
						value: d.stats.activeProjects,
						hint: `${d.stats.totalProjects} total`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Tasks",
						value: d.stats.pendingTasks,
						hint: `${d.stats.completedTasks} completed`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Overdue",
						value: d.stats.overdue,
						tone: d.stats.overdue ? "danger" : "default"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Blocked",
						value: d.stats.blocked,
						tone: d.stats.blocked ? "danger" : "default"
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-[1.4fr_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
					className: "p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-base font-semibold",
							children: "Project progress"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/projects",
							className: "text-xs text-muted-foreground hover:text-foreground",
							children: "All projects"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-4",
						children: d.projectProgress.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/projects/$projectId",
							params: { projectId: p.id },
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-1.5 flex items-baseline justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm",
									children: p.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs tabular-nums text-muted-foreground",
									children: [p.progress, "%"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressRail, { value: p.progress })]
						}, p.id))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
					className: "p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-base font-semibold",
						children: "Today’s tasks"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 divide-y divide-border",
						children: d.todayTasks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "py-6 text-sm text-muted-foreground",
							children: "Nothing due today. Protect the focus."
						}) : d.todayTasks.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskRow, {
							task: t,
							people: members,
							compact: true
						}, t.id))
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
					className: "p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-base font-semibold",
						children: me.role === "employee" ? "Your workload" : "Team workload"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 space-y-3",
						children: d.workload.slice(0, 8).map((w) => {
							const person = members.find((m) => m.id === w.profileId);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAvatar, {
										person: person ?? {
											displayName: w.name,
											avatarKey: "slate"
										},
										size: "sm"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate text-sm",
											children: w.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-[11px] text-muted-foreground",
											children: [
												w.active,
												" active · ",
												w.completed,
												" done"
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs tabular-nums text-muted-foreground",
										children: [w.overdue, " overdue"]
									})
								]
							}, w.profileId);
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
					className: "p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-base font-semibold",
						children: "Activity"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 space-y-3",
						children: d.recentActivity.map((a) => {
							const actor = members.find((m) => m.id === a.actorId);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex gap-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAvatar, {
									person: actor,
									size: "sm"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-foreground",
										children: a.summary
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: relativeTime(a.createdAt)
									})]
								})]
							}, a.id);
						})
					})]
				})]
			}),
			d.announcements.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-base font-semibold",
					children: "Announcements"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-3",
					children: d.announcements.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: a.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: a.body
					})] }, a.id))
				})]
			}) : null,
			d.overdueTasks.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-base font-semibold",
						children: "Overdue"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-danger",
						children: [d.overdueTasks.length, " slipping"]
					})]
				}), d.overdueTasks.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskRow, {
					task: t,
					people: members
				}, t.id))]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-base font-semibold",
					children: "Upcoming"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 divide-y divide-border",
					children: d.upcoming.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between py-2.5 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: u.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-muted-foreground",
							children: [
								u.type,
								" · ",
								formatShortDate(u.dueDate)
							]
						})]
					}, `${u.type}-${u.id}`))
				})]
			}),
			projects.data && projects.data.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "No projects yet",
				description: "Create the first project to start assigning work."
			}) : null
		]
	});
}
//#endregion
export { DashboardPage as component };
