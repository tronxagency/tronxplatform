import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { d as cn } from "./utils-B9mDzDE2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/forms-C511-LKE.js
var import_jsx_runtime = require_jsx_runtime();
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("h-10 w-full rounded-lg border border-input bg-secondary px-3 text-sm text-foreground placeholder:text-muted-foreground/80 transition-[box-shadow,border-color] duration-150 focus-visible:border-ring/50 focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50", className),
		...props
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("min-h-24 w-full rounded-xl border border-input bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/80 transition-[box-shadow,border-color] duration-150 focus-visible:border-ring/50 focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50", className),
		...props
	});
}
function Select({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
		className: cn("h-10 w-full rounded-lg border border-input bg-secondary px-3 text-sm text-foreground transition-[box-shadow,border-color] duration-150 focus-visible:border-ring/50 focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50", className),
		...props
	});
}
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("text-xs font-medium text-muted-foreground", className),
		...props
	});
}
//#endregion
export { Textarea as i, Label as n, Select as r, Input as t };
