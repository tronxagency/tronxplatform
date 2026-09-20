import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, StatCard, Surface } from "@/components/marks";
import { ProgressRail, Skeleton } from "@/components/ui/display";
import { getAnalytics } from "@/lib/server/fns";
import { STATUS_LABEL, type TaskStatus } from "@/lib/types";
import { formatHours } from "@/lib/utils";

export const Route = createFileRoute("/_app/analytics")({ component: AnalyticsPage });

function AnalyticsPage() {
  const q = useQuery({ queryKey: ["analytics"], queryFn: () => getAnalytics() });
  if (q.isPending) return <Skeleton className="h-96" />;
  if (!q.data) return null;
  const { byStatus, byProject, workload, trend, mine, role } = q.data;
  const statusData = byStatus.map((s) => ({
    name: STATUS_LABEL[s.status as TaskStatus] ?? s.status,
    count: s.c,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={role === "ceo" || role === "founder" ? "Company" : role === "manager" || role === "team_lead" ? "Team" : "Personal"}
        title="Analytics"
        description="Transparent work metrics — completion, load and time. No surveillance."
      />
      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard label="My active" value={mine.active} />
        <StatCard label="My completed" value={mine.completed} tone="ok" />
        <StatCard label="My overdue" value={mine.overdue} tone={mine.overdue ? "danger" : "ok"} />
        <StatCard label="My time" value={formatHours(mine.minutes)} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Surface className="p-4">
          <h2 className="font-display text-sm font-semibold">Completion this week</h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend}>
                <CartesianGrid stroke="rgb(242 242 243 / 0.06)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} />
                <YAxis allowDecimals={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }}
                />
                <Bar dataKey="completed" fill="var(--color-brand)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Surface>
        <Surface className="p-4">
          <h2 className="font-display text-sm font-semibold">By status</h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid stroke="rgb(242 242 243 / 0.06)" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }}
                />
                <Bar dataKey="count" fill="var(--color-info)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Surface>
      </div>
      <Surface className="p-5">
        <h2 className="font-display text-sm font-semibold">Project velocity</h2>
        <div className="mt-4 space-y-4">
          {byProject.map((p) => (
            <div key={p.id}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{p.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {p.done}/{p.total} · {formatHours(p.minutes)}
                </span>
              </div>
              <ProgressRail value={p.total ? Math.round((p.done / p.total) * 100) : 0} />
            </div>
          ))}
        </div>
      </Surface>
      {role !== "employee" ? (
        <Surface className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] tracking-wide text-muted-foreground uppercase">
              <tr className="border-b border-border">
                <th className="px-4 py-3 font-medium">Employee</th>
                <th className="px-4 py-3 font-medium">Active</th>
                <th className="px-4 py-3 font-medium">Completed</th>
                <th className="px-4 py-3 font-medium">Overdue</th>
                <th className="px-4 py-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {workload.map((w) => (
                <tr key={w.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{w.name}</td>
                  <td className="px-4 py-3 tabular-nums">{w.active}</td>
                  <td className="px-4 py-3 tabular-nums">{w.completed}</td>
                  <td className="px-4 py-3 tabular-nums">{w.overdue}</td>
                  <td className="px-4 py-3 tabular-nums">{formatHours(w.minutes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Surface>
      ) : null}
    </div>
  );
}
