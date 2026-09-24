import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PostFinanceDialog } from "@/components/commercial-dialogs";
import { EmptyState, PageHeader, StatCard, Surface } from "@/components/marks";
import { Button } from "@/components/ui/button";
import { ProgressRail, Skeleton } from "@/components/ui/display";
import { useWorkspace } from "@/components/workspace";
import { hasPerm } from "@/lib/permissions";
import { getFinanceBoard } from "@/lib/server/fns";
import { FINANCE_CATEGORY_LABEL, FINANCE_KIND_LABEL } from "@/lib/types";
import { formatInr, formatInrCompact, formatShortDate } from "@/lib/utils";

export const Route = createFileRoute("/_app/finance")({ component: FinancePage });

function monthLabel(ym: string) {
  const [y, m] = ym.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("en-IN", { month: "short" });
}

function FinancePage() {
  const { me } = useWorkspace();
  const canView = hasPerm(me.role, "finance.view");
  const q = useQuery({ queryKey: ["finance"], queryFn: () => getFinanceBoard(), enabled: canView });
  const canPost = hasPerm(me.role, "finance.manage");

  if (!canView) {
    return <EmptyState title="Company money is executive" description="The Founder, CEO and executive assistant see revenue, cost and profit here." />;
  }

  if (q.isPending) return <Skeleton className="h-96" />;
  if (!q.data?.brief) {
    return <EmptyState title="Finance unavailable" description="Company money is visible to the Founder, CEO and executive assistant." />;
  }

  const { brief, entries, byMonth, byCategory, byLead } = q.data;
  const chart = byMonth.map((r) => ({
    month: monthLabel(r.month),
    Revenue: r.revenue,
    Cost: r.cost,
    Profit: r.profit,
  }));
  const costTotal = byCategory.filter((c) => c.kind === "expense").reduce((s, c) => s + c.amount, 0);
  const revTotal = byCategory.filter((c) => c.kind === "revenue").reduce((s, c) => s + c.amount, 0);
  const payroll = byCategory.find((c) => c.kind === "expense" && c.category === "payroll")?.amount ?? 0;
  const coverage = payroll > 0 ? Math.round((brief.pipelineWeighted / payroll) * 10) / 10 : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Company money"
        title="Finance"
        description="What came in, what it cost, and what is left. Pipeline is weighted by stage — not hope."
        actions={
          canPost ? (
            <div className="flex gap-2">
              <PostFinanceDialog defaultKind="revenue">
                <Button size="sm" variant="secondary">
                  Post revenue
                </Button>
              </PostFinanceDialog>
              <PostFinanceDialog defaultKind="expense">
                <Button size="sm">Post cost</Button>
              </PostFinanceDialog>
            </div>
          ) : null
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Revenue YTD"
          value={formatInrCompact(brief.revenueYtd)}
          hint={`This month ${formatInrCompact(brief.revenueMonth)}`}
          tone="ok"
        />
        <StatCard
          label="Cost YTD"
          value={formatInrCompact(brief.costYtd)}
          hint={`This month ${formatInrCompact(brief.costMonth)}`}
        />
        <StatCard
          label="Profit YTD"
          value={formatInrCompact(brief.profitYtd)}
          hint={`${brief.marginPct}% margin`}
          tone={brief.profitYtd >= 0 ? "ok" : "danger"}
        />
        <StatCard
          label="This month"
          value={formatInrCompact(brief.profitMonth)}
          hint={brief.profitMonth >= 0 ? "In the black" : "Spend ahead of billing"}
          tone={brief.profitMonth >= 0 ? "ok" : "danger"}
        />
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Open pipeline"
          value={formatInrCompact(brief.pipelineOpen)}
          hint={`${brief.openLeads} live deals`}
          tone="brand"
        />
        <StatCard
          label="Weighted forecast"
          value={formatInrCompact(brief.pipelineWeighted)}
          hint="Stage-weighted, not face value"
        />
        <StatCard
          label="Payroll cover"
          value={coverage ? `${coverage}×` : "—"}
          hint={coverage ? "Weighted pipeline vs latest payroll" : "No payroll posted"}
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Surface className="p-4">
          <h2 className="font-display text-sm font-semibold">Revenue, cost, profit</h2>
          <div className="mt-4 h-64">
            {chart.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">Post the first entry to see the year.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart}>
                  <CartesianGrid stroke="color-mix(in oklab, var(--color-border) 80%, transparent)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
                  <YAxis
                    tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                    tickFormatter={(v: number) => (v >= 100000 ? `${Math.round(v / 100000)}L` : `${Math.round(v / 1000)}k`)}
                  />
                  <Tooltip
                    formatter={(v) => formatInr(Number(v ?? 0))}
                    contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }}
                  />
                  <Legend />
                  <Bar dataKey="Revenue" fill="var(--color-ok)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Cost" fill="var(--color-danger)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Profit" fill="var(--color-brand)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Surface>

        <Surface className="p-5">
          <h2 className="font-display text-sm font-semibold">Where the money goes</h2>
          <ul className="mt-4 space-y-3">
            {byCategory
              .filter((c) => c.kind === "expense")
              .map((c) => (
                <li key={`${c.kind}-${c.category}`}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{FINANCE_CATEGORY_LABEL[c.category] ?? c.category}</span>
                    <span className="tabular-nums text-muted-foreground">{formatInrCompact(c.amount)}</span>
                  </div>
                  <ProgressRail value={costTotal ? Math.round((c.amount / costTotal) * 100) : 0} />
                </li>
              ))}
          </ul>
          <h2 className="mt-6 font-display text-sm font-semibold">Where it comes from</h2>
          <ul className="mt-4 space-y-3">
            {byCategory
              .filter((c) => c.kind === "revenue")
              .map((c) => (
                <li key={`${c.kind}-${c.category}`}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{FINANCE_CATEGORY_LABEL[c.category] ?? c.category}</span>
                    <span className="tabular-nums text-muted-foreground">{formatInrCompact(c.amount)}</span>
                  </div>
                  <ProgressRail value={revTotal ? Math.round((c.amount / revTotal) * 100) : 0} />
                </li>
              ))}
          </ul>
        </Surface>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Surface className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold">Revenue by client</h2>
            <Link to="/leads" className="text-xs text-muted-foreground hover:text-foreground">
              Pipeline
            </Link>
          </div>
          {byLead.length === 0 ? (
            <p className="text-sm text-muted-foreground">Won deals post here when they bill.</p>
          ) : (
            <ul className="divide-y divide-border">
              {byLead.map((row) => (
                <li key={row.leadId} className="flex items-center justify-between py-2.5">
                  <Link to="/leads/$leadId" params={{ leadId: row.leadId }} className="text-sm hover:underline">
                    {row.name}
                  </Link>
                  <span className="text-sm tabular-nums">{formatInr(row.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </Surface>

        <Surface className="p-5">
          <h2 className="font-display text-sm font-semibold">This month</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">In</dt>
              <dd className="mt-1 tabular-nums text-ok">{formatInr(brief.revenueMonth)}</dd>
            </div>
            <div>
              <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">Out</dt>
              <dd className="mt-1 tabular-nums">{formatInr(brief.costMonth)}</dd>
            </div>
            <div>
              <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">Won this month</dt>
              <dd className="mt-1 tabular-nums">{brief.wonMonth}</dd>
            </div>
            <div>
              <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">Overdue follow-ups</dt>
              <dd className="mt-1 tabular-nums text-danger">{brief.overdueFollowups}</dd>
            </div>
          </dl>
        </Surface>
      </div>

      <Surface className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-[11px] tracking-wide text-muted-foreground uppercase">
            <tr className="border-b border-border">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Entry</th>
              <th className="px-4 py-3 font-medium">Kind</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatShortDate(e.entryDate)}</td>
                <td className="px-4 py-3">
                  <p>{e.title}</p>
                  {e.vendor ? <p className="text-[11px] text-muted-foreground">{e.vendor}</p> : null}
                </td>
                <td className="px-4 py-3 capitalize text-muted-foreground">{FINANCE_KIND_LABEL[e.kind]}</td>
                <td className="px-4 py-3 text-muted-foreground">{FINANCE_CATEGORY_LABEL[e.category] ?? e.category}</td>
                <td className={`px-4 py-3 text-right tabular-nums ${e.kind === "revenue" ? "text-ok" : ""}`}>
                  {e.kind === "revenue" ? "+" : "−"}
                  {formatInr(e.amountInr)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Surface>
    </div>
  );
}
