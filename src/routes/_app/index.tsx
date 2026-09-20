import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getDashboard, listProjects } from "@/lib/server/fns";
import { CreateTaskDialog } from "@/components/create-dialogs";
import { EmptyState, PageHeader, StatCard, Surface, TaskRow } from "@/components/marks";
import { Button } from "@/components/ui/button";
import { PersonAvatar, ProgressRail, Skeleton } from "@/components/ui/display";
import { useWorkspace } from "@/components/workspace";
import { firstName, formatShortDate, greetingForHour, relativeTime } from "@/lib/utils";

export const Route = createFileRoute("/_app/")({ component: DashboardPage });

function DashboardPage() {
  const { me, members } = useWorkspace();
  const dash = useQuery({ queryKey: ["dashboard"], queryFn: () => getDashboard() });
  const projects = useQuery({ queryKey: ["projects"], queryFn: () => listProjects() });
  const hour = new Date().getHours();

  if (dash.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    );
  }
  if (!dash.data) return <EmptyState title="Dashboard unavailable" description="Refresh to load your workspace." />;

  const d = dash.data;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={me.role === "employee" ? "Employee Portal" : me.role === "team_lead" ? "Team Lead Portal" : me.role === "manager" ? "Manager Portal" : me.role === "founder" ? "Director Portal" : "CEO Portal"}
        title={`${greetingForHour(hour)}, ${firstName(me.displayName)}`}
        description="A quiet view of work in motion — tasks, projects and the people carrying them."
        actions={
          <CreateTaskDialog>
            <Button>New task</Button>
          </CreateTaskDialog>
        }
      />

      <section className="stagger-in grid gap-3 sm:grid-cols-3">
        <StatCard label="Tasks" value={d.stats.myActive} hint="Assigned to you, in motion" />
        <StatCard label="Active projects" value={d.stats.activeProjects} hint={`${d.stats.activeEmployees} people in the org`} tone="brand" />
        <StatCard
          label="Due today"
          value={d.stats.dueToday}
          hint={d.stats.overdue ? `${d.stats.overdue} overdue` : "Nothing slipping"}
          tone={d.stats.dueToday > 0 ? "danger" : "ok"}
        />
      </section>

      {me.role === "ceo" || me.role === "founder" || me.role === "manager" ? (
        <section className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard label="Employees" value={d.stats.activeEmployees} hint={`${d.stats.totalEmployees} on file`} />
          <StatCard label="Projects" value={d.stats.activeProjects} hint={`${d.stats.totalProjects} total`} />
          <StatCard label="Tasks" value={d.stats.pendingTasks} hint={`${d.stats.completedTasks} completed`} />
          <StatCard label="Overdue" value={d.stats.overdue} tone={d.stats.overdue ? "danger" : "default"} />
          <StatCard label="Blocked" value={d.stats.blocked} tone={d.stats.blocked ? "danger" : "default"} />
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Surface className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">Project progress</h2>
            <Link to="/projects" className="text-xs text-muted-foreground hover:text-foreground">
              All projects
            </Link>
          </div>
          <div className="space-y-4">
            {d.projectProgress.map((p) => (
              <Link key={p.id} to="/projects/$projectId" params={{ projectId: p.id }} className="block">
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <span className="text-sm">{p.name}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">{p.progress}%</span>
                </div>
                <ProgressRail value={p.progress} />
              </Link>
            ))}
          </div>
        </Surface>

        <Surface className="p-5">
          <h2 className="font-display text-base font-semibold">Today’s tasks</h2>
          <div className="mt-3 divide-y divide-border">
            {d.todayTasks.length === 0 ? (
              <p className="py-6 text-sm text-muted-foreground">Nothing due today. Protect the focus.</p>
            ) : (
              d.todayTasks.map((t) => <TaskRow key={t.id} task={t} people={members} compact />)
            )}
          </div>
        </Surface>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Surface className="p-5">
          <h2 className="font-display text-base font-semibold">
            {me.role === "employee" ? "Your workload" : "Team workload"}
          </h2>
          <div className="mt-4 space-y-3">
            {d.workload.slice(0, 8).map((w) => {
              const person = members.find((m) => m.id === w.profileId);
              return (
                <div key={w.profileId} className="flex items-center gap-3">
                  <PersonAvatar person={person ?? { displayName: w.name, avatarKey: "slate" }} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{w.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {w.active} active · {w.completed} done
                    </p>
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">{w.overdue} overdue</span>
                </div>
              );
            })}
          </div>
        </Surface>

        <Surface className="p-5">
          <h2 className="font-display text-base font-semibold">Activity</h2>
          <ul className="mt-4 space-y-3">
            {d.recentActivity.map((a) => {
              const actor = members.find((m) => m.id === a.actorId);
              return (
                <li key={a.id} className="flex gap-3 text-sm">
                  <PersonAvatar person={actor} size="sm" />
                  <div className="min-w-0">
                    <p className="text-foreground">{a.summary}</p>
                    <p className="text-xs text-muted-foreground">{relativeTime(a.createdAt)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Surface>
      </div>

      {d.announcements.length > 0 ? (
        <Surface className="p-5">
          <h2 className="font-display text-base font-semibold">Announcements</h2>
          <ul className="mt-3 space-y-3">
            {d.announcements.map((a) => (
              <li key={a.id}>
                <p className="text-sm font-medium">{a.title}</p>
                <p className="text-sm text-muted-foreground">{a.body}</p>
              </li>
            ))}
          </ul>
        </Surface>
      ) : null}

      {d.overdueTasks.length > 0 ? (
        <Surface className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">Overdue</h2>
            <span className="text-xs text-danger">{d.overdueTasks.length} slipping</span>
          </div>
          {d.overdueTasks.map((t) => (
            <TaskRow key={t.id} task={t} people={members} />
          ))}
        </Surface>
      ) : null}

      <Surface className="p-5">
        <h2 className="font-display text-base font-semibold">Upcoming</h2>
        <ul className="mt-3 divide-y divide-border">
          {d.upcoming.map((u) => (
            <li key={`${u.type}-${u.id}`} className="flex items-center justify-between py-2.5 text-sm">
              <span>{u.title}</span>
              <span className="text-xs text-muted-foreground">
                {u.type} · {formatShortDate(u.dueDate)}
              </span>
            </li>
          ))}
        </ul>
      </Surface>

      {projects.data && projects.data.length === 0 ? (
        <EmptyState title="No projects yet" description="Create the first project to start assigning work." />
      ) : null}
    </div>
  );
}
