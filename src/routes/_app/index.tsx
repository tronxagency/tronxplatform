import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Video } from "lucide-react";
import { getDashboard, listProjects } from "@/lib/server/fns";
import { CreateLeadDialog } from "@/components/commercial-dialogs";
import { CreateTaskDialog } from "@/components/create-dialogs";
import { EnrollEmployeeDialog } from "@/components/enroll-employee";
import { MeetDialog } from "@/components/meet-dialog";
import { EmptyState, PageHeader, StatCard, Surface, TaskRow } from "@/components/marks";
import { Button } from "@/components/ui/button";
import { PersonAvatar, ProgressRail, Skeleton } from "@/components/ui/display";
import { useWorkspace } from "@/components/workspace";
import { canEnroll, hasPerm, isExecOffice, portalEyebrow, portalLabel } from "@/lib/permissions";
import { firstName, formatInrCompact, formatShortDate, greetingForHour, relativeTime } from "@/lib/utils";

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
  const executive = isExecOffice(me.role);
  const ops = me.role === "manager" || me.role === "team_lead";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={portalEyebrow(me.role)}
        title={`${greetingForHour(hour)}, ${firstName(me.displayName)}`}
        description={
          me.role === "employee"
            ? "Your work, meetings and the people around you — in one place."
            : me.role === "team_lead"
              ? "Your team’s work, reviews and meetings for today."
              : me.role === "manager"
                ? "Operational view of teams, projects and work in motion."
                : me.role === "executive_assistant"
                  ? "The Founder & CEO office — calendar, meetings, people and follow-through."
                  : me.role === "founder"
                    ? "Leadership command of the company, pipeline and money."
                    : "Executive command of the company operating system."
        }
        actions={<RoleActions role={me.role} />}
      />

      {executive || ops ? (
        <Surface className="p-5">
          <p className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
            {me.role === "founder"
              ? "Today’s leadership brief"
              : me.role === "ceo"
                ? "Company overview"
                : me.role === "executive_assistant"
                  ? "Executive desk"
                  : "Operations brief"}
          </p>
          <p className="mt-2 font-display text-lg font-semibold">{portalLabel(me.role)}</p>
          <ul className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <li>{d.brief.attentionProjects} projects need attention</li>
            <li>{d.brief.dueToday} tasks due today</li>
            <li>{d.brief.overdue} overdue</li>
            <li>{d.brief.blocked} blocked</li>
            {executive ? <li>{d.brief.invited} employees onboarding</li> : null}
            {executive && (d.execOnboarding?.length ?? 0) > 0 ? (
              <li>
                {d.execOnboarding.length} executive {d.execOnboarding.length === 1 ? "desk" : "desks"} in first two weeks
              </li>
            ) : null}
            {d.commercial ? (
              <li>
                {formatInrCompact(d.commercial.profitYtd)} profit YTD · {d.commercial.openLeads} live deals
              </li>
            ) : null}
            {d.commercial && d.commercial.overdueFollowups > 0 ? (
              <li>{d.commercial.overdueFollowups} lead follow-ups overdue</li>
            ) : null}
            <li>{d.brief.meetingsToday} meetings today</li>
            <li>{d.stats.pendingReview} in review</li>
          </ul>
        </Surface>
      ) : null}

      <section className="stagger-in grid gap-3 sm:grid-cols-3">
        <StatCard label="My work" value={d.stats.myActive} hint={`${d.stats.myCompleted} completed by you`} />
        <StatCard
          label={executive ? "Active projects" : "Projects"}
          value={d.stats.activeProjects}
          hint={`${d.stats.activeEmployees} people in the org`}
          tone="brand"
        />
        <StatCard
          label="Due today"
          value={d.stats.dueToday}
          hint={d.stats.overdue ? `${d.stats.overdue} overdue` : "Nothing slipping"}
          tone={d.stats.dueToday > 0 ? "danger" : "ok"}
        />
      </section>

      {executive ? (
        <section className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard label="Employees" value={d.stats.activeEmployees} hint={`${d.stats.totalEmployees} on file · ${d.stats.invitedEmployees} invited`} />
          <StatCard label="Projects" value={d.stats.activeProjects} hint={`${d.stats.totalProjects} total`} />
          <StatCard label="Open tasks" value={d.stats.pendingTasks} hint={`${d.stats.completedTasks} completed`} />
          <StatCard label="Overdue" value={d.stats.overdue} tone={d.stats.overdue ? "danger" : "default"} />
          <StatCard label="Blocked" value={d.stats.blocked} tone={d.stats.blocked ? "danger" : "default"} />
        </section>
      ) : null}

      {ops ? (
        <section className="grid gap-3 sm:grid-cols-4">
          <StatCard label="Team open" value={d.stats.pendingTasks} />
          <StatCard label="In review" value={d.stats.pendingReview} tone="brand" />
          <StatCard label="Overdue" value={d.stats.overdue} tone={d.stats.overdue ? "danger" : "default"} />
          <StatCard label="Blocked" value={d.stats.blocked} tone={d.stats.blocked ? "danger" : "default"} />
        </section>
      ) : null}

      {d.commercial ? (
        <section className="space-y-3">
          {hasPerm(me.role, "finance.view") ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard
                label="Revenue YTD"
                value={formatInrCompact(d.commercial.revenueYtd)}
                hint={`This month ${formatInrCompact(d.commercial.revenueMonth)}`}
                tone="ok"
              />
              <StatCard
                label="Cost YTD"
                value={formatInrCompact(d.commercial.costYtd)}
                hint={`This month ${formatInrCompact(d.commercial.costMonth)}`}
              />
              <StatCard
                label="Profit YTD"
                value={formatInrCompact(d.commercial.profitYtd)}
                hint={`${d.commercial.marginPct}% margin`}
                tone={d.commercial.profitYtd >= 0 ? "ok" : "danger"}
              />
              <StatCard
                label="Pipeline"
                value={formatInrCompact(d.commercial.pipelineOpen)}
                hint={`${formatInrCompact(d.commercial.pipelineWeighted)} weighted`}
                tone="brand"
              />
              <StatCard
                label="Follow-ups"
                value={d.commercial.dueTodayFollowups}
                hint={d.commercial.overdueFollowups ? `${d.commercial.overdueFollowups} overdue` : "On time"}
                tone={d.commercial.overdueFollowups ? "danger" : "ok"}
              />
            </div>
          ) : hasPerm(me.role, "lead.view") ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard
                label="Pipeline"
                value={formatInrCompact(d.commercial.pipelineOpen)}
                hint={`${d.commercial.openLeads} live deals`}
                tone="brand"
              />
              <StatCard label="Won this month" value={d.commercial.wonMonth} tone="ok" />
              <StatCard
                label="Follow-ups"
                value={d.commercial.dueTodayFollowups}
                hint={d.commercial.overdueFollowups ? `${d.commercial.overdueFollowups} overdue` : "On time"}
                tone={d.commercial.overdueFollowups ? "danger" : "ok"}
              />
            </div>
          ) : null}
          {d.commercial.followups.length > 0 && hasPerm(me.role, "lead.view") ? (
            <Surface className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">Commercial desk</p>
                  <h2 className="mt-1 font-display text-base font-semibold">Lead follow-ups</h2>
                </div>
                <Link to="/leads" className="text-xs text-muted-foreground hover:text-foreground">
                  Open pipeline
                </Link>
              </div>
              <ul className="divide-y divide-border">
                {d.commercial.followups.slice(0, 5).map((row) => {
                  const today = new Date().toISOString().slice(0, 10);
                  const overdue = Boolean(row.nextFollowUp && row.nextFollowUp < today);
                  return (
                    <li key={row.id}>
                      <Link
                        to="/leads/$leadId"
                        params={{ leadId: row.id }}
                        className="flex items-center justify-between gap-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm">{row.company || row.name}</p>
                          <p className="truncate text-[11px] text-muted-foreground">{row.name}</p>
                        </div>
                        <span className="hidden text-xs tabular-nums text-muted-foreground sm:block">
                          {formatInrCompact(row.valueInr)}
                        </span>
                        <span className={`text-xs ${overdue ? "text-danger" : "text-muted-foreground"}`}>
                          {overdue ? "Overdue" : formatShortDate(row.nextFollowUp)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Surface>
          ) : null}
        </section>
      ) : null}

      {d.myOnboarding ? (
        <Surface className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">Your first two weeks</p>
              <h2 className="mt-1 font-display text-base font-semibold">Continue onboarding</h2>
            </div>
            <Link to="/onboarding/$onboardingId" params={{ onboardingId: d.myOnboarding.id }}>
              <Button size="sm" variant="secondary">
                Open checklist
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            {d.myOnboarding.stepDone} of {d.myOnboarding.stepTotal} steps · desk owned by {d.myOnboarding.ownerName ?? "the office"}
            {d.myOnboarding.dueAt ? ` · due ${formatShortDate(d.myOnboarding.dueAt)}` : ""}
          </p>
          <ProgressRail value={d.myOnboarding.progress} className="mt-3" />
        </Surface>
      ) : null}

      {executive && (d.execOnboarding?.length ?? 0) > 0 ? (
        <Surface className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">First two weeks</p>
              <h2 className="mt-1 font-display text-base font-semibold">Executive onboarding</h2>
            </div>
            <Link to="/onboarding" className="text-xs text-muted-foreground hover:text-foreground">
              Open desk
            </Link>
          </div>
          <ul className="space-y-4">
            {d.execOnboarding.map((row) => (
              <li key={row.id}>
                <Link to="/onboarding/$onboardingId" params={{ onboardingId: row.id }} className="block">
                  <div className="mb-1.5 flex items-center gap-3">
                    <PersonAvatar person={row} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{row.displayName}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {row.stepDone}/{row.stepTotal} · {row.ownerName ?? "Unassigned"}
                      </p>
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground">{row.progress}%</span>
                  </div>
                  <ProgressRail value={row.progress} />
                </Link>
              </li>
            ))}
          </ul>
        </Surface>
      ) : null}

      {d.atRisk.length > 0 && (executive || ops) ? (
        <Surface className="p-5">
          <h2 className="font-display text-base font-semibold">Project health</h2>
          <ul className="mt-3 divide-y divide-border">
            {d.atRisk.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                <Link to="/projects/$projectId" params={{ projectId: p.id }} className="text-sm hover:underline">
                  {p.name}
                </Link>
                <span className="text-xs text-danger">{p.reason}</span>
              </li>
            ))}
          </ul>
        </Surface>
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
          <h2 className="font-display text-base font-semibold">{me.role === "employee" ? "Your tasks today" : "Today’s tasks"}</h2>
          <div className="mt-3 divide-y divide-border">
            {d.todayTasks.length === 0 ? (
              <p className="py-6 text-sm text-muted-foreground">Nothing due today. Protect the focus.</p>
            ) : (
              d.todayTasks.map((t) => <TaskRow key={t.id} task={t} people={members} compact />)
            )}
          </div>
        </Surface>
      </div>

      {d.meetingsToday.length > 0 ? (
        <Surface className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">Meetings today</h2>
            <Link to="/meetings" className="text-xs text-muted-foreground hover:text-foreground">
              All meetings
            </Link>
          </div>
          <ul className="space-y-2">
            {d.meetingsToday.map((m) => (
              <li key={m.id}>
                <Link to="/meetings/$meetingId" params={{ meetingId: m.id }} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-accent/40">
                  <span className="grid size-8 place-items-center rounded-lg bg-brand/15 text-brand">
                    <Video className="size-3.5" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">{m.title}</span>
                  <span className="text-xs capitalize text-muted-foreground">{m.status}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Surface>
      ) : null}

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
              {u.href ? (
                <a href={u.href} className="hover:underline">
                  {u.title}
                </a>
              ) : (
                <span>{u.title}</span>
              )}
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

function RoleActions({ role }: { role: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {canEnroll(role as never) ? (
        <EnrollEmployeeDialog>
          <Button size="sm" variant="secondary">
            Enroll
          </Button>
        </EnrollEmployeeDialog>
      ) : null}
      <CreateTaskDialog>
        <Button size="sm">New task</Button>
      </CreateTaskDialog>
      {hasPerm(role as never, "project.create") ? (
        <Link to="/projects">
          <Button size="sm" variant="secondary">
            Project
          </Button>
        </Link>
      ) : null}
      {hasPerm(role as never, "lead.manage") ? (
        <CreateLeadDialog>
          <Button size="sm" variant="secondary">
            New lead
          </Button>
        </CreateLeadDialog>
      ) : null}
      {hasPerm(role as never, "finance.view") ? (
        <Link to="/finance">
          <Button size="sm" variant="secondary">
            Finance
          </Button>
        </Link>
      ) : null}
      <MeetDialog>
        <Button size="sm" variant="secondary">
          <Video className="size-4" />
          Meet
        </Button>
      </MeetDialog>
    </div>
  );
}
