import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { c as ROLE_LABEL } from "./utils-B9mDzDE2.mjs";
import { i as useQueryClient, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { s as PersonAvatar } from "./router-BtGOnZ5x.mjs";
import { a as useWorkspace } from "./workspace-D17jfZgR.mjs";
import { t as Button } from "./button-BypPlS3y.mjs";
import { o as hasPerm } from "./permissions-D6YDvOLx.mjs";
import { i as Textarea, n as Label, r as Select, t as Input } from "./forms-C511-LKE.mjs";
import { n as DialogContent, r as DialogTrigger, t as Dialog } from "./overlay-BrkklbCo.mjs";
import { n as PageHeader, o as Surface } from "./marks-Cd80cMWe.mjs";
import { a as createTeam, i as createDepartment, n as addTeamMember } from "./people-CSPjn2TS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/teams-CPdDb3cq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TeamsPage() {
	const { me, teams, members, departments } = useWorkspace();
	const qc = useQueryClient();
	const canDept = hasPerm(me.role, "department.create");
	const canTeam = hasPerm(me.role, "team.create");
	const canManage = hasPerm(me.role, "team.manage");
	const add = useMutation({
		mutationFn: (data) => addTeamMember({ data }),
		onSuccess: async () => {
			toast.success("Added to team");
			await qc.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Organization",
				title: "Departments & teams",
				description: "How the company is structured — departments, teams and the people in them.",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [canDept ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateDepartmentDialog, {}) : null, canTeam ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateTeamDialog, {}) : null]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-sm font-semibold tracking-tight",
					children: "Departments"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
					children: departments.map((d) => {
						const head = members.find((m) => m.id === d.headId);
						const count = members.filter((m) => m.departmentId === d.id).length;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
							className: "p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display font-semibold",
									children: d.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: d.description
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-3 text-xs text-muted-foreground",
									children: [
										head ? `Head · ${head.displayName}` : "No head",
										" · ",
										count,
										" people"
									]
								})
							]
						}, d.id);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-sm font-semibold tracking-tight",
					children: "Teams"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 lg:grid-cols-3",
					children: teams.map((t) => {
						const lead = members.find((m) => m.id === t.leadId);
						const dept = departments.find((d) => d.id === t.departmentId);
						const available = members.filter((m) => m.status === "active" && !t.memberIds.includes(m.id));
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
							className: "p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-lg font-semibold",
									children: t.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: t.description
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-3 text-xs text-muted-foreground",
									children: [dept?.name ?? "No department", lead ? ` · Lead ${lead.displayName}` : ""]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 space-y-2",
									children: t.memberIds.map((id) => {
										const p = members.find((m) => m.id === id);
										if (!p) return null;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/employees/$employeeId",
											params: { employeeId: id },
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAvatar, {
												person: p,
												size: "sm"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "min-w-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "truncate text-sm",
													children: p.displayName
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs text-muted-foreground",
													children: p.title
												})]
											})]
										}, id);
									})
								}),
								canManage && available.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									className: "mt-4 h-9 w-full rounded-lg border border-input bg-secondary px-2 text-xs",
									defaultValue: "",
									onChange: (e) => {
										if (e.target.value) add.mutate({
											teamId: t.id,
											profileId: e.target.value
										});
										e.target.value = "";
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "Add member…"
									}), available.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: m.id,
										children: m.displayName
									}, m.id))]
								}) : null
							]
						}, t.id);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Surface, {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-xs tracking-wide text-muted-foreground uppercase",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium",
									children: "Name"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium",
									children: "Title"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium",
									children: "Role"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium",
									children: "Department"
								})
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: members.filter((m) => m.status !== "disabled").map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
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
									}), m.displayName]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-muted-foreground",
								children: m.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-muted-foreground",
								children: ROLE_LABEL[m.role]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-muted-foreground",
								children: departments.find((d) => d.id === m.departmentId)?.name ?? "—"
							})
						]
					}, m.id)) })]
				})
			})
		]
	});
}
function CreateDepartmentDialog() {
	const qc = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const mut = useMutation({
		mutationFn: (data) => createDepartment({ data }),
		onSuccess: async () => {
			toast.success("Department created");
			setOpen(false);
			await qc.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	function onSubmit(e) {
		e.preventDefault();
		const fd = new FormData(e.currentTarget);
		mut.mutate({
			name: String(fd.get("name") ?? ""),
			description: String(fd.get("description") ?? "")
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "secondary",
				children: "New department"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
			title: "New department",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-4 space-y-3",
				onSubmit,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "dept-name",
							children: "Name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "dept-name",
							name: "name",
							required: true,
							placeholder: "Design"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "dept-desc",
							children: "Description"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "dept-desc",
							name: "description"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: mut.isPending,
							children: "Create"
						})
					})
				]
			})
		})]
	});
}
function CreateTeamDialog() {
	const { departments, members } = useWorkspace();
	const qc = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const mut = useMutation({
		mutationFn: (data) => createTeam({ data }),
		onSuccess: async () => {
			toast.success("Team created");
			setOpen(false);
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
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				children: "New team"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
			title: "New team",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-4 space-y-3",
				onSubmit,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "team-name",
							children: "Name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "team-name",
							name: "name",
							required: true,
							placeholder: "MERN Team"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "team-desc",
							children: "Description"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "team-desc",
							name: "description"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "team-dept",
							children: "Department"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							id: "team-dept",
							name: "departmentId",
							defaultValue: "",
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
							htmlFor: "team-lead",
							children: "Lead"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							id: "team-lead",
							name: "leadId",
							defaultValue: "",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Unassigned"
							}), members.filter((m) => m.role === "team_lead" || m.role === "manager").map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: m.id,
								children: m.displayName
							}, m.id))]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: mut.isPending,
							children: "Create"
						})
					})
				]
			})
		})]
	});
}
//#endregion
export { TeamsPage as component };
