import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { KanbanBoard } from "@/components/kanban";
import { PageHeader, StatCard, Surface, TaskRow } from "@/components/marks";
import { Skeleton } from "@/components/ui/display";
import { useWorkspace } from "@/components/workspace";
import { listTasks, listTimeEntries } from "@/lib/server/fns";
import { formatHours, formatShortDate } from "@/lib/utils";

export const Route = createFileRoute("/_app/my-work")({ component: MyWorkPage });

function MyWorkPage() {
  const { members, me } = useWorkspace();
  const tasks = useQuery({
    queryKey: ["tasks", "mine"],
    queryFn: () => listTasks({ data: { mine: true } }),
  });
  const time = useQuery({ queryKey: ["time"], queryFn: () => listTimeEntries() });
  const mine = tasks.data ?? [];
  const active = mine.filter((t) => t.status !== "completed" && t.status !== "backlog");
  const overdue = mine.filter((t) => t.dueDate && t.dueDate < new Date().toISOString().slice(0, 10) && t.status !== "completed");
  const weekMinutes = (time.data ?? [])
    .filter((e) => Date.now() - new Date(e.startedAt).getTime() < 7 * 86400000)
    .reduce((s, e) => s + e.minutes, 0);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="You" title="My work" description="Only the work on your plate — visible, not surveilled." />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Active" value={active.length} />
        <StatCard label="Overdue" value={overdue.length} tone={overdue.length ? "danger" : "ok"} />
        <StatCard label="This week" value={formatHours(weekMinutes)} hint="Time you logged" />
      </div>
      {tasks.isPending ? (
        <Skeleton className="h-64" />
      ) : (
        <KanbanBoard tasks={mine} people={members} />
      )}
      <Surface className="p-4">
        <h2 className="font-display text-sm font-semibold">Time log</h2>
        <ul className="mt-3 divide-y divide-border">
          {(time.data ?? []).map((e) => {
            const task = mine.find((t) => t.id === e.taskId);
            return (
              <li key={e.id} className="flex items-center justify-between py-2 text-sm">
                <span>{task?.title ?? e.note ?? "Unlinked"}</span>
                <span className="text-xs text-muted-foreground">
                  {formatHours(e.minutes)} · {formatShortDate(e.startedAt)}
                </span>
              </li>
            );
          })}
        </ul>
      </Surface>
      <Surface className="p-2">
        <h2 className="px-3 pt-3 font-display text-sm font-semibold">Overdue</h2>
        {overdue.map((t) => (
          <TaskRow key={t.id} task={t} people={members} />
        ))}
      </Surface>
    </div>
  );
}
