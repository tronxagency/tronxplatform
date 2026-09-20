import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { d as cn } from "./utils-B9mDzDE2.mjs";
import { t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as askTronxAi } from "./fns-n-8GfgDX.mjs";
import { a as useWorkspace } from "./workspace-D17jfZgR.mjs";
import { t as Button } from "./button-BypPlS3y.mjs";
import { i as Textarea } from "./forms-C511-LKE.mjs";
import { n as PageHeader, o as Surface } from "./marks-Cd80cMWe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai-D7UOHYej.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PROMPTS_BY_ROLE = {
	ceo: [
		"Give me a company work summary.",
		"Which projects are behind schedule?",
		"Show me all blocked tasks.",
		"Who is overloaded this week?",
		"Summarize today's company activity."
	],
	founder: [
		"Give me a company work summary.",
		"Which projects are behind schedule?",
		"Show me all blocked tasks.",
		"Who is overloaded this week?",
		"Summarize today's company activity."
	],
	manager: [
		"Show my team's overdue tasks.",
		"Who is overloaded?",
		"Summarize the team's progress.",
		"What is blocking my team?",
		"What is due this week?"
	],
	team_lead: [
		"Show my team's overdue tasks.",
		"Who on my team is overloaded?",
		"Summarize the team's progress.",
		"What is due today for my team?"
	],
	employee: [
		"What are my tasks today?",
		"What is due tomorrow?",
		"Summarize my tasks.",
		"What am I blocked on?"
	]
};
function AiPage() {
	const { me } = useWorkspace();
	const [prompt, setPrompt] = (0, import_react.useState)("");
	const [history, setHistory] = (0, import_react.useState)([]);
	const ask = useMutation({
		mutationFn: (q) => askTronxAi({ data: { prompt: q } }),
		onSuccess: (res, q) => {
			const a = res.ok ? res.text : res.error;
			setHistory((h) => [...h, {
				q,
				a
			}]);
			setPrompt("");
		}
	});
	const prompts = PROMPTS_BY_ROLE[me.role] ?? PROMPTS_BY_ROLE.employee;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Assistant",
				title: "TRONX AI",
				description: "Ask about projects, load, blockers and deadlines. Answers stay inside this workspace."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: prompts.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setPrompt(p);
						ask.mutate(p);
					},
					className: "rounded-full border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground",
					children: p
				}, p))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5",
					children: [history.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Ask about your work, your team, or the company — answers stay inside this workspace and respect your role."
					}) : history.map((turn, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: turn.q
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground",
							children: turn.a
						})]
					}, i)), ask.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-brand",
						children: "Thinking…"
					}) : null]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-6 space-y-3",
					onSubmit: (e) => {
						e.preventDefault();
						if (prompt.trim()) ask.mutate(prompt.trim());
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: prompt,
						onChange: (e) => setPrompt(e.target.value),
						placeholder: "Ask TRONX AI…",
						className: cn("min-h-24")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: ask.isPending || !prompt.trim(),
							children: ask.isPending ? "Asking…" : "Ask"
						})
					})]
				})]
			})
		]
	});
}
//#endregion
export { AiPage as component };
