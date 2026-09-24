import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Eye, Pencil, Reply, ThumbsUp, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/marks";
import { Button } from "@/components/ui/button";
import { PersonAvatar, ScrollArea } from "@/components/ui/display";
import { Input } from "@/components/ui/forms";
import { useWorkspace } from "@/components/workspace";
import { canManageWork } from "@/lib/permissions";
import {
  createGroupChannel,
  deleteMessage,
  editMessage,
  getChannelPresence,
  listChannels,
  listMessages,
  openDirectMessage,
  pingTyping,
  sendMessage,
  toggleReaction,
} from "@/lib/server/fns";
import { MeetButton } from "@/components/meet-dialog";
import { cn, isOnline, relativeTime } from "@/lib/utils";

type ChatSearch = { channel?: string };

export const Route = createFileRoute("/_app/chat")({
  validateSearch: (search: Record<string, unknown>): ChatSearch => ({
    channel: typeof search.channel === "string" ? search.channel : undefined,
  }),
  component: ChatPage,
});

const REACTIONS = [
  { id: "up", label: "Up", Icon: ThumbsUp },
  { id: "check", label: "Check", Icon: Check },
  { id: "eyes", label: "Seen", Icon: Eye },
] as const;

function ChatPage() {
  const { channel: searchChannel } = Route.useSearch();
  const { members, me } = useWorkspace();
  const qc = useQueryClient();
  const channels = useQuery({
    queryKey: ["channels"],
    queryFn: () => listChannels(),
    refetchInterval: 8000,
  });
  const [active, setActive] = useState<string | undefined>(searchChannel);
  const [filter, setFilter] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; body: string } | null>(null);
  useEffect(() => {
    if (searchChannel) setActive(searchChannel);
  }, [searchChannel]);
  useEffect(() => {
    if (!active && channels.data?.[0]) setActive(channels.data[0].id);
  }, [active, channels.data]);

  const messages = useQuery({
    queryKey: ["messages", active],
    queryFn: () => listMessages({ data: active! }),
    enabled: Boolean(active),
    refetchInterval: 3000,
  });
  const [body, setBody] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const send = useMutation({
    mutationFn: () => sendMessage({ data: { channelId: active!, body, parentId: replyTo?.id } }),
    onSuccess: async () => {
      setBody("");
      setReplyTo(null);
      await qc.invalidateQueries({ queryKey: ["messages", active] });
      await qc.invalidateQueries({ queryKey: ["channels"] });
    },
  });
  const dm = useMutation({
    mutationFn: (profileId: string) => openDirectMessage({ data: profileId }),
    onSuccess: async (res) => {
      setActive(res.id);
      await qc.invalidateQueries({ queryKey: ["channels"] });
    },
  });
  const react = useMutation({
    mutationFn: (data: { messageId: string; emoji: string }) => toggleReaction({ data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["messages", active] }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteMessage({ data: id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["messages", active] }),
  });
  const edit = useMutation({
    mutationFn: (data: { id: string; body: string }) => editMessage({ data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["messages", active] }),
  });
  const group = useMutation({
    mutationFn: (profileIds: string[]) => createGroupChannel({ data: { profileIds } }),
    onSuccess: async (res) => {
      setActive(res.id);
      await qc.invalidateQueries({ queryKey: ["channels"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const typeMut = useMutation({
    mutationFn: () => pingTyping({ data: active! }),
  });
  const presence = useQuery({
    queryKey: ["presence", active],
    queryFn: () => getChannelPresence({ data: active! }),
    enabled: Boolean(active),
    refetchInterval: 4000,
  });

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages.data?.length]);

  const grouped = useMemo(() => {
    const all = channels.data ?? [];
    return {
      company: all.filter((c) => c.type === "company"),
      department: all.filter((c) => c.type === "department"),
      team: all.filter((c) => c.type === "team"),
      project: all.filter((c) => c.type === "project"),
      groups: all.filter((c) => c.type === "group"),
      dms: all.filter((c) => c.type === "dm"),
    };
  }, [channels.data]);
  const current = (channels.data ?? []).find((c) => c.id === active);
  const q = filter.trim().toLowerCase();
  const visibleMessages = (messages.data ?? []).filter((m) => !q || m.body.toLowerCase().includes(q));
  const byId = new Map((messages.data ?? []).map((m) => [m.id, m]));

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="Communication" title="Chat" description="Company, department, team, project rooms and direct messages." />
      <div className="grid min-h-[70vh] overflow-hidden rounded-2xl border border-border bg-card lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="border-b border-border p-3 lg:border-r lg:border-b-0">
          <ChannelGroup title="Company" items={grouped.company} active={active} onPick={setActive} />
          <ChannelGroup title="Departments" items={grouped.department} active={active} onPick={setActive} />
          <ChannelGroup title="Teams" items={grouped.team} active={active} onPick={setActive} />
          <ChannelGroup title="Projects" items={grouped.project} active={active} onPick={setActive} />
          <ChannelGroup title="Groups" items={grouped.groups} active={active} onPick={setActive} />
          <p className="mt-3 px-2 pb-2 text-[11px] tracking-wide text-muted-foreground uppercase">Direct</p>
          {grouped.dms.map((c) => (
            <ChannelBtn key={c.id} name={c.name} unread={c.unread} active={c.id === active} onClick={() => setActive(c.id)} />
          ))}
          <div className="mt-3 px-2">
            <select
              className="h-9 w-full rounded-lg border border-input bg-secondary px-2 text-xs"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) dm.mutate(e.target.value);
                e.target.value = "";
              }}
            >
              <option value="">Message someone…</option>
              {members.filter((m) => m.id !== me.id).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.displayName}
                  {isOnline(m.lastSeenAt) ? " · online" : ""}
                </option>
              ))}
            </select>
            <select
              className="mt-2 h-9 w-full rounded-lg border border-input bg-secondary px-2 text-xs"
              defaultValue=""
              onChange={(e) => {
                const id = e.target.value;
                e.target.value = "";
                if (!id) return;
                const others = members.filter((m) => m.id !== me.id && m.id !== id && m.status === "active").slice(0, 1);
                if (others.length === 0) {
                  toast.error("Need two other people for a group");
                  return;
                }
                group.mutate([id, others[0]!.id]);
              }}
            >
              <option value="">Start a group…</option>
              {members.filter((m) => m.id !== me.id && m.status === "active").map((m) => (
                <option key={m.id} value={m.id}>
                  Group with {m.displayName}…
                </option>
              ))}
            </select>
          </div>
        </aside>
        <section className="flex min-h-[50vh] flex-col">
          <header className="flex items-center gap-3 border-b border-border px-4 py-3">
            <p className="min-w-0 flex-1 truncate text-sm font-medium">
              {current ? (current.type === "dm" ? current.name : `# ${current.name}`) : "Select a channel"}
            </p>
            {current?.type === "dm" ? (
              <MeetButton
                label="Video call"
                defaultScope="direct"
                title={`Call ${current.name}`}
                profileIds={members.filter((m) => current.name.includes(m.displayName) && m.id !== me.id).slice(0, 1).map((m) => m.id)}
              />
            ) : current?.type === "team" || current?.type === "project" || current?.type === "company" ? (
              <MeetButton
                label="Video call"
                defaultScope={current.type === "company" ? "company" : current.type === "team" ? "team" : "project"}
                title={`${current.name} call`}
              />
            ) : null}
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search this channel"
              className="h-8 max-w-48 text-xs"
            />
          </header>
          <ScrollArea className="flex-1">
            <div ref={scroller} className="space-y-4 p-4">
              {visibleMessages.map((m) => {
                const author = members.find((p) => p.id === m.authorId);
                const parent = m.parentId ? byId.get(m.parentId) : null;
                const mine = m.authorId === me.id;
                return (
                  <div key={m.id} className="group flex gap-3">
                    <PersonAvatar person={author} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">
                        {author?.displayName ?? "Unknown"}
                        {isOnline(author?.lastSeenAt) ? " · online" : ""}
                        {" · "}
                        {relativeTime(m.createdAt)}
                        {m.editedAt ? " · edited" : ""}
                      </p>
                      {parent ? (
                        <p className="mt-1 truncate rounded-md border border-border bg-secondary px-2 py-1 text-xs text-muted-foreground">
                          {parent.body}
                        </p>
                      ) : null}
                      {editingId === m.id ? (
                        <form
                          className="mt-1 flex gap-2"
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (editBody.trim()) {
                              edit.mutate({ id: m.id, body: editBody.trim() });
                              setEditingId(null);
                            }
                          }}
                        >
                          <Input value={editBody} onChange={(e) => setEditBody(e.target.value)} autoFocus />
                          <Button type="submit" size="sm">
                            Save
                          </Button>
                          <Button type="button" size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                        </form>
                      ) : (
                        <p className="text-sm leading-relaxed">{m.body}</p>
                      )}
                      <div className="mt-1.5 flex flex-wrap items-center gap-1">
                        {m.reactions.map((r) => {
                          const meta = REACTIONS.find((x) => x.id === r.emoji);
                          const Icon = meta?.Icon;
                          return (
                            <button
                              key={r.emoji}
                              type="button"
                              onClick={() => react.mutate({ messageId: m.id, emoji: r.emoji })}
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs",
                                r.profileIds.includes(me.id)
                                  ? "border-brand/40 bg-brand/10 text-brand"
                                  : "border-border text-muted-foreground hover:text-foreground",
                              )}
                            >
                              {Icon ? <Icon className="size-3" /> : r.emoji}
                              {r.profileIds.length}
                            </button>
                          );
                        })}
                        {REACTIONS.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            title={r.label}
                            onClick={() => react.mutate({ messageId: m.id, emoji: r.id })}
                            className="grid size-6 place-items-center rounded-md text-muted-foreground opacity-0 hover:bg-accent hover:text-foreground group-hover:opacity-100"
                          >
                            <r.Icon className="size-3" />
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setReplyTo({ id: m.id, body: m.body })}
                          className="grid size-6 place-items-center rounded-md text-muted-foreground opacity-0 hover:bg-accent group-hover:opacity-100"
                          title="Reply"
                        >
                          <Reply className="size-3" />
                        </button>
                        {mine ? (
                          <button
                            type="button"
                            title="Edit"
                            onClick={() => {
                              setEditingId(m.id);
                              setEditBody(m.body);
                            }}
                            className="grid size-6 place-items-center rounded-md text-muted-foreground opacity-0 hover:bg-accent group-hover:opacity-100"
                          >
                            <Pencil className="size-3" />
                          </button>
                        ) : null}
                        {mine || canManageWork(me.role) ? (
                          <button
                            type="button"
                            title="Delete"
                            onClick={() => remove.mutate(m.id)}
                            className="grid size-6 place-items-center rounded-md text-muted-foreground opacity-0 hover:bg-accent hover:text-danger group-hover:opacity-100"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          <form
            className="border-t border-border p-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (body.trim() && active) send.mutate();
            }}
          >
            {replyTo ? (
              <div className="mb-2 flex items-center justify-between rounded-lg bg-secondary px-2 py-1 text-[11px] text-muted-foreground">
                <span className="truncate">Reply: {replyTo.body}</span>
                <button type="button" onClick={() => setReplyTo(null)}>
                  Cancel
                </button>
              </div>
            ) : null}
            <div className="flex gap-2">
              <Input
                value={body}
                onChange={(e) => {
                  setBody(e.target.value);
                  if (active && e.target.value.trim()) typeMut.mutate();
                }}
                placeholder={current ? `Message ${current.name} — use @name to mention` : "Select a channel"}
                disabled={!active}
              />
              <Button type="submit" disabled={!active || send.isPending}>
                Send
              </Button>
            </div>
            {(presence.data?.typingIds ?? []).length > 0 ? (
              <p className="mt-2 text-[11px] text-muted-foreground">
                {presence.data!.typingIds
                  .map((id) => members.find((m) => m.id === id)?.displayName)
                  .filter(Boolean)
                  .join(", ")}{" "}
                typing…
              </p>
            ) : null}
          </form>
        </section>
      </div>
    </div>
  );
}

function ChannelGroup({
  title,
  items,
  active,
  onPick,
}: {
  title: string;
  items: { id: string; name: string; unread: number }[];
  active?: string;
  onPick: (id: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <>
      <p className="mt-3 px-2 pb-2 text-[11px] tracking-wide text-muted-foreground uppercase first:mt-0">{title}</p>
      {items.map((c) => (
        <ChannelBtn key={c.id} name={`# ${c.name}`} unread={c.unread} active={c.id === active} onClick={() => onPick(c.id)} />
      ))}
    </>
  );
}

function ChannelBtn({
  name,
  unread,
  active,
  onClick,
}: {
  name: string;
  unread: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-9 w-full items-center rounded-lg px-2 text-left text-sm",
        active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
      )}
    >
      <span className="min-w-0 flex-1 truncate">{name}</span>
      {unread > 0 ? (
        <span className="grid min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[10px] font-semibold text-brand-foreground">
          {unread}
        </span>
      ) : null}
    </button>
  );
}
