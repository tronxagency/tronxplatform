import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Play, Square } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PriorityBadge, StatusBadge, Surface } from "@/components/marks";
import { MeetButton } from "@/components/meet-dialog";
import { Button } from "@/components/ui/button";
import { PersonAvatar, Skeleton } from "@/components/ui/display";
import { Input, Textarea } from "@/components/ui/forms";
import { useWorkspace } from "@/components/workspace";
import {
  addChecklistItem,
  addComment,
  addTimeEntry,
  createTask,
  getTask,
  startTimer,
  stopTimer,
  toggleChecklist,
  updateTask,
} from "@/lib/server/fns";
import { allowedTaskStatuses, canManageWork, hasPerm } from "@/lib/permissions";
import { PRIORITIES, type Task, type TaskStatus } from "@/lib/types";
import { formatHours, formatShortDate, relativeTime } from "@/lib/utils";

export const Route = createFileRoute("/_app/tasks/$taskId")({ component: TaskPage });

function TaskPage() {
  const { taskId } = Route.useParams();
  const { members, me, runningTimer } = useWorkspace();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["task", taskId], queryFn: () => getTask({ data: taskId }) });
  const [comment, setComment] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [checkTitle, setCheckTitle] = useState("");

  const save = useMutation({
    mutationFn: (data: Parameters<typeof updateTask>[0] extends { data: infer D } ? D : never) =>
      updateTask({ data }),
    onSuccess: async () => {
      await qc.invalidateQueries();
      toast.success("Saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const commentMut = useMutation({
    mutationFn: (body: string) => addComment({ data: { taskId, body } }),
    onSuccess: async () => {
      setComment("");
      await qc.invalidateQueries({ queryKey: ["task", taskId] });
    },
  });
  const subMut = useMutation({
    mutationFn: (title: string) => createTask({ data: { title, parentId: taskId } }),
    onSuccess: async () => {
      setSubTitle("");
      await qc.invalidateQueries({ queryKey: ["task", taskId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const checkMut = useMutation({
    mutationFn: (title: string) => addChecklistItem({ data: { taskId, title } }),
    onSuccess: async () => {
      setCheckTitle("");
      await qc.invalidateQueries({ queryKey: ["task", taskId] });
    },
  });
  const toggle = useMutation({
    mutationFn: (data: { id: string; done: boolean }) => toggleChecklist({ data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["task", taskId] }),
  });
  const timerStart = useMutation({
    mutationFn: () => startTimer({ data: taskId }),
    onSuccess: async () => {
      toast.success("Timer started");
      await qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const timerStop = useMutation({
    mutationFn: () => stopTimer(),
    onSuccess: async (r) => {
      if (r.ok) toast.success(`Logged ${r.minutes}m`);
      await qc.invalidateQueries();
    },
  });
  const manualTime = useMutation({
    mutationFn: (minutes: number) => addTimeEntry({ data: { taskId, minutes } }),
    onSuccess: async () => {
      toast.success("Time added");
      await qc.invalidateQueries();
    },
  });

  if (q.isPending) return <Skeleton className="h-96" />;
  if (!q.data) return <p className="text-sm text-muted-foreground">Task not found.</p>;

  const { task, subtasks, checklist, comments, files, dependencies, activity } = q.data;
  const assignee = members.find((m) => m.id === task.assigneeId);
  const creator = members.find((m) => m.id === task.creatorId);
  const statuses = allowedTaskStatuses(me.role, task.status);

  function patch<K extends keyof typeof task>(key: K, value: (typeof task)[K]) {
    save.mutate({ id: task.id, [key]: value } as never);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-6">
        <div>
          <Link to="/tasks" className="text-xs text-muted-foreground hover:text-foreground">
            Tasks
          </Link>
          <input
            defaultValue={task.title}
            key={task.title}
            className="mt-2 w-full bg-transparent font-display text-2xl font-semibold tracking-tight outline-none"
            onBlur={(e) => {
              if (e.target.value.trim() && e.target.value !== task.title) patch("title", e.target.value);
            }}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            {task.blocked ? <span className="text-xs text-danger">Blocked</span> : null}
            <MeetButton
              label="Meet task members"
              defaultScope="direct"
              profileIds={[task.assigneeId, task.creatorId, me.id].filter(Boolean) as string[]}
              taskId={task.id}
              projectId={task.projectId ?? undefined}
              title={task.title}
            />
          </div>
          <WorkflowBar
            task={task}
            canReview={canManageWork(me.role)}
            isOwner={task.assigneeId === me.id || task.creatorId === me.id}
            onStatus={(status) => save.mutate({ id: task.id, status })}
            pending={save.isPending}
          />
        </div>

        <Surface className="p-4">
          <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Description</p>
          <Textarea
            key={task.description}
            defaultValue={task.description}
            className="mt-2 min-h-32 border-transparent bg-transparent px-0"
            onBlur={(e) => {
              if (e.target.value !== task.description) patch("description", e.target.value);
            }}
          />
        </Surface>

        <Surface className="p-4">
          <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Checklist</p>
          <ul className="mt-3 space-y-2">
            {checklist.map((c) => (
              <li key={c.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={c.done}
                  onChange={(e) => toggle.mutate({ id: c.id, done: e.target.checked })}
                  className="size-4 accent-brand"
                />
                <span className={c.done ? "text-muted-foreground line-through" : ""}>{c.title}</span>
              </li>
            ))}
          </ul>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              if (checkTitle.trim()) checkMut.mutate(checkTitle.trim());
            }}
          >
            <Input value={checkTitle} onChange={(e) => setCheckTitle(e.target.value)} placeholder="Add item" />
            <Button type="submit" variant="secondary" size="sm">
              Add
            </Button>
          </form>
        </Surface>

        <Surface className="p-4">
          <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Subtasks</p>
          <ul className="mt-3 space-y-2">
            {subtasks.map((s) => (
              <li key={s.id}>
                <Link to="/tasks/$taskId" params={{ taskId: s.id }} className="text-sm hover:underline">
                  {s.title}
                </Link>
                <span className="ml-2 text-xs text-muted-foreground">{s.status.replaceAll("_", " ")}</span>
              </li>
            ))}
          </ul>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (subTitle.trim()) subMut.mutate(subTitle.trim());
            }}
          >
            <Input value={subTitle} onChange={(e) => setSubTitle(e.target.value)} placeholder="New subtask" />
            <Button type="submit" variant="secondary" size="sm">
              Add
            </Button>
          </form>
        </Surface>

        <Surface className="p-4">
          <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Discussion</p>
          <div className="mt-3 space-y-3">
            {comments.map((c) => {
              const author = members.find((m) => m.id === c.authorId);
              return (
                <div key={c.id} className="flex gap-3">
                  <PersonAvatar person={author} size="sm" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {author?.displayName} · {relativeTime(c.createdAt)}
                    </p>
                    <p className="text-sm">{c.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (comment.trim()) commentMut.mutate(comment.trim());
            }}
          >
            <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a comment…" />
            <Button type="submit" size="sm">
              Send
            </Button>
          </form>
        </Surface>
      </div>

      <aside className="space-y-4">
        <Surface className="space-y-3 p-4">
          <Field label="Status">
            <select
              value={task.status}
              onChange={(e) => save.mutate({ id: task.id, status: e.target.value as TaskStatus })}
              className="h-9 w-full rounded-lg border border-input bg-secondary px-2 text-sm"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Priority">
            <select
              value={task.priority}
              onChange={(e) => save.mutate({ id: task.id, priority: e.target.value })}
              className="h-9 w-full rounded-lg border border-input bg-secondary px-2 text-sm"
            >
              {PRIORITIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Assignee">
            {hasPerm(me.role, "task.assign") ? (
              <select
                value={task.assigneeId ?? ""}
                onChange={(e) => save.mutate({ id: task.id, assigneeId: e.target.value || null })}
                className="h-9 w-full rounded-lg border border-input bg-secondary px-2 text-sm"
              >
                <option value="">Unassigned</option>
                {members.filter((m) => m.status === "active").map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.displayName}
                  </option>
                ))}
              </select>
            ) : (
              <p className="flex h-9 items-center text-sm">{assignee?.displayName ?? "Unassigned"}</p>
            )}
          </Field>
          <Field label="Due">
            <Input
              type="date"
              defaultValue={task.dueDate ?? ""}
              onBlur={(e) => save.mutate({ id: task.id, dueDate: e.target.value || null })}
            />
          </Field>
          <Field label="Estimate">{formatHours(task.estimatedMinutes)}</Field>
          <Field label="Logged">{formatHours(task.actualMinutes)}</Field>
          <Field label="Creator">{creator?.displayName ?? "—"}</Field>
          <Field label="Assignee now">{assignee?.displayName ?? "—"}</Field>
          <Field label="Due date">{formatShortDate(task.dueDate)}</Field>
        </Surface>

        <Surface className="p-4">
          <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Time</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {runningTimer ? (
              <Button size="sm" variant="secondary" onClick={() => timerStop.mutate()}>
                <Square className="size-3.5" />
                Stop
              </Button>
            ) : (
              <Button size="sm" onClick={() => timerStart.mutate()}>
                <Play className="size-3.5" />
                Start timer
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => manualTime.mutate(30)}>
              +30m
            </Button>
          </div>
        </Surface>

        {dependencies.length > 0 ? (
          <Surface className="p-4">
            <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Depends on</p>
            <ul className="mt-2 space-y-1 text-sm">
              {dependencies.map((d) => (
                <li key={d.depends_on_id}>
                  <Link to="/tasks/$taskId" params={{ taskId: d.depends_on_id }} className="hover:underline">
                    {d.title}
                  </Link>
                </li>
              ))}
            </ul>
          </Surface>
        ) : null}

        {files.length > 0 ? (
          <Surface className="p-4">
            <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Files</p>
            <ul className="mt-2 space-y-1 text-sm">
              {files.map((f) => (
                <li key={f.id}>{f.name}</li>
              ))}
            </ul>
          </Surface>
        ) : null}

        <Surface className="p-4">
          <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Activity</p>
          <ul className="mt-2 space-y-2 text-xs text-muted-foreground">
            {activity.map((a) => (
              <li key={a.id}>
                {a.summary} · {relativeTime(a.createdAt)}
              </li>
            ))}
          </ul>
        </Surface>
      </aside>
    </div>
  );
}

function WorkflowBar({
  task,
  canReview,
  isOwner,
  onStatus,
  pending,
}: {
  task: Task;
  canReview: boolean;
  isOwner: boolean;
  onStatus: (status: TaskStatus) => void;
  pending: boolean;
}) {
  const actions: { label: string; status: TaskStatus; variant?: "default" | "secondary" }[] = [];
  if (isOwner || canReview) {
    if (task.status === "todo" || task.status === "backlog" || task.status === "changes_requested") {
      actions.push({ label: "Start work", status: "in_progress" });
    }
    if (task.status === "in_progress") {
      actions.push({ label: "Submit for review", status: "in_review" });
      actions.push({ label: "Mark blocked", status: "blocked", variant: "secondary" });
    }
    if (task.status === "blocked") {
      actions.push({ label: "Resume", status: "in_progress" });
    }
  }
  if (canReview && task.status === "in_review") {
    actions.push({ label: "Approve", status: "completed" });
    actions.push({ label: "Request changes", status: "changes_requested", variant: "secondary" });
  }
  if (actions.length === 0) return null;
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {actions.map((a) => (
        <Button key={a.status} size="sm" variant={a.variant ?? "default"} disabled={pending} onClick={() => onStatus(a.status)}>
          {a.label}
        </Button>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] tracking-wide text-muted-foreground uppercase">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
