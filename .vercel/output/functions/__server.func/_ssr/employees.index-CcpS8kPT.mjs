import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { c as ROLE_LABEL, v as isOnline } from "./utils-B9mDzDE2.mjs";
import { s as PersonAvatar } from "./router-BtGOnZ5x.mjs";
import { a as useWorkspace } from "./workspace-D17jfZgR.mjs";
import { t as Button } from "./button-BypPlS3y.mjs";
import { r as canEnroll } from "./permissions-D6YDvOLx.mjs";
import { r as Select, t as Input } from "./forms-C511-LKE.mjs";
import { n as PageHeader, t as EmptyState } from "./marks-Cd80cMWe.mjs";
import { t as EnrollEmployeeDialog } from "./enroll-employee-DXag40s8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/employees.index-CcpS8kPT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function EmployeesPage() {
	const { me, members, teams, departments, openTasksByProfile } = useWorkspace();
	const [q, setQ] = (0, import_react.useState)("");
	const [role, setRole] = (0, import_react.useState)("");
	const [dept, setDept] = (0, import_react.useState)("");
	const [team, setTeam] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("");
	const filtered = (0, import_react.useMemo)(() => {
		const term = q.trim().toLowerCase();
		return members.filter((m) => {
			if (status && m.status !== status) return false;
			if (role && m.role !== role) return false;
			if (dept && m.departmentId !== dept) return false;
			if (team && m.teamId !== team) return false;
			if (!term) return true;
			return m.displayName.toLowerCase().includes(term) || (m.email ?? "").toLowerCase().includes(term) || (m.employeeCode ?? "").toLowerCase().includes(term) || m.title.toLowerCase().includes(term);
		});
	}, [
		members,
		q,
		role,
		dept,
		team,
		status
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "People",
				title: "Employees",
				description: "The company directory — search, open a profile, enroll someone new if you can.",
				actions: canEnroll(me.role) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EnrollEmployeeDialog, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "Enroll employee" }) }) : null
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: "Name, ID, email…"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: role,
						onChange: (e) => setRole(e.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "All roles"
						}), Object.entries(ROLE_LABEL).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: k,
							children: v
						}, k))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: dept,
						onChange: (e) => setDept(e.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "All departments"
						}), departments.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: d.id,
							children: d.name
						}, d.id))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: team,
						onChange: (e) => setTeam(e.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "All teams"
						}), teams.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: t.id,
							children: t.name
						}, t.id))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: status,
						onChange: (e) => setStatus(e.target.value),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Any status"
							}),
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
					})
				]
			}),
			filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "No one matches",
				description: "Try a different search or clear the filters."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-3",
				children: filtered.map((m) => {
					const department = departments.find((d) => d.id === m.departmentId);
					const tm = teams.find((t) => t.id === m.teamId);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/employees/$employeeId",
						params: { employeeId: m.id },
						className: "rounded-2xl border border-border bg-card p-4 shadow-soft transition-colors hover:border-ring/40",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAvatar, { person: m }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate font-medium",
										children: m.displayName
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-xs text-muted-foreground",
										children: m.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 text-[11px] tracking-wide text-muted-foreground uppercase",
										children: [
											ROLE_LABEL[m.role],
											" · ",
											department?.name ?? "No dept"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: [
											tm?.name ?? "No team",
											" · ",
											m.employeeCode ?? "—",
											" · ",
											openTasksByProfile[m.id] ?? 0,
											" open"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-[11px] text-muted-foreground",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: isOnline(m.lastSeenAt) ? "text-ok" : "",
											children: isOnline(m.lastSeenAt) ? "Online" : m.status
										})
									})
								]
							})]
						})
					}, m.id);
				})
			})
		]
	});
}
//#endregion
export { EmployeesPage as component };
