import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { c as ROLE_LABEL } from "./utils-B9mDzDE2.mjs";
import { i as useQueryClient, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { s as PersonAvatar } from "./router-BtGOnZ5x.mjs";
import { a as useWorkspace, n as UserButton } from "./workspace-D17jfZgR.mjs";
import { t as Button } from "./button-BypPlS3y.mjs";
import { i as Textarea, n as Label, t as Input } from "./forms-C511-LKE.mjs";
import { n as PageHeader, o as Surface } from "./marks-Cd80cMWe.mjs";
import { u as updateEmployee } from "./people-CSPjn2TS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-CgaTgnTt.js
var import_jsx_runtime = require_jsx_runtime();
function SettingsPage() {
	const { me, org } = useWorkspace();
	const qc = useQueryClient();
	const save = useMutation({
		mutationFn: (data) => updateEmployee({ data }),
		onSuccess: async () => {
			toast.success("Profile saved");
			await qc.invalidateQueries({ queryKey: ["workspace"] });
		},
		onError: (e) => toast.error(e.message)
	});
	function onSubmit(e) {
		e.preventDefault();
		const fd = new FormData(e.currentTarget);
		save.mutate({
			id: me.id,
			name: String(fd.get("name") ?? me.displayName),
			email: me.email ?? "",
			phone: String(fd.get("phone") ?? ""),
			location: String(fd.get("location") ?? ""),
			bio: String(fd.get("bio") ?? ""),
			skills: String(fd.get("skills") ?? "")
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Account",
				title: "Settings",
				description: "Your identity in this workspace."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
				className: "p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAvatar, {
							person: me,
							size: "lg"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-lg font-semibold",
								children: me.displayName
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: me.email ?? "No email on file"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: [
									ROLE_LABEL[me.role],
									" · ",
									me.title,
									" · ",
									org.name
								]
							})
						] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-6 grid gap-3 sm:grid-cols-2",
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
									defaultValue: me.displayName,
									required: true
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "phone",
									children: "Phone"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "phone",
									name: "phone",
									defaultValue: me.phone ?? ""
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "location",
									children: "Location"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "location",
									name: "location",
									defaultValue: me.location ?? ""
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "skills",
									children: "Skills"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "skills",
									name: "skills",
									defaultValue: me.skills.join(", ")
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
									defaultValue: me.bio
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "sm:col-span-2 flex justify-end",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									disabled: save.isPending,
									children: save.isPending ? "Saving…" : "Save profile"
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 border-t border-border pt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-sm font-semibold",
					children: "Notifications"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "In-app alerts are on for assignments, mentions, reviews and missed deadlines. Email and push can follow later."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-sm font-semibold",
					children: "Work tracking"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "TRONX only records work you log or move — tasks, time entries, comments and status. There is no screen capture, keylogging or hidden monitoring."
				})]
			})
		]
	});
}
//#endregion
export { SettingsPage as component };
