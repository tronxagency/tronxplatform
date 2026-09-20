import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { b as useNavigate, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { c as ROLE_LABEL, h as formatShortDate, m as formatHours, n as EMPLOYMENT_LABEL, x as relativeTime } from "./utils-B9mDzDE2.mjs";
import { n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { c as ProgressRail, i as Route$5, s as PersonAvatar, u as Skeleton } from "./router-BtGOnZ5x.mjs";
import { T as openDirectMessage } from "./fns-n-8GfgDX.mjs";
import { a as useWorkspace } from "./workspace-D17jfZgR.mjs";
import { t as Button } from "./button-BypPlS3y.mjs";
import { a as canModifyPerson, r as canEnroll } from "./permissions-D6YDvOLx.mjs";
import { a as StatusBadge, i as StatCard, n as PageHeader, o as Surface, r as PriorityBadge, s as TaskRow, t as EmptyState } from "./marks-Cd80cMWe.mjs";
import { s as getEmployee } from "./people-CSPjn2TS.mjs";
import { t as EnrollEmployeeDialog } from "./enroll-employee-DXag40s8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/employees._employeeId-C1YbotjB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TABS = [
	"Overview",
	"Tasks",
	"Projects",
	"Activity",
	"Files",
	"Messages",
	"Work Summary"
];
function EmployeeProfilePage() {
	const { employeeId } = Route$5.useParams();
	const { members, departments, teams, me } = useWorkspace();
	const [tab, setTab] = (0, import_react.useState)("Overview");
	const q = useQuery({
		queryKey: ["employee", employeeId],
		queryFn: () => getEmployee({ data: employeeId })
	});
	const navigate = useNavigate();
	const dm = useMutation({
		mutationFn: () => openDirectMessage({ data: employeeId }),
		onSuccess: (r) => void navigate({
			to: "/chat",
			search: { channel: r.id }
		}),
		onError: (e) => toast.error(e.message)
	});
	if (q.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-96" });
	if (!q.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		title: "Employee not found",
		description: "They may have been removed from this organization."
	});
	const { profile, tasks, projects, activity, files, time, summary } = q.data;
	const manager = members.find((m) => m.id === profile.managerId);
	const lead = members.find((m) => m.id === profile.teamLeadId);
	const dept = departments.find((d) => d.id === profile.departmentId);
	const team = teams.find((t) => t.id === profile.teamId);
	const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: profile.employeeCode ?? "Employee",
			title: profile.displayName,
			description: `${ROLE_LABEL[profile.role]} · ${profile.title}`,
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [profile.id !== me.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					size: "sm",
					onClick: () => dm.mutate(),
					disabled: dm.isPending,
					children: "Message"
				}) : null, canEnroll(me.role) || profile.id === me.id || canModifyPerson(me.role, profile.role) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EnrollEmployeeDialog, {
					person: profile,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						size: "sm",
						children: "Edit"
					})
				}) : null]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-5 lg:flex-row",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
				className: "p-5 lg:w-72 shrink-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAvatar, {
						person: profile,
						size: "lg"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: profile.displayName
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: profile.status
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-5 space-y-3 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Employee ID",
							value: profile.employeeCode ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Email",
							value: profile.email ?? profile.workEmail ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Department",
							value: dept?.name ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Team",
							value: team?.name ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Manager",
							value: manager?.displayName ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Team lead",
							value: lead?.displayName ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Joined",
							value: formatShortDate(profile.joiningDate)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Type",
							value: EMPLOYMENT_LABEL[profile.employmentType]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Location",
							value: profile.location ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Phone",
							value: profile.phone ?? "—"
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1 space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-1 overflow-x-auto no-scrollbar",
						children: TABS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setTab(t),
							className: `h-9 shrink-0 rounded-full px-3 text-sm ${tab === t ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`,
							children: t
						}, t))
					}),
					tab === "Overview" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 sm:grid-cols-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
										label: "Active",
										value: summary.pending
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
										label: "Completed",
										value: summary.completed,
										tone: "ok"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
										label: "Overdue",
										value: summary.overdue,
										tone: summary.overdue ? "danger" : "ok"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
										label: "Logged",
										value: formatHours(summary.minutes)
									})
								]
							}),
							profile.bio ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
								className: "p-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-sm font-semibold",
									children: "Bio"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted-foreground",
									children: profile.bio
								})]
							}) : null,
							profile.skills.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
								className: "p-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-sm font-semibold",
									children: "Skills"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 flex flex-wrap gap-1.5",
									children: profile.skills.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-full border border-border px-2.5 py-1 text-xs",
										children: s
									}, s))
								})]
							}) : null,
							profile.notes ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
								className: "p-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-sm font-semibold",
									children: "Notes"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted-foreground",
									children: profile.notes
								})]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
								className: "p-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "px-3 pt-3 font-display text-sm font-semibold",
									children: "Current tasks"
								}), tasks.filter((t) => t.status !== "completed").slice(0, 6).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskRow, {
									task: t,
									people: members,
									compact: true
								}, t.id))]
							})
						]
					}) : null,
					tab === "Tasks" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Surface, {
						className: "p-2",
						children: tasks.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskRow, {
								task: t,
								people: members
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriorityBadge, { priority: t.priority })]
						}, t.id))
					}) : null,
					tab === "Projects" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-3",
						children: projects.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/projects/$projectId",
							params: { projectId: p.id },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
								className: "p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-2 flex items-baseline justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium",
										children: p.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs tabular-nums text-muted-foreground",
										children: [p.progress, "%"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressRail, { value: p.progress })]
							})
						}, p.id))
					}) : null,
					tab === "Activity" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Surface, {
						className: "p-5",
						children: activity.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "No activity recorded yet."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-3",
							children: activity.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: a.summary }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: relativeTime(a.createdAt)
								})]
							}, a.id))
						})
					}) : null,
					tab === "Files" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Surface, {
						className: "p-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "space-y-2 text-sm",
							children: [files.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: f.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: formatShortDate(f.createdAt)
								})]
							}, f.id)), files.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted-foreground",
								children: "No files uploaded."
							}) : null]
						})
					}) : null,
					tab === "Messages" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
						className: "p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: [
								"Direct messages stay in Chat. Open a private thread with ",
								profile.displayName.split(" ")[0],
								"."
							]
						}), profile.id !== me.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-4",
							onClick: () => dm.mutate(),
							disabled: dm.isPending,
							children: "Open conversation"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted-foreground",
							children: "This is your profile. Messages with others live in Chat."
						})]
					}) : null,
					tab === "Work Summary" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 sm:grid-cols-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
										label: "Assigned",
										value: summary.total
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
										label: "Done",
										value: summary.completed,
										tone: "ok"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
										label: "Overdue",
										value: summary.overdue,
										tone: summary.overdue ? "danger" : "default"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
								className: "p-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-sm font-semibold",
									children: "Time log"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-3 divide-y divide-border",
									children: time.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex justify-between py-2 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: e.note || tasks.find((t) => t.id === e.taskId)?.title || "Time" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-xs text-muted-foreground",
											children: [
												formatHours(e.minutes),
												" · ",
												formatShortDate(e.startedAt)
											]
										})]
									}, e.id))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
								className: "p-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-sm font-semibold",
									children: "Due vs done"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 space-y-2",
									children: tasks.slice(0, 8).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-3 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "truncate",
											children: t.title
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: t.status }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-muted-foreground",
												children: t.dueDate && t.dueDate < today && t.status !== "completed" ? "overdue" : formatShortDate(t.dueDate)
											})]
										})]
									}, t.id))
								})]
							})
						]
					}) : null
				]
			})]
		})]
	});
}
function Row({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "truncate text-right",
			children: value
		})]
	});
}
//#endregion
export { EmployeeProfilePage as component };
