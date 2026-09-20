import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as Link, y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { c as ROLE_LABEL, x as relativeTime } from "./utils-B9mDzDE2.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { s as PersonAvatar } from "./router-BtGOnZ5x.mjs";
import { M as updateMember, u as getAdmin } from "./fns-n-8GfgDX.mjs";
import { a as useWorkspace } from "./workspace-D17jfZgR.mjs";
import { t as Button } from "./button-BypPlS3y.mjs";
import { a as canModifyPerson, n as assignableRoles, o as hasPerm } from "./permissions-D6YDvOLx.mjs";
import { n as Label, r as Select, t as Input } from "./forms-C511-LKE.mjs";
import { n as PageHeader, o as Surface } from "./marks-Cd80cMWe.mjs";
import { a as createTeam, d as updateOrgSettings, i as createDepartment, r as createAnnouncement } from "./people-CSPjn2TS.mjs";
import { t as EnrollEmployeeDialog } from "./enroll-employee-DXag40s8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-L4yu2oQV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TABS = [
	"People",
	"Departments",
	"Teams",
	"Announcements",
	"Audit",
	"Settings"
];
function AdminPage() {
	const { me, members, departments, teams, org } = useWorkspace();
	const allowed = hasPerm(me.role, "employee.update") || hasPerm(me.role, "admin.audit_logs");
	const qc = useQueryClient();
	const q = useQuery({
		queryKey: ["admin"],
		queryFn: () => getAdmin(),
		enabled: allowed
	});
	const [tab, setTab] = (0, import_react.useState)("People");
	const update = useMutation({
		mutationFn: (data) => updateMember({ data }),
		onSuccess: () => {
			toast.success("Member updated");
			qc.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	if (!allowed) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	const tabs = TABS.filter((t) => {
		if (t === "Audit") return hasPerm(me.role, "admin.audit_logs");
		if (t === "Settings") return hasPerm(me.role, "admin.settings");
		if (t === "Announcements") return hasPerm(me.role, "announce.send");
		if (t === "Departments") return hasPerm(me.role, "department.create");
		if (t === "Teams") return hasPerm(me.role, "team.create");
		return true;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Administration",
				title: "Organization",
				description: "People, departments, teams and the audit trail. Enrollment is limited to CEO, directors and managers.",
				actions: hasPerm(me.role, "employee.create") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EnrollEmployeeDialog, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					children: "Enroll employee"
				}) }) : null
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-1 overflow-x-auto no-scrollbar",
				children: tabs.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTab(t),
					className: `h-9 shrink-0 rounded-full px-3 text-sm ${tab === t ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`,
					children: t
				}, t))
			}),
			tab === "People" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Surface, {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-[11px] tracking-wide text-muted-foreground uppercase",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium",
									children: "Person"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium",
									children: "Email"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium",
									children: "Role"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium",
									children: "Status"
								})
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: (q.data?.members ?? members).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border last:border-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/employees/$employeeId",
									params: { employeeId: m.id },
									className: "flex items-center gap-2 hover:underline",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAvatar, {
										person: m,
										size: "sm"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: m.displayName }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-[11px] text-muted-foreground",
										children: [
											m.title,
											" · ",
											m.employeeCode ?? ""
										]
									})] })]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-muted-foreground",
								children: m.email ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: canModifyPerson(me.role, m.role) && m.id !== me.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
									value: m.role,
									onChange: (e) => update.mutate({
										id: m.id,
										role: e.target.value
									}),
									className: "h-8 text-xs",
									children: (assignableRoles(me.role).includes(m.role) ? assignableRoles(me.role) : [m.role, ...assignableRoles(me.role)]).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: r,
										children: ROLE_LABEL[r]
									}, r))
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm",
									children: ROLE_LABEL[m.role]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: canModifyPerson(me.role, m.role) && m.id !== me.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: m.status,
									onChange: (e) => update.mutate({
										id: m.id,
										status: e.target.value
									}),
									className: "h-8 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "active",
											children: "Active"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "invited",
											children: "Invited"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "disabled",
											children: "Disabled"
										})
									]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm capitalize",
									children: m.status
								})
							})
						]
					}, m.id)) })]
				})
			}) : null,
			tab === "Departments" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeptForm, {}) : null,
			tab === "Teams" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeamForm, {}) : null,
			tab === "Announcements" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnnounceForm, {}) : null,
			tab === "Audit" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
				className: "p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-sm font-semibold",
						children: "Audit log"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "Read-only. Ordinary users cannot edit this trail."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 space-y-2",
						children: (q.data?.audit ?? []).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex justify-between gap-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: a.summary || a.action }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "shrink-0 text-xs text-muted-foreground",
								children: relativeTime(a.createdAt)
							})]
						}, a.id))
					})
				]
			}) : null,
			tab === "Settings" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrgForm, { defaultName: org.name }) : null,
			tab === "People" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
				className: "p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-sm font-semibold",
						children: "Permission matrix"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: "CEO, Founder/Director and Manager may enroll employees. Team leads and employees cannot — the API rejects those requests even if a button is forced."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-left text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "text-muted-foreground uppercase tracking-wide",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-border",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 pr-3",
											children: "Capability"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 pr-3",
											children: "CEO"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 pr-3",
											children: "Director"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 pr-3",
											children: "Manager"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 pr-3",
											children: "Lead"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2",
											children: "Employee"
										})
									]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
								className: "text-muted-foreground",
								children: [
									[
										"Enroll employees",
										"Yes",
										"Yes",
										"Yes",
										"No",
										"No"
									],
									[
										"Assign tasks",
										"Yes",
										"Yes",
										"Yes",
										"Yes",
										"Self"
									],
									[
										"Company analytics",
										"Yes",
										"Yes",
										"Team",
										"Team",
										"Own"
									],
									[
										"Change CEO",
										"—",
										"No",
										"No",
										"No",
										"No"
									],
									[
										"Audit logs",
										"Yes",
										"Yes",
										"No",
										"No",
										"No"
									]
								].map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
									className: "border-b border-border last:border-0",
									children: row.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2 pr-3",
										children: c
									}, `${row[0]}-${i}`))
								}, row[0]))
							})]
						})
					})
				]
			}) : null
		]
	});
}
function DeptForm() {
	const { members } = useWorkspace();
	const qc = useQueryClient();
	const { departments } = useWorkspace();
	const mut = useMutation({
		mutationFn: (data) => createDepartment({ data }),
		onSuccess: async () => {
			toast.success("Department created");
			await qc.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	function onSubmit(e) {
		e.preventDefault();
		const fd = new FormData(e.currentTarget);
		mut.mutate({
			name: String(fd.get("name") ?? ""),
			description: String(fd.get("description") ?? ""),
			headId: String(fd.get("headId") || "") || void 0
		});
		e.currentTarget.reset();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-[1fr_1fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
			className: "p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-sm font-semibold",
				children: "New department"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-3 space-y-3",
				onSubmit,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "dname",
							children: "Name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "dname",
							name: "name",
							required: true,
							placeholder: "Software Development"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "ddesc",
							children: "Description"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "ddesc",
							name: "description"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "dhead",
							children: "Head"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							id: "dhead",
							name: "headId",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Unassigned"
							}), members.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: m.id,
								children: m.displayName
							}, m.id))]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: mut.isPending,
						children: "Create"
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
			className: "p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-sm font-semibold",
				children: "Departments"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-2 text-sm",
				children: departments.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: d.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: d.description
				})] }, d.id))
			})]
		})]
	});
}
function TeamForm() {
	const { members, departments, teams } = useWorkspace();
	const qc = useQueryClient();
	const mut = useMutation({
		mutationFn: (data) => createTeam({ data }),
		onSuccess: async () => {
			toast.success("Team created");
			await qc.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	function onSubmit(e) {
		e.preventDefault();
		const fd = new FormData(e.currentTarget);
		mut.mutate({
			name: String(fd.get("name") ?? ""),
			description: String(fd.get("description") ?? ""),
			departmentId: String(fd.get("departmentId") || "") || void 0,
			leadId: String(fd.get("leadId") || "") || void 0
		});
		e.currentTarget.reset();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-[1fr_1fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
			className: "p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-sm font-semibold",
				children: "New team"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-3 space-y-3",
				onSubmit,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "tname",
							children: "Name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "tname",
							name: "name",
							required: true,
							placeholder: "MERN Team"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "tdesc",
							children: "Description"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "tdesc",
							name: "description"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "tdep",
							children: "Department"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							id: "tdep",
							name: "departmentId",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Unassigned"
							}), departments.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: d.id,
								children: d.name
							}, d.id))]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "tlead",
							children: "Lead"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							id: "tlead",
							name: "leadId",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Unassigned"
							}), members.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: m.id,
								children: m.displayName
							}, m.id))]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: mut.isPending,
						children: "Create"
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
			className: "p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-sm font-semibold",
				children: "Teams"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-2 text-sm",
				children: teams.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: t.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [t.memberIds.length, " members"]
				})] }, t.id))
			})]
		})]
	});
}
function AnnounceForm() {
	const qc = useQueryClient();
	const { announcements } = useWorkspace();
	const mut = useMutation({
		mutationFn: (data) => createAnnouncement({ data }),
		onSuccess: async () => {
			toast.success("Announcement sent");
			await qc.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	function onSubmit(e) {
		e.preventDefault();
		const fd = new FormData(e.currentTarget);
		mut.mutate({
			title: String(fd.get("title") ?? ""),
			body: String(fd.get("body") ?? "")
		});
		e.currentTarget.reset();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-[1fr_1fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
			className: "p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-sm font-semibold",
				children: "Send announcement"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-3 space-y-3",
				onSubmit,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "atitle",
							children: "Title"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "atitle",
							name: "title",
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "abody",
							children: "Body"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "abody",
							name: "body",
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: mut.isPending,
						children: "Send"
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
			className: "p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-sm font-semibold",
				children: "Recent"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-3 text-sm",
				children: announcements.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: a.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground",
					children: a.body
				})] }, a.id))
			})]
		})]
	});
}
function OrgForm({ defaultName }) {
	const qc = useQueryClient();
	const mut = useMutation({
		mutationFn: (name) => updateOrgSettings({ data: { name } }),
		onSuccess: async () => {
			toast.success("Organization updated");
			await qc.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	function onSubmit(e) {
		e.preventDefault();
		const fd = new FormData(e.currentTarget);
		mut.mutate(String(fd.get("name") ?? ""));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
		className: "p-5 max-w-lg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-sm font-semibold",
			children: "Organization"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-3 space-y-3",
			onSubmit,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "oname",
					children: "Name"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "oname",
					name: "name",
					defaultValue: defaultName,
					required: true
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				disabled: mut.isPending,
				children: "Save"
			})]
		})]
	});
}
//#endregion
export { AdminPage as component };
