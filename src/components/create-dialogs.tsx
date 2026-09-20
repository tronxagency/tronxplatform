import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { createProject, createTask, listProjects } from "@/lib/server/fns";
import { canManageWork, hasPerm } from "@/lib/permissions";
import { PRIORITIES, TASK_STATUSES } from "@/lib/types";
import { Button } from "./ui/button";
import { Input, Label, Textarea } from "./ui/forms";
import { Dialog, DialogContent, DialogTrigger } from "./ui/overlay";
import { useWorkspace } from "./workspace";

export function CreateTaskDialog({
  children,
  projectId,
  open: controlledOpen,
  onOpenChange,
}: {
  children?: ReactNode;
  projectId?: string;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}) {
  const { members, me } = useWorkspace();
  const projects = useQuery({ queryKey: ["projects"], queryFn: () => listProjects() }).data ?? [];
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const mut = useMutation({
    mutationFn: (payload: Parameters<typeof createTask>[0] extends { data: infer D } ? D : never) =>
      createTask({ data: payload }),
    onSuccess: async (res) => {
      toast.success("Task created");
      setOpen(false);
      await qc.invalidateQueries();
      if (res.id) await navigate({ to: "/tasks/$taskId", params: { taskId: res.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    mut.mutate({
      title: String(fd.get("title") ?? ""),
      description: String(fd.get("description") ?? ""),
      projectId: String(fd.get("projectId") || projectId || "") || undefined,
      assigneeId: String(fd.get("assigneeId") || me.id),
      priority: String(fd.get("priority") || "medium"),
      status: String(fd.get("status") || "todo"),
      dueDate: String(fd.get("dueDate") || "") || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent title="New task">
        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required placeholder="What needs to be done?" autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="Context, acceptance, links" />
          </div>
          {!projectId ? (
            <div className="space-y-1.5">
              <Label htmlFor="projectId">Project</Label>
              <select
                id="projectId"
                name="projectId"
                className="h-10 w-full rounded-lg border border-input bg-secondary px-3 text-sm"
              >
                <option value="">None</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <input type="hidden" name="projectId" value={projectId} />
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="assigneeId">Assignee</Label>
              {hasPerm(me.role, "task.assign") ? (
                <select
                  id="assigneeId"
                  name="assigneeId"
                  defaultValue={me.id}
                  className="h-10 w-full rounded-lg border border-input bg-secondary px-3 text-sm"
                >
                  {members.filter((m) => m.status === "active").map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.displayName}
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <input type="hidden" name="assigneeId" value={me.id} />
                  <p className="flex h-10 items-center text-sm text-muted-foreground">Assigned to you</p>
                </>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                name="priority"
                defaultValue="medium"
                className="h-10 w-full rounded-lg border border-input bg-secondary px-3 text-sm"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue="todo"
                className="h-10 w-full rounded-lg border border-input bg-secondary px-3 text-sm"
              >
                {(canManageWork(me.role) ? TASK_STATUSES : (["backlog", "todo", "in_progress"] as const)).map((p) => (
                  <option key={p} value={p}>
                    {p.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dueDate">Due date</Label>
              <Input id="dueDate" name="dueDate" type="date" />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={mut.isPending}>
              {mut.isPending ? "Creating…" : "Create task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CreateProjectDialog({ children }: { children: ReactNode }) {
  const { teams, me } = useWorkspace();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const mut = useMutation({
    mutationFn: (payload: Parameters<typeof createProject>[0] extends { data: infer D } ? D : never) =>
      createProject({ data: payload }),
    onSuccess: async (res) => {
      toast.success("Project created");
      setOpen(false);
      await qc.invalidateQueries();
      if (res.id) await navigate({ to: "/projects/$projectId", params: { projectId: res.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  if (!hasPerm(me.role, "project.create")) return null;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    mut.mutate({
      name: String(fd.get("name") ?? ""),
      description: String(fd.get("description") ?? ""),
      teamId: String(fd.get("teamId") || "") || undefined,
      priority: String(fd.get("priority") || "medium"),
      dueDate: String(fd.get("dueDate") || "") || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent title="New project">
        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required placeholder="Restaurant SaaS" autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pdesc">Description</Label>
            <Textarea id="pdesc" name="description" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="teamId">Team</Label>
              <select
                id="teamId"
                name="teamId"
                className="h-10 w-full rounded-lg border border-input bg-secondary px-3 text-sm"
              >
                <option value="">None</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pdue">Deadline</Label>
              <Input id="pdue" name="dueDate" type="date" />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={mut.isPending}>
              {mut.isPending ? "Creating…" : "Create project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
