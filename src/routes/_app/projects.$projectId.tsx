import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { CreateTaskDialog } from "@/components/create-dialogs";
import { MeetButton } from "@/components/meet-dialog";
import { KanbanBoard } from "@/components/kanban";
import { EmptyState, PageHeader, Surface, TaskRow } from "@/components/marks";
import { Button } from "@/components/ui/button";
import { PersonAvatar, ProgressRail, Skeleton, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/display";
import { Input, Label, Select, Textarea } from "@/components/ui/forms";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/overlay";
import { useWorkspace } from "@/components/workspace";
import { addProjectMember, getProject, listMeetings, updateProject, updateProjectMemberRole } from "@/lib/server/fns";
import { hasPerm } from "@/lib/permissions";
import { PROJECT_STATUSES, PRIORITIES, STATUS_LABEL, type ProjectMemberRole, type TaskStatus } from "@/lib/types";
import { formatShortDate, relativeTime } from "@/lib/utils";

export const Route = createFileRoute("/_app/projects/$projectId")({
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const { projectId } = Route.useParams();
  const { members, me } = useWorkspace();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["project", projectId], queryFn: () => getProject({ data: projectId }) });
  const meetings = useQuery({ queryKey: ["meetings"], queryFn: () => listMeetings() });
  const roleMut = useMutation({
    mutationFn: (data: { profileId: string; role: ProjectMemberRole }) =>
      updateProjectMemberRole({ data: { projectId, ...data } }),
    onSuccess: async () => {
      toast.success("Role updated");
      await qc.invalidateQueries({ queryKey: ["project", projectId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const add = useMutation({
    mutationFn: (profileId: string) => addProjectMember({ data: { projectId, profileId } }),
    onSuccess: async () => {
      toast.success("Member added");
      await qc.invalidateQueries({ queryKey: ["project", projectId] });
      await qc.invalidateQueries({ queryKey: ["channels"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (q.isPending) return <Skeleton className="h-96" />;
  if (!q.data) return <EmptyState title="Project not found" description="It may have been archived." />;

  const { project, tasks, milestones, files, activity, channelId } = q.data;
  const byTag = new Map<string, { total: number; done: number }>();
  for (const t of tasks) {
    const key = t.tags[0] || "general";
    const cur = byTag.get(key) ?? { total: 0, done: 0 };
    cur.total += 1;
    if (t.status === "completed") cur.done += 1;
    byTag.set(key, cur);
  }
  const available = members.filter((m) => m.status === "active" && !project.memberIds.includes(m.id));
  const byStatus = Object.entries(
    tasks.reduce<Record<string, number>>((acc, t) => {
      acc[t.status] = (acc[t.status] ?? 0) + 1;
      return acc;
    }, {}),
  );
  const canUpdate = hasPerm(me.role, "project.update");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Project"
        title={project.name}
        description={project.description}
        actions={
          <div className="flex gap-2">
            {canUpdate ? <EditProjectDialog projectId={project.id} name={project.name} description={project.description} status={project.status} priority={project.priority} dueDate={project.dueDate} /> : null}
            <MeetButton label="Meet project team" defaultScope="project" projectId={project.id} title={`${project.name} — sync`} />
            <CreateTaskDialog projectId={project.id}>
              <Button>Add task</Button>
            </CreateTaskDialog>
          </div>
        }
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <Surface className="p-4">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">Progress</p>
          <p className="mt-2 font-display text-3xl font-semibold tabular-nums">{project.progress}%</p>
          <ProgressRail value={project.progress} className="mt-3" />
        </Surface>
        <Surface className="p-4">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">Deadline</p>
          <p className="mt-2 font-display text-3xl font-semibold">{formatShortDate(project.dueDate)}</p>
          <p className="mt-1 text-xs text-muted-foreground capitalize">{project.status.replace("_", " ")}</p>
        </Surface>
        <Surface className="p-4">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">Team</p>
          <div className="mt-3 flex -space-x-1.5">
            {project.memberIds.map((id) => (
              <PersonAvatar key={id} person={members.find((m) => m.id === id)} size="sm" className="ring-2 ring-card" />
            ))}
          </div>
        </Surface>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="max-w-full overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="list">Tasks</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-5 space-y-5">
          <Surface className="p-5">
            <h3 className="font-display text-sm font-semibold">Workstreams</h3>
            <div className="mt-4 space-y-3">
              {byTag.size === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks yet.</p>
              ) : (
                [...byTag.entries()].map(([tag, v]) => (
                  <div key={tag}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="capitalize">{tag}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {v.total === 0 ? 0 : Math.round((v.done / v.total) * 100)}%
                      </span>
                    </div>
                    <ProgressRail value={v.total === 0 ? 0 : Math.round((v.done / v.total) * 100)} />
                  </div>
                ))
              )}
            </div>
          </Surface>
          {milestones.length > 0 ? (
            <Surface className="divide-y divide-border">
              {milestones.map((m) => (
                <div key={m.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span>{m.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {m.status} · {formatShortDate(m.dueDate)}
                  </span>
                </div>
              ))}
            </Surface>
          ) : null}
        </TabsContent>
        <TabsContent value="kanban" className="mt-5">
          <KanbanBoard tasks={tasks} people={members} />
        </TabsContent>
        <TabsContent value="list" className="mt-5">
          <Surface className="p-2">
            {tasks.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No tasks in this project.</p>
            ) : (
              tasks.map((t) => <TaskRow key={t.id} task={t} people={members} />)
            )}
          </Surface>
        </TabsContent>
        <TabsContent value="calendar" className="mt-5">
          <Surface className="divide-y divide-border">
            {tasks
              .filter((t) => t.dueDate)
              .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""))
              .map((t) => (
                <TaskRow key={t.id} task={t} people={members} />
              ))}
            {tasks.every((t) => !t.dueDate) ? (
              <p className="p-6 text-sm text-muted-foreground">No dated tasks yet.</p>
            ) : null}
          </Surface>
        </TabsContent>
        <TabsContent value="team" className="mt-5">
          <Surface className="divide-y divide-border">
            {project.memberIds.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">No members yet.</p>
            ) : (
              project.memberIds.map((id) => {
                const person = members.find((m) => m.id === id);
                if (!person) return null;
                const memberRole = project.memberRoles?.[id] ?? "member";
                return (
                  <div key={id} className="flex items-center gap-3 px-4 py-3">
                    <Link
                      to="/employees/$employeeId"
                      params={{ employeeId: id }}
                      className="flex min-w-0 flex-1 items-center gap-3 hover:underline"
                    >
                      <PersonAvatar person={person} />
                      <div>
                        <p className="text-sm">{person.displayName}</p>
                        <p className="text-xs text-muted-foreground">{person.title}</p>
                      </div>
                    </Link>
                    {canUpdate ? (
                      <select
                        className="h-8 rounded-lg border border-input bg-secondary px-2 text-xs"
                        value={memberRole}
                        onChange={(e) => roleMut.mutate({ profileId: id, role: e.target.value as ProjectMemberRole })}
                      >
                        {(["owner", "manager", "lead", "member", "observer"] as const).map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs capitalize text-muted-foreground">{memberRole}</span>
                    )}
                  </div>
                );
              })
            )}
          </Surface>
          {canUpdate && available.length > 0 ? (
            <select
              className="mt-3 h-10 rounded-lg border border-input bg-secondary px-3 text-sm"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) add.mutate(e.target.value);
                e.target.value = "";
              }}
            >
              <option value="">Add member…</option>
              {available.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.displayName}
                </option>
              ))}
            </select>
          ) : null}
        </TabsContent>
        <TabsContent value="files" className="mt-5">
          <Surface className="divide-y divide-border">
            {files.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">No files yet.</p>
            ) : (
              files.map((f) => (
                <div key={f.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span>{f.name}</span>
                  <span className="text-xs text-muted-foreground">{relativeTime(f.createdAt)}</span>
                </div>
              ))
            )}
          </Surface>
        </TabsContent>
        <TabsContent value="chat" className="mt-5">
          <Surface className="p-6">
            <p className="text-sm text-muted-foreground">
              Every project has its own channel. Conversation, mentions and files live there.
            </p>
            {channelId ? (
              <Link to="/chat" search={{ channel: channelId }} className="mt-4 inline-flex">
                <Button>Open project chat</Button>
              </Link>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">No channel yet.</p>
            )}
          </Surface>
        </TabsContent>
        <TabsContent value="meetings" className="mt-5">
          <Surface className="divide-y divide-border">
            {(meetings.data ?? [])
              .filter((m) => m.projectId === project.id)
              .map((m) => (
                <Link key={m.id} to="/meetings/$meetingId" params={{ meetingId: m.id }} className="flex items-center justify-between px-4 py-3 text-sm hover:bg-accent/40">
                  <span>{m.title}</span>
                  <span className="text-xs capitalize text-muted-foreground">{m.status}</span>
                </Link>
              ))}
            {(meetings.data ?? []).filter((m) => m.projectId === project.id).length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">No project meetings yet.</p>
            ) : null}
          </Surface>
          <div className="mt-3">
            <MeetButton label="Meet project team" defaultScope="project" projectId={project.id} title={`${project.name} — weekly sync`} />
          </div>
        </TabsContent>
        <TabsContent value="activity" className="mt-5">
          {activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="space-y-3">
              {activity.map((a) => (
                <li key={a.id} className="text-sm">
                  {a.summary}
                  <span className="ml-2 text-xs text-muted-foreground">{relativeTime(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
        <TabsContent value="analytics" className="mt-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Surface className="p-4">
              <p className="text-xs text-muted-foreground">Tasks</p>
              <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{tasks.length}</p>
            </Surface>
            <Surface className="p-4">
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="mt-1 font-display text-2xl font-semibold tabular-nums">
                {tasks.filter((t) => t.status === "completed").length}
              </p>
            </Surface>
            <Surface className="p-4">
              <p className="text-xs text-muted-foreground">Overdue</p>
              <p className="mt-1 font-display text-2xl font-semibold tabular-nums">
                {tasks.filter((t) => t.dueDate && t.dueDate < new Date().toISOString().slice(0, 10) && t.status !== "completed").length}
              </p>
            </Surface>
          </div>
          <Surface className="p-5">
            <h3 className="font-display text-sm font-semibold">By status</h3>
            <div className="mt-4 space-y-3">
              {byStatus.map(([status, count]) => (
                <div key={status}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span>{STATUS_LABEL[status as TaskStatus] ?? status}</span>
                    <span className="tabular-nums text-muted-foreground">{count}</span>
                  </div>
                  <ProgressRail value={tasks.length ? Math.round((count / tasks.length) * 100) : 0} />
                </div>
              ))}
            </div>
          </Surface>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EditProjectDialog({
  projectId,
  name,
  description,
  status,
  priority,
  dueDate,
}: {
  projectId: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string | null;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const mut = useMutation({
    mutationFn: (data: { id: string; name?: string; description?: string; status?: string; priority?: string; dueDate?: string | null }) =>
      updateProject({ data }),
    onSuccess: async () => {
      toast.success("Project updated");
      setOpen(false);
      await qc.invalidateQueries({ queryKey: ["project", projectId] });
      await qc.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    mut.mutate({
      id: projectId,
      name: String(fd.get("name") ?? ""),
      description: String(fd.get("description") ?? ""),
      status: String(fd.get("status") ?? ""),
      priority: String(fd.get("priority") ?? ""),
      dueDate: String(fd.get("dueDate") || "") || null,
    });
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Edit</Button>
      </DialogTrigger>
      <DialogContent title="Edit project">
        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="prj-name">Name</Label>
            <Input id="prj-name" name="name" defaultValue={name} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prj-desc">Description</Label>
            <Textarea id="prj-desc" name="description" defaultValue={description} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="prj-status">Status</Label>
              <Select id="prj-status" name="status" defaultValue={status}>
                {PROJECT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replaceAll("_", " ")}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prj-pri">Priority</Label>
              <Select id="prj-pri" name="priority" defaultValue={priority}>
                {PRIORITIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prj-due">Deadline</Label>
            <Input id="prj-due" name="dueDate" type="date" defaultValue={dueDate ?? ""} />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={mut.isPending}>
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
