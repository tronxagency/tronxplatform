import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { b as useNavigate, d as useRouterState, m as Outlet, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { c as ROLE_LABEL, d as cn, p as firstName } from "./utils-B9mDzDE2.mjs";
import { A as Bot, C as Files, D as CalendarDays, E as ChartNoAxesCombined, O as Building2, S as FolderKanban, b as LayoutDashboard, d as Shield, f as Settings, h as Plus, j as Bell, k as Briefcase, l as SquareCheckBig, n as Users, o as Timer, p as Search, r as UserPlus, u as Sparkles, v as MessageSquare, x as Inbox, y as Menu } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { h as Tip, s as PersonAvatar } from "./router-BtGOnZ5x.mjs";
import { E as searchAll, k as stopTimer } from "./fns-n-8GfgDX.mjs";
import { a as useWorkspace, n as UserButton } from "./workspace-D17jfZgR.mjs";
import { t as Button } from "./button-BypPlS3y.mjs";
import { o as hasPerm, r as canEnroll, s as portalLabel } from "./permissions-D6YDvOLx.mjs";
import { n as CreateTaskDialog, t as CreateProjectDialog } from "./create-dialogs-GWq-2m3G.mjs";
import { t as EnrollEmployeeDialog } from "./enroll-employee-DXag40s8.mjs";
import { t as _e } from "../_libs/cmdk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shell-CeFMcUSW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CommandPalette({ open, onOpenChange, onCreateTask, onEnroll }) {
	const navigate = useNavigate();
	const { me } = useWorkspace();
	const [q, setQ] = (0, import_react.useState)("");
	const results = useQuery({
		queryKey: ["search", q],
		queryFn: () => searchAll({ data: q }),
		enabled: open && q.trim().length > 0
	});
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				onOpenChange(!open);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open, onOpenChange]);
	function go(href) {
		onOpenChange(false);
		navigate({ to: href });
	}
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-[70]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "absolute inset-0 bg-background/70",
			"aria-label": "Close search",
			onClick: () => onOpenChange(false)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative mx-auto mt-[12vh] w-[min(100%-1.5rem,36rem)] overflow-hidden rounded-2xl border border-border bg-popover shadow-soft",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(_e, {
				className: "text-foreground",
				shouldFilter: q.trim().length === 0,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 border-b border-border px-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4 text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Input, {
							value: q,
							onValueChange: setQ,
							placeholder: "Search people, projects, tasks…",
							className: "h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
							className: "rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground",
							children: "ESC"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(_e.List, {
					className: "max-h-80 overflow-y-auto p-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Empty, {
							className: "px-3 py-8 text-center text-sm text-muted-foreground",
							children: "Nothing matches."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(_e.Group, {
							heading: "Actions",
							className: "mb-2 text-[11px] text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
									icon: Plus,
									label: "Create task",
									onSelect: () => {
										onOpenChange(false);
										onCreateTask();
									}
								}),
								canEnroll(me.role) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
									icon: UserPlus,
									label: "Enroll employee",
									onSelect: () => {
										onOpenChange(false);
										onEnroll?.();
									}
								}) : null,
								hasPerm(me.role, "project.create") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
									icon: FolderKanban,
									label: "Create project",
									onSelect: () => go("/projects")
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
									icon: LayoutDashboard,
									label: "Dashboard",
									onSelect: () => go("/")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
									icon: Users,
									label: "Employees",
									onSelect: () => go("/employees")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
									icon: FolderKanban,
									label: "Projects",
									onSelect: () => go("/projects")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
									icon: SquareCheckBig,
									label: "Tasks",
									onSelect: () => go("/tasks")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
									icon: MessageSquare,
									label: "Chat",
									onSelect: () => go("/chat")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
									icon: CalendarDays,
									label: "Calendar",
									onSelect: () => go("/calendar")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
									icon: Bell,
									label: "Inbox",
									onSelect: () => go("/inbox")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
									icon: Sparkles,
									label: "TRONX AI",
									onSelect: () => go("/ai")
								})
							]
						}),
						(results.data ?? []).length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Group, {
							heading: "Results",
							className: "text-[11px] text-muted-foreground",
							children: (results.data ?? []).map((hit) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(_e.Item, {
								value: `${hit.title} ${hit.subtitle}`,
								onSelect: () => go(hit.href),
								className: "cmdk-item flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-14 shrink-0 text-[10px] tracking-wide text-muted-foreground uppercase",
									children: hit.kind
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "min-w-0 truncate",
									children: hit.title
								})]
							}, `${hit.kind}-${hit.id}`))
						}) : null
					]
				})]
			})
		})]
	});
}
function Item({ icon: Icon, label, onSelect }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(_e.Item, {
		value: label,
		onSelect,
		className: cn("cmdk-item flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 text-muted-foreground" }), label]
	});
}
function AppShell() {
	const { me, org, unreadNotifications, runningTimer } = useWorkspace();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const [cmdOpen, setCmdOpen] = (0, import_react.useState)(false);
	const [taskOpen, setTaskOpen] = (0, import_react.useState)(false);
	const [enrollOpen, setEnrollOpen] = (0, import_react.useState)(false);
	const [mobileNav, setMobileNav] = (0, import_react.useState)(false);
	const qc = useQueryClient();
	const stop = useMutation({
		mutationFn: () => stopTimer(),
		onSuccess: async (r) => {
			toast.success(r.ok ? `Logged ${r.minutes}m` : "No timer running");
			await qc.invalidateQueries();
		}
	});
	(0, import_react.useEffect)(() => {
		setMobileNav(false);
	}, [pathname]);
	const nav = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "flex flex-col gap-0.5 px-2",
		children: [
			{
				to: "/",
				label: "Dashboard",
				icon: LayoutDashboard
			},
			{
				to: "/my-work",
				label: "My Work",
				icon: Briefcase
			},
			{
				to: "/tasks",
				label: "Tasks",
				icon: SquareCheckBig
			},
			{
				to: "/projects",
				label: "Projects",
				icon: FolderKanban
			},
			{
				to: "/employees",
				label: "Employees",
				icon: Users
			},
			{
				to: "/teams",
				label: "Teams",
				icon: Building2
			},
			{
				to: "/chat",
				label: "Chat",
				icon: MessageSquare
			},
			{
				to: "/calendar",
				label: "Calendar",
				icon: CalendarDays
			},
			{
				to: "/files",
				label: "Files",
				icon: Files
			},
			{
				to: "/inbox",
				label: "Inbox",
				icon: Inbox
			},
			{
				to: "/analytics",
				label: "Analytics",
				icon: ChartNoAxesCombined
			},
			{
				to: "/ai",
				label: "TRONX AI",
				icon: Bot
			}
		].map((item) => {
			const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
			const Icon = item.icon;
			const badge = item.to === "/inbox" && unreadNotifications > 0 ? unreadNotifications : 0;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: item.to,
				className: cn("flex h-10 items-center gap-3 rounded-xl px-3 text-sm transition-colors duration-150", active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex-1",
						children: item.label
					}),
					badge ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[10px] font-semibold text-brand-foreground tabular-nums",
						children: badge
					}) : null
				]
			}, item.to);
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-sidebar md:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex h-14 items-center gap-2 px-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoMark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-sm font-semibold tracking-tight",
								children: "TRONX"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-[11px] text-muted-foreground",
								children: org.name
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "px-3 pb-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setCmdOpen(true),
							className: "flex h-10 w-full items-center gap-2 rounded-xl border border-border bg-secondary px-3 text-sm text-muted-foreground transition-colors hover:text-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex-1 text-left",
									children: "Search"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
									className: "rounded-md border border-border px-1.5 text-[10px]",
									children: "⌘K"
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex-1 overflow-y-auto no-scrollbar",
						children: nav
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-t border-border p-2",
						children: [hasPerm(me.role, "employee.update") || hasPerm(me.role, "admin.audit_logs") ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/admin",
							className: cn("flex h-10 items-center gap-3 rounded-xl px-3 text-sm text-muted-foreground hover:bg-accent/60 hover:text-foreground", pathname.startsWith("/admin") && "bg-accent text-foreground"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-4" }), "Administration"]
						}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/settings",
							className: cn("flex h-10 items-center gap-3 rounded-xl px-3 text-sm text-muted-foreground hover:bg-accent/60 hover:text-foreground", pathname.startsWith("/settings") && "bg-accent text-foreground"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-4" }), "Settings"]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "md:pl-60",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur-md sm:px-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "grid size-10 place-items-center rounded-lg text-muted-foreground hover:bg-accent md:hidden",
								onClick: () => setMobileNav((v) => !v),
								"aria-label": "Open menu",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "hidden min-w-0 items-center gap-2 md:flex",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm text-muted-foreground",
										children: portalLabel(me.role)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground/50",
										children: "·"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate text-sm text-muted-foreground",
										children: ROLE_LABEL[me.role]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "ml-auto flex items-center gap-1.5",
								children: [
									runningTimer ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
										label: "Stop timer",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => stop.mutate(),
											className: "flex h-9 items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3 text-xs font-medium text-brand",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timer, { className: "size-3.5" }), "Tracking"]
										})
									}) : null,
									canEnroll(me.role) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EnrollEmployeeDialog, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										className: "hidden sm:inline-flex",
										children: "Enroll"
									}) }) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateTaskDialog, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										className: "hidden sm:inline-flex",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Task"]
									}) }),
									hasPerm(me.role, "project.create") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateProjectDialog, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										className: "hidden xl:inline-flex",
										children: "Project"
									}) }) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/inbox",
										className: "relative grid size-10 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground",
										"aria-label": "Inbox",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4" }), unreadNotifications > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-1.5 right-1.5 size-2 rounded-full bg-brand" }) : null]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 pl-1 [&_img]:hidden [&_span.grid.h-8]:hidden [&_span.text-sm.font-medium]:hidden",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAvatar, { person: me }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "hidden truncate text-sm font-medium sm:block",
												children: firstName(me.displayName)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
										]
									})
								]
							})
						]
					}),
					mobileNav ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "border-b border-border bg-sidebar p-2 md:hidden",
						children: nav
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
						className: "px-3 py-5 pb-24 sm:px-6 sm:py-8 md:pb-10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "page-enter mx-auto max-w-6xl",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-sidebar/95 backdrop-blur-md md:hidden",
				children: [
					{
						to: "/",
						icon: LayoutDashboard,
						label: "Home"
					},
					{
						to: "/tasks",
						icon: SquareCheckBig,
						label: "Tasks"
					},
					{
						to: "/employees",
						icon: Users,
						label: "People"
					},
					{
						to: "/chat",
						icon: MessageSquare,
						label: "Chat"
					},
					{
						to: "/inbox",
						icon: Inbox,
						label: "Inbox"
					}
				].map((item) => {
					const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
					const Icon = item.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: item.to,
						className: cn("flex h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[10px]", active ? "text-foreground" : "text-muted-foreground"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" }), item.label]
					}, item.to);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandPalette, {
				open: cmdOpen,
				onOpenChange: setCmdOpen,
				onCreateTask: () => setTaskOpen(true),
				onEnroll: () => setEnrollOpen(true)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateTaskDialog, {
				open: taskOpen,
				onOpenChange: setTaskOpen
			}),
			canEnroll(me.role) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EnrollEmployeeDialog, {
				open: enrollOpen,
				onOpenChange: setEnrollOpen
			}) : null
		]
	});
}
function LogoMark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
			viewBox: "0 0 24 24",
			className: "size-4",
			"aria-hidden": "true",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "currentColor",
				d: "M5 5h14v3H14v11h-4V8H5V5z"
			})
		})
	});
}
//#endregion
export { LogoMark as n, AppShell as t };
