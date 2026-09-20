import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { d as cn, f as dayKey } from "./utils-B9mDzDE2.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { u as Skeleton } from "./router-BtGOnZ5x.mjs";
import { _ as listEvents } from "./fns-n-8GfgDX.mjs";
import { t as Button } from "./button-BypPlS3y.mjs";
import { n as PageHeader, o as Surface } from "./marks-Cd80cMWe.mjs";
import { a as eachDayOfInterval, c as addDays, i as startOfMonth, n as format, o as endOfMonth, r as endOfWeek, s as startOfWeek, t as isSameMonth } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/calendar-CWrQ8Xwe.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CalendarPage() {
	const q = useQuery({
		queryKey: ["events"],
		queryFn: () => listEvents()
	});
	const [cursor, setCursor] = (0, import_react.useState)(() => /* @__PURE__ */ new Date());
	const [mode, setMode] = (0, import_react.useState)("month");
	const days = (0, import_react.useMemo)(() => {
		if (mode === "day") return [cursor];
		if (mode === "week") return eachDayOfInterval({
			start: startOfWeek(cursor, { weekStartsOn: 1 }),
			end: endOfWeek(cursor, { weekStartsOn: 1 })
		});
		return eachDayOfInterval({
			start: startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 }),
			end: endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 })
		});
	}, [cursor, mode]);
	const itemsByDay = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		const push = (key, item) => {
			const list = map.get(key) ?? [];
			list.push(item);
			map.set(key, list);
		};
		for (const e of q.data?.events ?? []) push(e.startsAt.slice(0, 10), {
			title: e.title,
			kind: "meeting"
		});
		for (const d of q.data?.deadlines ?? []) push(d.date, {
			title: d.title,
			kind: "deadline",
			href: `/tasks/${d.id}`
		});
		return map;
	}, [q.data]);
	const todayMeetings = (q.data?.events ?? []).filter((e) => e.startsAt.slice(0, 10) === dayKey(/* @__PURE__ */ new Date()));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Schedule",
			title: "Calendar",
			description: "Tasks, milestones and meetings on one grid.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => setCursor(addDays(cursor, mode === "month" ? -30 : mode === "week" ? -7 : -1)),
						children: "Prev"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => setCursor(/* @__PURE__ */ new Date()),
						children: "Today"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => setCursor(addDays(cursor, mode === "month" ? 30 : mode === "week" ? 7 : 1)),
						children: "Next"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: mode === "month" ? "default" : "secondary",
						onClick: () => setMode("month"),
						children: "Month"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: mode === "week" ? "default" : "secondary",
						onClick: () => setMode("week"),
						children: "Week"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: mode === "day" ? "default" : "secondary",
						onClick: () => setMode("day"),
						children: "Day"
					})
				]
			})
		}), q.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-96" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
				className: "p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-2 pb-3 font-display text-sm font-semibold",
						children: format(cursor, "MMMM yyyy")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground",
						children: [
							"Mon",
							"Tue",
							"Wed",
							"Thu",
							"Fri",
							"Sat",
							"Sun"
						].map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "py-1",
							children: d
						}, d))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-7 gap-1",
						children: days.map((d) => {
							const key = dayKey(d);
							const items = itemsByDay.get(key) ?? [];
							const isToday = key === dayKey(/* @__PURE__ */ new Date());
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									setCursor(d);
									setMode("day");
								},
								className: cn("min-h-20 rounded-xl border border-transparent p-1.5 text-left", !isSameMonth(d, cursor) && mode === "month" && "opacity-40", isToday && "border-brand/40 bg-brand/10"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs tabular-nums",
									children: format(d, "d")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 space-y-1",
									children: items.slice(0, 3).map((it, i) => it.href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: it.href,
										className: "block truncate rounded bg-accent px-1 text-[10px]",
										children: it.title
									}, i) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate rounded bg-accent px-1 text-[10px]",
										children: it.title
									}, i))
								})]
							}, key);
						})
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Surface, {
				className: "p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-sm font-semibold",
					children: "Today"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-3",
					children: todayMeetings.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "text-sm text-muted-foreground",
						children: "No meetings on the calendar."
					}) : todayMeetings.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: e.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								format(new Date(e.startsAt), "HH:mm"),
								" – ",
								format(new Date(e.endsAt), "HH:mm")
							]
						})]
					}, e.id))
				})]
			})]
		})]
	});
}
//#endregion
export { CalendarPage as component };
