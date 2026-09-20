import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { EmptyState, PageHeader, PriorityBadge, StatCard, StatusBadge, Surface, TaskRow } from "@/components/marks";
import { Button } from "@/components/ui/button";
import { PersonAvatar, ProgressRail, Skeleton } from "@/components/ui/display";
import { useWorkspace } from "@/components/workspace";
import { openDirectMessage, getEmployee } from "@/lib/server/fns";
import { EMPLOYMENT_LABEL, ROLE_LABEL } from "@/lib/types";
import { formatHours, formatShortDate, relativeTime } from "@/lib/utils";
import { EnrollEmployeeDialog } from "@/components/enroll-employee";
import { canEnroll, canModifyPerson } from "@/lib/permissions";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/employees/$employeeId")({ component: EmployeeProfilePage });

const TABS = ["Overview", "Tasks", "Projects", "Activity", "Files", "Messages", "Work Summary"] as const;

function EmployeeProfilePage() {
  const { employeeId } = Route.useParams();
  const { members, departments, teams, me } = useWorkspace();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const q = useQuery({
    queryKey: ["employee", employeeId],
    queryFn: () => getEmployee({ data: employeeId }),
  });
  const navigate = useNavigate();
  const dm = useMutation({
    mutationFn: () => openDirectMessage({ data: employeeId }),
    onSuccess: (r) => void navigate({ to: "/chat", search: { channel: r.id } }),
    onError: (e: Error) => toast.error(e.message),
  });

  if (q.isPending) return <Skeleton className="h-96" />;
  if (!q.data) return <EmptyState title="Employee not found" description="They may have been removed from this organization." />;

  const { profile, tasks, projects, activity, files, time, summary } = q.data;
  const manager = members.find((m) => m.id === profile.managerId);
  const lead = members.find((m) => m.id === profile.teamLeadId);
  const dept = departments.find((d) => d.id === profile.departmentId);
  const team = teams.find((t) => t.id === profile.teamId);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={profile.employeeCode ?? "Employee"}
        title={profile.displayName}
        description={`${ROLE_LABEL[profile.role]} · ${profile.title}`}
        actions={
          <div className="flex gap-2">
            {profile.id !== me.id ? (
              <Button variant="secondary" size="sm" onClick={() => dm.mutate()} disabled={dm.isPending}>
                Message
              </Button>
            ) : null}
            {canEnroll(me.role) || profile.id === me.id || canModifyPerson(me.role, profile.role) ? (
              <EnrollEmployeeDialog person={profile}>
                <Button variant="secondary" size="sm">
                  Edit
                </Button>
              </EnrollEmployeeDialog>
            ) : null}
          </div>
        }
      />

      <div className="flex flex-col gap-5 lg:flex-row">
        <Surface className="p-5 lg:w-72 shrink-0">
          <div className="flex items-center gap-3">
            <PersonAvatar person={profile} size="lg" />
            <div>
              <p className="font-medium">{profile.displayName}</p>
              <p className="text-xs text-muted-foreground">{profile.status}</p>
            </div>
          </div>
          <dl className="mt-5 space-y-3 text-sm">
            <Row label="Employee ID" value={profile.employeeCode ?? "—"} />
            <Row label="Email" value={profile.email ?? profile.workEmail ?? "—"} />
            <Row label="Department" value={dept?.name ?? "—"} />
            <Row label="Team" value={team?.name ?? "—"} />
            <Row label="Manager" value={manager?.displayName ?? "—"} />
            <Row label="Team lead" value={lead?.displayName ?? "—"} />
            <Row label="Joined" value={formatShortDate(profile.joiningDate)} />
            <Row label="Type" value={EMPLOYMENT_LABEL[profile.employmentType]} />
            <Row label="Location" value={profile.location ?? "—"} />
            <Row label="Phone" value={profile.phone ?? "—"} />
          </dl>
        </Surface>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`h-9 shrink-0 rounded-full px-3 text-sm ${tab === t ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "Overview" ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-4">
                <StatCard label="Active" value={summary.pending} />
                <StatCard label="Completed" value={summary.completed} tone="ok" />
                <StatCard label="Overdue" value={summary.overdue} tone={summary.overdue ? "danger" : "ok"} />
                <StatCard label="Logged" value={formatHours(summary.minutes)} />
              </div>
              {profile.bio ? (
                <Surface className="p-5">
                  <h2 className="font-display text-sm font-semibold">Bio</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{profile.bio}</p>
                </Surface>
              ) : null}
              {profile.skills.length > 0 ? (
                <Surface className="p-5">
                  <h2 className="font-display text-sm font-semibold">Skills</h2>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {profile.skills.map((s) => (
                      <span key={s} className="rounded-full border border-border px-2.5 py-1 text-xs">
                        {s}
                      </span>
                    ))}
                  </div>
                </Surface>
              ) : null}
              {profile.notes ? (
                <Surface className="p-5">
                  <h2 className="font-display text-sm font-semibold">Notes</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{profile.notes}</p>
                </Surface>
              ) : null}
              <Surface className="p-2">
                <h2 className="px-3 pt-3 font-display text-sm font-semibold">Current tasks</h2>
                {tasks.filter((t) => t.status !== "completed").slice(0, 6).map((t) => (
                  <TaskRow key={t.id} task={t} people={members} compact />
                ))}
              </Surface>
            </div>
          ) : null}

          {tab === "Tasks" ? (
            <Surface className="p-2">
              {tasks.map((t) => (
                <div key={t.id} className="flex items-center gap-2">
                  <TaskRow task={t} people={members} />
                  <PriorityBadge priority={t.priority} />
                </div>
              ))}
            </Surface>
          ) : null}

          {tab === "Projects" ? (
            <div className="grid gap-3">
              {projects.map((p) => (
                <Link key={p.id} to="/projects/$projectId" params={{ projectId: p.id }}>
                  <Surface className="p-4">
                    <div className="mb-2 flex items-baseline justify-between">
                      <p className="font-medium">{p.name}</p>
                      <span className="text-xs tabular-nums text-muted-foreground">{p.progress}%</span>
                    </div>
                    <ProgressRail value={p.progress} />
                  </Surface>
                </Link>
              ))}
            </div>
          ) : null}

          {tab === "Activity" ? (
            <Surface className="p-5">
              {activity.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
              ) : (
                <ul className="space-y-3">
                  {activity.map((a) => (
                    <li key={a.id} className="text-sm">
                      <p>{a.summary}</p>
                      <p className="text-xs text-muted-foreground">{relativeTime(a.createdAt)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Surface>
          ) : null}

          {tab === "Files" ? (
            <Surface className="p-5">
              <ul className="space-y-2 text-sm">
                {files.map((f) => (
                  <li key={f.id} className="flex justify-between gap-3">
                    <span>{f.name}</span>
                    <span className="text-xs text-muted-foreground">{formatShortDate(f.createdAt)}</span>
                  </li>
                ))}
                {files.length === 0 ? <p className="text-muted-foreground">No files uploaded.</p> : null}
              </ul>
            </Surface>
          ) : null}

          {tab === "Messages" ? (
            <Surface className="p-6">
              <p className="text-sm text-muted-foreground">
                Direct messages stay in Chat. Open a private thread with {profile.displayName.split(" ")[0]}.
              </p>
              {profile.id !== me.id ? (
                <Button className="mt-4" onClick={() => dm.mutate()} disabled={dm.isPending}>
                  Open conversation
                </Button>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">This is your profile. Messages with others live in Chat.</p>
              )}
            </Surface>
          ) : null}

          {tab === "Work Summary" ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <StatCard label="Assigned" value={summary.total} />
                <StatCard label="Done" value={summary.completed} tone="ok" />
                <StatCard label="Overdue" value={summary.overdue} tone={summary.overdue ? "danger" : "default"} />
              </div>
              <Surface className="p-5">
                <h2 className="font-display text-sm font-semibold">Time log</h2>
                <ul className="mt-3 divide-y divide-border">
                  {time.map((e) => (
                    <li key={e.id} className="flex justify-between py-2 text-sm">
                      <span>{e.note || tasks.find((t) => t.id === e.taskId)?.title || "Time"}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatHours(e.minutes)} · {formatShortDate(e.startedAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              </Surface>
              <Surface className="p-5">
                <h2 className="font-display text-sm font-semibold">Due vs done</h2>
                <div className="mt-3 space-y-2">
                  {tasks.slice(0, 8).map((t) => (
                    <div key={t.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="truncate">{t.title}</span>
                      <span className="flex items-center gap-2">
                        <StatusBadge status={t.status} />
                        <span className="text-xs text-muted-foreground">
                          {t.dueDate && t.dueDate < today && t.status !== "completed" ? "overdue" : formatShortDate(t.dueDate)}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </Surface>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate text-right">{value}</dd>
    </div>
  );
}
