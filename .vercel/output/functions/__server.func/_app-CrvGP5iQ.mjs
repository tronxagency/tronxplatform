import { c as require_jsx_runtime } from "./_libs/@radix-ui/react-collection+[...].mjs";
import { u as Skeleton } from "./_ssr/router-BtGOnZ5x.mjs";
import { i as useCurrentUserState, r as WorkspaceProvider, t as RedirectToSignIn } from "./_ssr/workspace-D17jfZgR.mjs";
import { t as AppShell } from "./_ssr/shell-CeFMcUSW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app-CrvGP5iQ.js
var import_jsx_runtime = require_jsx_runtime();
function AuthenticatedLayout() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "hidden w-60 border-r border-border p-4 md:block",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-6 w-24" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 space-y-2",
				children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-full" }, i))
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Loading TRONX Workspace"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-6 h-8 w-56" })]
		})]
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspaceProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {}) });
}
//#endregion
export { AuthenticatedLayout as component };
