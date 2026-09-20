import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { h as formatShortDate } from "./utils-B9mDzDE2.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { c as ProgressRail, s as PersonAvatar, u as Skeleton } from "./router-BtGOnZ5x.mjs";
import { x as listProjects } from "./fns-n-8GfgDX.mjs";
import { a as useWorkspace } from "./workspace-D17jfZgR.mjs";
import { t as Button } from "./button-BypPlS3y.mjs";
import { o as hasPerm } from "./permissions-D6YDvOLx.mjs";
import { t as CreateProjectDialog } from "./create-dialogs-GWq-2m3G.mjs";
import { n as PageHeader, o as Surface, t as EmptyState } from "./marks-Cd80cMWe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/projects.index-Dz-3VpMD.js
var import_jsx_runtime = require_jsx_runtime();
function ProjectsPage() {
	const { members, me } = useWorkspace();
	const q = useQuery({
		queryKey: ["projects"],
		queryFn: () => listProjects()
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Portfolio",
			title: "Projects",
			description: "Every active bet, with progress computed from real work.",
			actions: hasPerm(me.role, "project.create") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateProjectDialog, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "New project" }) }) : null
		}), q.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3 sm:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40" })]
		}) : !q.data?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "No projects",
			description: "Create a project to group tasks, files and chat."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 sm:grid-cols-2",
			children: q.data.map((p) => {
				const owner = members.find((m) => m.id === p.ownerId);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/projects/$projectId",
					params: { projectId: p.id },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
						className: "h-full p-5 transition-colors duration-150 hover:bg-accent/40",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-lg font-semibold tracking-tight",
									children: p.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 line-clamp-2 text-sm text-muted-foreground",
									children: p.description
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-accent px-2 py-0.5 text-[11px] text-muted-foreground capitalize",
									children: p.status.replace("_", " ")
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-1.5 flex justify-between text-xs text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										p.taskDone,
										"/",
										p.taskTotal,
										" complete"
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "tabular-nums",
										children: [p.progress, "%"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressRail, { value: p.progress })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex items-center justify-between",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex -space-x-1.5",
										children: p.memberIds.slice(0, 5).map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAvatar, {
											person: members.find((m) => m.id === id),
											size: "sm",
											className: "ring-2 ring-card"
										}, id))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs text-muted-foreground",
										children: ["Due ", formatShortDate(p.dueDate)]
									}),
									owner ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "sr-only",
										children: ["Owner ", owner.displayName]
									}) : null
								]
							})
						]
					})
				}, p.id);
			})
		})]
	});
}
//#endregion
export { ProjectsPage as component };
