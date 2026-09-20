import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { b as parseAppHref, d as cn, x as relativeTime } from "./utils-B9mDzDE2.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { u as Skeleton } from "./router-BtGOnZ5x.mjs";
import { b as listNotifications, w as markNotificationsRead } from "./fns-n-8GfgDX.mjs";
import { t as Button } from "./button-BypPlS3y.mjs";
import { n as PageHeader, o as Surface, t as EmptyState } from "./marks-Cd80cMWe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/inbox-BI_oguZG.js
var import_jsx_runtime = require_jsx_runtime();
function InboxPage() {
	const qc = useQueryClient();
	const q = useQuery({
		queryKey: ["notifications"],
		queryFn: () => listNotifications()
	});
	const mark = useMutation({
		mutationFn: (id) => markNotificationsRead({ data: id }),
		onSuccess: () => qc.invalidateQueries()
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Alerts",
			title: "Inbox",
			description: "Assignments, mentions, reviews and deadlines.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				size: "sm",
				onClick: () => mark.mutate(void 0),
				children: "Mark all read"
			})
		}), q.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64" }) : !q.data?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "All clear",
			description: "When work needs you, it will land here."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Surface, {
			className: "divide-y divide-border",
			children: q.data.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoticeLink, {
				href: n.href,
				onOpen: () => {
					if (!n.read) mark.mutate(n.id);
				},
				className: cn("block px-4 py-3 transition-colors hover:bg-accent/50", !n.read && "bg-brand/5"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: n.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: n.body
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "shrink-0 text-[11px] text-muted-foreground",
						children: relativeTime(n.createdAt)
					})]
				})
			}, n.id))
		})]
	});
}
function NoticeLink({ href, onOpen, className, children }) {
	const parsed = parseAppHref(href);
	const props = {
		onClick: onOpen,
		className
	};
	if (parsed.kind === "task") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/tasks/$taskId",
		params: { taskId: parsed.id },
		...props,
		children
	});
	if (parsed.kind === "project") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/projects/$projectId",
		params: { projectId: parsed.id },
		...props,
		children
	});
	if (parsed.kind === "employee") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/employees/$employeeId",
		params: { employeeId: parsed.id },
		...props,
		children
	});
	if (parsed.kind === "chat") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/chat",
		search: { channel: parsed.channel },
		...props,
		children
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/",
		...props,
		children
	});
}
//#endregion
export { InboxPage as component };
