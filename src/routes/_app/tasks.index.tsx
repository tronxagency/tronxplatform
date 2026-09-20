import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CreateTaskDialog } from "@/components/create-dialogs";
import { KanbanBoard } from "@/components/kanban";
import { EmptyState, PageHeader, Surface, TaskRow } from "@/components/marks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/forms";
import { Skeleton } from "@/components/ui/display";
import { useWorkspace } from "@/components/workspace";
import { listProjects, listTasks } from "@/lib/server/fns";
import { TASK_STATUSES } from "@/lib/types";

export const Route = createFileRoute("/_app/tasks/")({ component: TasksPage });

function TasksPage() {
  const { members, me } = useWorkspace();
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [q, setQ] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assigneeId, setAssigneeId] = useState(me.role === "employee" ? me.id : "");
  const [status, setStatus] = useState("");
  const projects = useQuery({ queryKey: ["projects"], queryFn: () => listProjects() });
  const tasks = useQuery({
    queryKey: ["tasks", projectId, assigneeId, status, q],
    queryFn: () =>
      listTasks({
        data: {
          projectId: projectId || undefined,
          assigneeId: assigneeId || undefined,
          status: status || undefined,
          q: q || undefined,
        },
      }),
  });

  const filtered = tasks.data ?? [];
  const mine = useMemo(() => filtered.filter((t) => t.assigneeId === me.id).length, [filtered, me.id]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Execution"
        title="Tasks"
        description={`${filtered.length} in view · ${mine} assigned to you`}
        actions={
          <div className="flex gap-2">
            <Button variant={view === "kanban" ? "default" : "secondary"} size="sm" onClick={() => setView("kanban")}>
              Kanban
            </Button>
            <Button variant={view === "list" ? "default" : "secondary"} size="sm" onClick={() => setView("list")}>
              List
            </Button>
            <CreateTaskDialog>
              <Button size="sm">New task</Button>
            </CreateTaskDialog>
          </div>
        }
      />
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by title" className="sm:max-w-xs" />
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="h-10 rounded-lg border border-input bg-secondary px-3 text-sm"
        >
          <option value="">All projects</option>
          {(projects.data ?? []).map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          className="h-10 rounded-lg border border-input bg-secondary px-3 text-sm"
        >
          <option value="">{me.role === "employee" ? "Assigned to you" : "Everyone"}</option>
          {members
            .filter((m) => m.status === "active" && (me.role !== "employee" || m.id === me.id))
            .map((m) => (
            <option key={m.id} value={m.id}>
              {m.displayName}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 rounded-lg border border-input bg-secondary px-3 text-sm"
        >
          <option value="">Any status</option>
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </div>
      {tasks.isPending ? (
        <Skeleton className="h-80" />
      ) : filtered.length === 0 ? (
        <EmptyState title="No tasks match" description="Try clearing filters or creating work." />
      ) : view === "kanban" ? (
        <KanbanBoard tasks={filtered} people={members} />
      ) : (
        <Surface className="p-2">
          {filtered.map((t) => (
            <TaskRow key={t.id} task={t} people={members} />
          ))}
        </Surface>
      )}
    </div>
  );
}
