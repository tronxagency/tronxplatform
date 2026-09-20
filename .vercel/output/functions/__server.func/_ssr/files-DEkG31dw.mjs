import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { h as formatShortDate } from "./utils-B9mDzDE2.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { u as Skeleton } from "./router-BtGOnZ5x.mjs";
import { r as addFile, v as listFiles, x as listProjects } from "./fns-n-8GfgDX.mjs";
import { t as Input } from "./forms-C511-LKE.mjs";
import { n as PageHeader, o as Surface, t as EmptyState } from "./marks-Cd80cMWe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/files-DEkG31dw.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function FilesPage() {
	const qc = useQueryClient();
	const [q, setQ] = (0, import_react.useState)("");
	const files = useQuery({
		queryKey: ["files", q],
		queryFn: () => listFiles({ data: { q } })
	});
	const projects = useQuery({
		queryKey: ["projects"],
		queryFn: () => listProjects()
	});
	const upload = useMutation({
		mutationFn: (data) => addFile({ data }),
		onSuccess: async () => {
			toast.success("File attached");
			await qc.invalidateQueries({ queryKey: ["files"] });
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Library",
				title: "Files",
				description: "Project and task attachments in one searchable place."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2 sm:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: q,
					onChange: (e) => setQ(e.target.value),
					placeholder: "Search files",
					className: "sm:max-w-xs"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "inline-flex h-10 cursor-pointer items-center rounded-lg border border-border bg-secondary px-3 text-sm",
					children: ["Attach file", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "file",
						className: "hidden",
						onChange: (e) => {
							const file = e.target.files?.[0];
							if (!file) return;
							upload.mutate({
								name: file.name,
								mime: file.type,
								sizeBytes: file.size
							});
							e.target.value = "";
						}
					})]
				})]
			}),
			files.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64" }) : !files.data?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "No files",
				description: "Attach something to a project or task and it will appear here."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Surface, {
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
									children: "Name"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium",
									children: "Project"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium",
									children: "Size"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium",
									children: "Added"
								})
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: files.data.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border last:border-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: f.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-muted-foreground",
								children: projects.data?.find((p) => p.id === f.projectId)?.name ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-muted-foreground tabular-nums",
								children: f.sizeBytes > 1e6 ? `${(f.sizeBytes / 1e6).toFixed(1)} MB` : `${Math.round(f.sizeBytes / 1e3)} KB`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-muted-foreground",
								children: formatShortDate(f.createdAt)
							})
						]
					}, f.id)) })]
				})
			})
		]
	});
}
//#endregion
export { FilesPage as component };
