import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { d as cn, v as isOnline, x as relativeTime } from "./utils-B9mDzDE2.mjs";
import { T as Check, _ as Pencil, a as Trash2, m as Reply, s as ThumbsUp, w as Eye } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as Route$15, l as ScrollArea, s as PersonAvatar } from "./router-BtGOnZ5x.mjs";
import { D as sendMessage, T as openDirectMessage, c as deleteMessage, g as listChannels, j as toggleReaction, l as editMessage, y as listMessages } from "./fns-n-8GfgDX.mjs";
import { a as useWorkspace } from "./workspace-D17jfZgR.mjs";
import { t as Button } from "./button-BypPlS3y.mjs";
import { i as canManageWork } from "./permissions-D6YDvOLx.mjs";
import { t as Input } from "./forms-C511-LKE.mjs";
import { n as PageHeader } from "./marks-Cd80cMWe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/chat-Dyb0K9y6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var REACTIONS = [
	{
		id: "up",
		label: "Up",
		Icon: ThumbsUp
	},
	{
		id: "check",
		label: "Check",
		Icon: Check
	},
	{
		id: "eyes",
		label: "Seen",
		Icon: Eye
	}
];
function ChatPage() {
	const { channel: searchChannel } = Route$15.useSearch();
	const { members, me } = useWorkspace();
	const qc = useQueryClient();
	const channels = useQuery({
		queryKey: ["channels"],
		queryFn: () => listChannels(),
		refetchInterval: 8e3
	});
	const [active, setActive] = (0, import_react.useState)(searchChannel);
	const [filter, setFilter] = (0, import_react.useState)("");
	const [replyTo, setReplyTo] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (searchChannel) setActive(searchChannel);
	}, [searchChannel]);
	(0, import_react.useEffect)(() => {
		if (!active && channels.data?.[0]) setActive(channels.data[0].id);
	}, [active, channels.data]);
	const messages = useQuery({
		queryKey: ["messages", active],
		queryFn: () => listMessages({ data: active }),
		enabled: Boolean(active),
		refetchInterval: 3e3
	});
	const [body, setBody] = (0, import_react.useState)("");
	const [editingId, setEditingId] = (0, import_react.useState)(null);
	const [editBody, setEditBody] = (0, import_react.useState)("");
	const scroller = (0, import_react.useRef)(null);
	const send = useMutation({
		mutationFn: () => sendMessage({ data: {
			channelId: active,
			body,
			parentId: replyTo?.id
		} }),
		onSuccess: async () => {
			setBody("");
			setReplyTo(null);
			await qc.invalidateQueries({ queryKey: ["messages", active] });
			await qc.invalidateQueries({ queryKey: ["channels"] });
		}
	});
	const dm = useMutation({
		mutationFn: (profileId) => openDirectMessage({ data: profileId }),
		onSuccess: async (res) => {
			setActive(res.id);
			await qc.invalidateQueries({ queryKey: ["channels"] });
		}
	});
	const react = useMutation({
		mutationFn: (data) => toggleReaction({ data }),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["messages", active] })
	});
	const remove = useMutation({
		mutationFn: (id) => deleteMessage({ data: id }),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["messages", active] })
	});
	const edit = useMutation({
		mutationFn: (data) => editMessage({ data }),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["messages", active] })
	});
	(0, import_react.useEffect)(() => {
		scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
	}, [messages.data?.length]);
	const grouped = (0, import_react.useMemo)(() => {
		const all = channels.data ?? [];
		return {
			company: all.filter((c) => c.type === "company"),
			department: all.filter((c) => c.type === "department"),
			team: all.filter((c) => c.type === "team"),
			project: all.filter((c) => c.type === "project"),
			dms: all.filter((c) => c.type === "dm")
		};
	}, [channels.data]);
	const current = (channels.data ?? []).find((c) => c.id === active);
	const q = filter.trim().toLowerCase();
	const visibleMessages = (messages.data ?? []).filter((m) => !q || m.body.toLowerCase().includes(q));
	const byId = new Map((messages.data ?? []).map((m) => [m.id, m]));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Communication",
			title: "Chat",
			description: "Company, department, team, project rooms and direct messages."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid min-h-[70vh] overflow-hidden rounded-2xl border border-border bg-card lg:grid-cols-[16rem_minmax(0,1fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "border-b border-border p-3 lg:border-r lg:border-b-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelGroup, {
						title: "Company",
						items: grouped.company,
						active,
						onPick: setActive
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelGroup, {
						title: "Departments",
						items: grouped.department,
						active,
						onPick: setActive
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelGroup, {
						title: "Teams",
						items: grouped.team,
						active,
						onPick: setActive
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelGroup, {
						title: "Projects",
						items: grouped.project,
						active,
						onPick: setActive
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 px-2 pb-2 text-[11px] tracking-wide text-muted-foreground uppercase",
						children: "Direct"
					}),
					grouped.dms.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelBtn, {
						name: c.name,
						unread: c.unread,
						active: c.id === active,
						onClick: () => setActive(c.id)
					}, c.id)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 px-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "h-9 w-full rounded-lg border border-input bg-secondary px-2 text-xs",
							defaultValue: "",
							onChange: (e) => {
								if (e.target.value) dm.mutate(e.target.value);
								e.target.value = "";
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Message someone…"
							}), members.filter((m) => m.id !== me.id).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: m.id,
								children: [m.displayName, isOnline(m.lastSeenAt) ? " · online" : ""]
							}, m.id))]
						})
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex min-h-[50vh] flex-col",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "flex items-center gap-3 border-b border-border px-4 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "min-w-0 flex-1 truncate text-sm font-medium",
							children: current ? current.type === "dm" ? current.name : `# ${current.name}` : "Select a channel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: filter,
							onChange: (e) => setFilter(e.target.value),
							placeholder: "Search this channel",
							className: "h-8 max-w-48 text-xs"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
						className: "flex-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							ref: scroller,
							className: "space-y-4 p-4",
							children: visibleMessages.map((m) => {
								const author = members.find((p) => p.id === m.authorId);
								const parent = m.parentId ? byId.get(m.parentId) : null;
								const mine = m.authorId === me.id;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "group flex gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAvatar, { person: author }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-xs text-muted-foreground",
												children: [
													author?.displayName ?? "Unknown",
													isOnline(author?.lastSeenAt) ? " · online" : "",
													" · ",
													relativeTime(m.createdAt),
													m.editedAt ? " · edited" : ""
												]
											}),
											parent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 truncate rounded-md border border-border bg-secondary px-2 py-1 text-xs text-muted-foreground",
												children: parent.body
											}) : null,
											editingId === m.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
												className: "mt-1 flex gap-2",
												onSubmit: (e) => {
													e.preventDefault();
													if (editBody.trim()) {
														edit.mutate({
															id: m.id,
															body: editBody.trim()
														});
														setEditingId(null);
													}
												},
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														value: editBody,
														onChange: (e) => setEditBody(e.target.value),
														autoFocus: true
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														type: "submit",
														size: "sm",
														children: "Save"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														type: "button",
														size: "sm",
														variant: "ghost",
														onClick: () => setEditingId(null),
														children: "Cancel"
													})
												]
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm leading-relaxed",
												children: m.body
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-1.5 flex flex-wrap items-center gap-1",
												children: [
													m.reactions.map((r) => {
														const Icon = REACTIONS.find((x) => x.id === r.emoji)?.Icon;
														return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
															type: "button",
															onClick: () => react.mutate({
																messageId: m.id,
																emoji: r.emoji
															}),
															className: cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs", r.profileIds.includes(me.id) ? "border-brand/40 bg-brand/10 text-brand" : "border-border text-muted-foreground hover:text-foreground"),
															children: [Icon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3" }) : r.emoji, r.profileIds.length]
														}, r.emoji);
													}),
													REACTIONS.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														title: r.label,
														onClick: () => react.mutate({
															messageId: m.id,
															emoji: r.id
														}),
														className: "grid size-6 place-items-center rounded-md text-muted-foreground opacity-0 hover:bg-accent hover:text-foreground group-hover:opacity-100",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(r.Icon, { className: "size-3" })
													}, r.id)),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														onClick: () => setReplyTo({
															id: m.id,
															body: m.body
														}),
														className: "grid size-6 place-items-center rounded-md text-muted-foreground opacity-0 hover:bg-accent group-hover:opacity-100",
														title: "Reply",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reply, { className: "size-3" })
													}),
													mine ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														title: "Edit",
														onClick: () => {
															setEditingId(m.id);
															setEditBody(m.body);
														},
														className: "grid size-6 place-items-center rounded-md text-muted-foreground opacity-0 hover:bg-accent group-hover:opacity-100",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-3" })
													}) : null,
													mine || canManageWork(me.role) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														title: "Delete",
														onClick: () => remove.mutate(m.id),
														className: "grid size-6 place-items-center rounded-md text-muted-foreground opacity-0 hover:bg-accent hover:text-danger group-hover:opacity-100",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3" })
													}) : null
												]
											})
										]
									})]
								}, m.id);
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "border-t border-border p-3",
						onSubmit: (e) => {
							e.preventDefault();
							if (body.trim() && active) send.mutate();
						},
						children: [replyTo ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-2 flex items-center justify-between rounded-lg bg-secondary px-2 py-1 text-[11px] text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "truncate",
								children: ["Reply: ", replyTo.body]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setReplyTo(null),
								children: "Cancel"
							})]
						}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: body,
								onChange: (e) => setBody(e.target.value),
								placeholder: current ? `Message ${current.name} — use @name to mention` : "Select a channel",
								disabled: !active
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: !active || send.isPending,
								children: "Send"
							})]
						})]
					})
				]
			})]
		})]
	});
}
function ChannelGroup({ title, items, active, onPick }) {
	if (items.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-3 px-2 pb-2 text-[11px] tracking-wide text-muted-foreground uppercase first:mt-0",
		children: title
	}), items.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelBtn, {
		name: `# ${c.name}`,
		unread: c.unread,
		active: c.id === active,
		onClick: () => onPick(c.id)
	}, c.id))] });
}
function ChannelBtn({ name, unread, active, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: cn("flex h-9 w-full items-center rounded-lg px-2 text-left text-sm", active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "min-w-0 flex-1 truncate",
			children: name
		}), unread > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "grid min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[10px] font-semibold text-brand-foreground",
			children: unread
		}) : null]
	});
}
//#endregion
export { ChatPage as component };
