import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { c as ROLE_LABEL, n as EMPLOYMENT_LABEL, r as EMPLOYMENT_TYPES, t as AVATAR_CLASS } from "./utils-B9mDzDE2.mjs";
import { i as useQueryClient, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as useWorkspace } from "./workspace-D17jfZgR.mjs";
import { t as Button } from "./button-BypPlS3y.mjs";
import { a as canModifyPerson, n as assignableRoles, r as canEnroll } from "./permissions-D6YDvOLx.mjs";
import { i as Textarea, n as Label, r as Select, t as Input } from "./forms-C511-LKE.mjs";
import { n as DialogContent, r as DialogTrigger, t as Dialog } from "./overlay-BrkklbCo.mjs";
import { o as enrollEmployee, u as updateEmployee } from "./people-CSPjn2TS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/enroll-employee-DXag40s8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function EnrollEmployeeDialog({ children, person, open: controlledOpen, onOpenChange }) {
	const { me, members, teams, departments } = useWorkspace();
	const [internalOpen, setInternalOpen] = (0, import_react.useState)(false);
	const open = controlledOpen ?? internalOpen;
	const setOpen = onOpenChange ?? setInternalOpen;
	const qc = useQueryClient();
	const navigate = useNavigate();
	const isEdit = Boolean(person);
	const enroll = useMutation({
		mutationFn: (payload) => enrollEmployee({ data: payload }),
		onSuccess: async (res) => {
			toast.success(`Enrolled ${res.employeeCode}`);
			setOpen(false);
			await qc.invalidateQueries();
			if (res.id) await navigate({
				to: "/employees/$employeeId",
				params: { employeeId: res.id }
			});
		},
		onError: (e) => toast.error(e.message)
	});
	const update = useMutation({
		mutationFn: (payload) => updateEmployee({ data: payload }),
		onSuccess: async () => {
			toast.success("Employee updated");
			setOpen(false);
			await qc.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	if (!isEdit && !canEnroll(me.role)) return null;
	if (isEdit && person && person.id !== me.id && !canModifyPerson(me.role, person.role) && !canEnroll(me.role)) return null;
	function onSubmit(e) {
		e.preventDefault();
		const fd = new FormData(e.currentTarget);
		const payload = {
			name: String(fd.get("name") ?? ""),
			email: String(fd.get("email") ?? ""),
			title: String(fd.get("title") ?? ""),
			role: String(fd.get("role") ?? "employee"),
			departmentId: String(fd.get("departmentId") || "") || void 0,
			teamId: String(fd.get("teamId") || "") || void 0,
			managerId: String(fd.get("managerId") || "") || void 0,
			teamLeadId: String(fd.get("teamLeadId") || "") || void 0,
			phone: String(fd.get("phone") ?? ""),
			gender: String(fd.get("gender") ?? ""),
			dob: String(fd.get("dob") ?? ""),
			emergencyContact: String(fd.get("emergencyContact") ?? ""),
			employmentType: String(fd.get("employmentType") ?? "full_time"),
			location: String(fd.get("location") ?? ""),
			workEmail: String(fd.get("workEmail") ?? ""),
			joiningDate: String(fd.get("joiningDate") ?? ""),
			skills: String(fd.get("skills") ?? ""),
			bio: String(fd.get("bio") ?? ""),
			notes: String(fd.get("notes") ?? ""),
			avatarKey: String(fd.get("avatarKey") ?? "zinc"),
			status: String(fd.get("status") || person?.status || "invited")
		};
		if (person) update.mutate({
			...payload,
			id: person.id
		});
		else enroll.mutate(payload);
	}
	const roles = assignableRoles(me.role);
	const managers = members.filter((m) => m.role === "ceo" || m.role === "founder" || m.role === "manager");
	const leads = members.filter((m) => m.role === "team_lead" || m.role === "manager");
	const busy = enroll.isPending || update.isPending;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [children ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			title: isEdit ? "Edit employee" : "Enroll employee",
			className: "w-[min(100%-1.5rem,44rem)] max-h-[88vh] overflow-y-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: isEdit ? "Updates land immediately. Role changes are limited by your own authority." : "Creates their account and portal. They activate it by signing in with this email."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-5 space-y-6",
				onSubmit,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
						title: "Personal",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Full name",
								name: "name",
								required: true,
								placeholder: "Priya Menon",
								defaultValue: person?.displayName
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Email",
								name: "email",
								type: "email",
								required: true,
								placeholder: "priya@tronx.dev",
								defaultValue: person?.email ?? ""
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Phone",
								name: "phone",
								placeholder: "+91 98000 00000",
								defaultValue: person?.phone ?? ""
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "gender",
									children: "Gender"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									id: "gender",
									name: "gender",
									defaultValue: person?.gender ?? "",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "Prefer not to say"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "woman",
											children: "Woman"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "man",
											children: "Man"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "nonbinary",
											children: "Non-binary"
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Date of birth",
								name: "dob",
								type: "date",
								defaultValue: person?.dob ?? ""
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Emergency contact",
								name: "emergencyContact",
								placeholder: "Name · phone",
								defaultValue: person?.emergencyContact ?? ""
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
						title: "Professional",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Job title",
								name: "title",
								required: true,
								placeholder: "Backend Engineer",
								defaultValue: person?.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "role",
									children: "Role"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
									id: "role",
									name: "role",
									defaultValue: person?.role ?? "employee",
									disabled: person?.role === "ceo",
									children: (person?.role === "ceo" ? ["ceo"] : roles).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: r,
										children: ROLE_LABEL[r]
									}, r))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "departmentId",
									children: "Department"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									id: "departmentId",
									name: "departmentId",
									defaultValue: person?.departmentId ?? "",
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
									htmlFor: "teamId",
									children: "Team"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									id: "teamId",
									name: "teamId",
									defaultValue: person?.teamId ?? "",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "Unassigned"
									}), teams.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: t.id,
										children: t.name
									}, t.id))]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "managerId",
									children: "Manager"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									id: "managerId",
									name: "managerId",
									defaultValue: person?.managerId ?? "",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "Unassigned"
									}), managers.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: m.id,
										children: m.displayName
									}, m.id))]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "teamLeadId",
									children: "Team lead"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									id: "teamLeadId",
									name: "teamLeadId",
									defaultValue: person?.teamLeadId ?? "",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "Unassigned"
									}), leads.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: m.id,
										children: m.displayName
									}, m.id))]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "employmentType",
									children: "Employment type"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
									id: "employmentType",
									name: "employmentType",
									defaultValue: person?.employmentType ?? "full_time",
									children: EMPLOYMENT_TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: t,
										children: EMPLOYMENT_LABEL[t]
									}, t))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Location",
								name: "location",
								placeholder: "Bengaluru",
								defaultValue: person?.location ?? ""
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Work email",
								name: "workEmail",
								type: "email",
								placeholder: "Same as email if blank",
								defaultValue: person?.workEmail ?? ""
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Joining date",
								name: "joiningDate",
								type: "date",
								defaultValue: person?.joiningDate ?? ""
							}),
							isEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "status",
									children: "Account status"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									id: "status",
									name: "status",
									defaultValue: person?.status ?? "active",
									disabled: person?.role === "ceo",
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
								})]
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
						title: "Profile",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "sm:col-span-2 space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "skills",
									children: "Skills"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "skills",
									name: "skills",
									placeholder: "react, postgres, systems",
									defaultValue: person?.skills.join(", ")
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "sm:col-span-2 space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "bio",
									children: "Bio"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									id: "bio",
									name: "bio",
									placeholder: "A short professional summary",
									defaultValue: person?.bio
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "sm:col-span-2 space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "notes",
									children: "Internal notes"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									id: "notes",
									name: "notes",
									placeholder: "Visible to managers and above",
									defaultValue: person?.notes
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "avatarKey",
									children: "Avatar color"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
									id: "avatarKey",
									name: "avatarKey",
									defaultValue: person?.avatarKey ?? "zinc",
									children: Object.keys(AVATAR_CLASS).map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: k,
										children: k
									}, k))
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-end gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "secondary",
							onClick: () => setOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: busy,
							children: busy ? "Saving…" : isEdit ? "Save changes" : "Create employee"
						})]
					})
				]
			}, person?.id ?? "new")]
		})]
	});
}
function Section({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
		className: "text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase",
		children: title
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-3 grid gap-3 sm:grid-cols-2",
		children
	})] });
}
function Field({ label, name, type = "text", required, placeholder, defaultValue }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			htmlFor: name,
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			id: name,
			name,
			type,
			required,
			placeholder,
			defaultValue
		})]
	});
}
//#endregion
export { EnrollEmployeeDialog as t };
