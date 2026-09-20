import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { updateTask } from "@/lib/server/fns";
import { allowedTaskStatuses } from "@/lib/permissions";
import {
  STATUS_LABEL,
  TASK_STATUSES,
  type Profile,
  type Task,
  type TaskStatus,
} from "@/lib/types";
import { cn, formatShortDate } from "@/lib/utils";
import { PersonAvatar } from "./ui/display";
import { PriorityBadge } from "./marks";
import { useWorkspace } from "./workspace";

export function KanbanBoard({ tasks, people }: { tasks: Task[]; people: Profile[] }) {
  const { me } = useWorkspace();
  const qc = useQueryClient();
  const [over, setOver] = useState<TaskStatus | null>(null);
  const mut = useMutation({
    mutationFn: (data: { id: string; status: TaskStatus }) => updateTask({ data }),
    onSuccess: () => qc.invalidateQueries(),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {TASK_STATUSES.map((status) => {
        const col = tasks.filter((t) => t.status === status);
        return (
          <section
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(status);
            }}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData("text/task-id");
              const task = tasks.find((t) => t.id === id);
              if (id && task && !allowedTaskStatuses(me.role, task.status).includes(status)) {
                toast.error("That status change is not allowed for your role");
                setOver(null);
                return;
              }
              if (id) mut.mutate({ id, status });
              setOver(null);
            }}
            onDragLeave={() => setOver((s) => (s === status ? null : s))}
            className={cn(
              "flex w-72 shrink-0 flex-col rounded-2xl border border-border bg-secondary/60 p-2",
              over === status && "border-brand/40 bg-brand/5",
            )}
          >
            <header className="flex items-center justify-between px-2 py-2">
              <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {STATUS_LABEL[status]}
              </h3>
              <span className="text-xs tabular-nums text-muted-foreground">{col.length}</span>
            </header>
            <div className="flex flex-col gap-2">
              {col.map((task) => {
                const person = people.find((p) => p.id === task.assigneeId);
                return (
                  <Link
                    key={task.id}
                    to="/tasks/$taskId"
                    params={{ taskId: task.id }}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/task-id", task.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    className="rounded-xl border border-border bg-card p-3 shadow-soft transition-transform duration-150 hover:-translate-y-0.5"
                  >
                    <p className="text-sm leading-snug">{task.title}</p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <PriorityBadge priority={task.priority} />
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">{formatShortDate(task.dueDate)}</span>
                        <PersonAvatar person={person} size="sm" />
                      </div>
                    </div>
                    {task.blocked ? (
                      <p className="mt-2 text-[11px] text-danger">Blocked</p>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
