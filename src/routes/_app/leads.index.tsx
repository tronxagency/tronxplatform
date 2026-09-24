import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CreateLeadDialog } from "@/components/commercial-dialogs";
import { EmptyState, PageHeader, StatCard, Surface } from "@/components/marks";
import { Button } from "@/components/ui/button";
import { Badge, PersonAvatar, Skeleton } from "@/components/ui/display";
import { Input } from "@/components/ui/forms";
import { useWorkspace } from "@/components/workspace";
import { hasPerm } from "@/lib/permissions";
import { listLeads, updateLead } from "@/lib/server/fns";
import {
  LEAD_STAGE_LABEL,
  LEAD_TEMP_LABEL,
  type Lead,
  type LeadStage,
} from "@/lib/types";
import { cn, formatInr, formatInrCompact, formatShortDate } from "@/lib/utils";

export const Route = createFileRoute("/_app/leads/")({ component: LeadsPage });

const OPEN_STAGES: LeadStage[] = ["new", "contacted", "qualified", "proposal", "negotiation"];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function followState(lead: Lead) {
  const today = todayIso();
  if (!lead.nextFollowUp || lead.stage === "won" || lead.stage === "lost") return "none" as const;
  if (lead.nextFollowUp < today) return "overdue" as const;
  if (lead.nextFollowUp === today) return "today" as const;
  return "soon" as const;
}

function tempTone(t: Lead["temperature"]): "danger" | "warn" | "muted" {
  if (t === "hot") return "danger";
  if (t === "warm") return "warn";
  return "muted";
}

function LeadsPage() {
  const { me, members } = useWorkspace();
  const canView = hasPerm(me.role, "lead.view");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "mine" | "overdue" | "hot">("all");
  const leadsQ = useQuery({ queryKey: ["leads"], queryFn: () => listLeads({ data: {} }), enabled: canView });
  const canManage = hasPerm(me.role, "lead.manage");

  if (!canView) {
    return <EmptyState title="Leads are for the commercial desk" description="Managers, founders and the executive office can follow the pipeline here." />;
  }

  const leads = leadsQ.data ?? [];
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return leads.filter((l) => {
      if (filter === "mine" && l.ownerId !== me.id) return false;
      if (filter === "overdue" && followState(l) !== "overdue") return false;
      if (filter === "hot" && l.temperature !== "hot") return false;
      if (!term) return true;
      return [l.name, l.company, l.email, l.industry, l.city].some((v) => (v ?? "").toLowerCase().includes(term));
    });
  }, [leads, filter, q, me.id]);

  const open = leads.filter((l) => l.stage !== "won" && l.stage !== "lost");
  const pipeline = open.reduce((s, l) => s + l.valueInr, 0);
  const overdue = open.filter((l) => followState(l) === "overdue");
  const dueToday = open.filter((l) => followState(l) === "today");
  const won = leads.filter((l) => l.stage === "won");
  const lost = leads.filter((l) => l.stage === "lost");
  const winRate = won.length + lost.length > 0 ? Math.round((won.length / (won.length + lost.length)) * 100) : 0;
  const followQueue = [...open]
    .filter((l) => l.nextFollowUp)
    .sort((a, b) => (a.nextFollowUp ?? "").localeCompare(b.nextFollowUp ?? ""))
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Commercial"
        title="Leads"
        description="Every live conversation — follow-ups, temperature and deal value, owned by someone on the desk."
        actions={
          canManage ? (
            <CreateLeadDialog>
              <Button size="sm">New lead</Button>
            </CreateLeadDialog>
          ) : null
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Open pipeline" value={formatInrCompact(pipeline)} hint={`${open.length} live deals`} tone="brand" />
        <StatCard label="Follow-ups today" value={dueToday.length} hint={overdue.length ? `${overdue.length} overdue` : "On time"} tone={overdue.length ? "danger" : "ok"} />
        <StatCard label="Won" value={won.length} hint={won.length ? formatInrCompact(won.reduce((s, l) => s + l.valueInr, 0)) : "No closes yet"} tone="ok" />
        <StatCard label="Win rate" value={`${winRate}%`} hint={`${lost.length} lost`} />
        <StatCard label="Hot" value={open.filter((l) => l.temperature === "hot").length} hint="Need a next move" />
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, company, city…"
          className="sm:max-w-xs"
        />
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {([
            ["all", "All"],
            ["mine", "Mine"],
            ["overdue", "Overdue"],
            ["hot", "Hot"],
          ] as const).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={cn(
                "h-9 shrink-0 rounded-full px-3 text-sm",
                filter === k ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {followQueue.length > 0 ? (
        <Surface className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">Follow-up queue</p>
              <h2 className="mt-1 font-display text-base font-semibold">Who needs a call</h2>
            </div>
            <span className="text-xs text-muted-foreground">{overdue.length} overdue · {dueToday.length} today</span>
          </div>
          <ul className="divide-y divide-border">
            {followQueue.map((lead) => {
              const owner = members.find((m) => m.id === lead.ownerId);
              const state = followState(lead);
              return (
                <li key={lead.id}>
                  <Link
                    to="/leads/$leadId"
                    params={{ leadId: lead.id }}
                    className="flex items-center gap-3 py-2.5 hover:bg-accent/40"
                  >
                    <PersonAvatar person={owner} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{lead.company || lead.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {lead.name} · {LEAD_STAGE_LABEL[lead.stage]}
                      </p>
                    </div>
                    <span className="hidden text-xs tabular-nums text-muted-foreground sm:block">
                      {formatInrCompact(lead.valueInr)}
                    </span>
                    <Badge tone={state === "overdue" ? "danger" : state === "today" ? "warn" : "muted"}>
                      {state === "overdue" ? "Overdue" : formatShortDate(lead.nextFollowUp)}
                    </Badge>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Surface>
      ) : null}

      {leadsQ.isPending ? (
        <Skeleton className="h-80" />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={leads.length === 0 ? "No leads yet" : "Nothing in this view"}
          description={canManage ? "Open a lead from inbound, referral or a partner intro." : "Leads owned by the commercial desk will land here."}
        />
      ) : (
        <LeadBoard leads={filtered} canManage={canManage} />
      )}
    </div>
  );
}

function LeadBoard({ leads, canManage }: { leads: Lead[]; canManage: boolean }) {
  const qc = useQueryClient();
  const { members } = useWorkspace();
  const [over, setOver] = useState<LeadStage | null>(null);
  const mut = useMutation({
    mutationFn: (data: { id: string; name: string; stage: LeadStage }) => updateLead({ data }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["leads"] });
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
      await qc.invalidateQueries({ queryKey: ["workspace"] });
      await qc.invalidateQueries({ queryKey: ["finance"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const columns: LeadStage[] = [...OPEN_STAGES, "won", "lost"];

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {columns.map((stage) => {
        const col = leads.filter((l) => l.stage === stage);
        const value = col.reduce((s, l) => s + l.valueInr, 0);
        return (
          <section
            key={stage}
            onDragOver={(e) => {
              if (!canManage) return;
              e.preventDefault();
              setOver(stage);
            }}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData("text/lead-id");
              const lead = leads.find((l) => l.id === id);
              if (id && lead && canManage && lead.stage !== stage) {
                mut.mutate({ id, name: lead.name, stage });
              }
              setOver(null);
            }}
            onDragLeave={() => setOver((s) => (s === stage ? null : s))}
            className={cn(
              "flex w-72 shrink-0 flex-col rounded-2xl border border-border bg-secondary/60 p-2",
              over === stage && "border-brand/40 bg-brand/5",
            )}
          >
            <header className="flex items-start justify-between gap-2 px-2 py-2">
              <div>
                <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {LEAD_STAGE_LABEL[stage]}
                </h3>
                <p className="mt-0.5 text-[11px] tabular-nums text-muted-foreground">
                  {col.length} · {value ? formatInrCompact(value) : "—"}
                </p>
              </div>
            </header>
            <div className="flex flex-col gap-2">
              {col.map((lead) => {
                const owner = members.find((m) => m.id === lead.ownerId);
                const state = followState(lead);
                return (
                  <Link
                    key={lead.id}
                    to="/leads/$leadId"
                    params={{ leadId: lead.id }}
                    draggable={canManage}
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/lead-id", lead.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    className="rounded-xl border border-border bg-card p-3 shadow-soft transition-transform duration-150 hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm leading-snug font-medium">{lead.company || lead.name}</p>
                      <Badge tone={tempTone(lead.temperature)}>{LEAD_TEMP_LABEL[lead.temperature]}</Badge>
                    </div>
                    <p className="mt-1 truncate text-[11px] text-muted-foreground">
                      {lead.name}
                      {lead.title ? ` · ${lead.title}` : ""}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="text-xs tabular-nums">{formatInrCompact(lead.valueInr)}</span>
                      <span className="text-[11px] tabular-nums text-muted-foreground">{lead.score}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <PersonAvatar person={owner} size="sm" />
                      {state !== "none" ? (
                        <span className={cn("text-[11px]", state === "overdue" ? "text-danger" : state === "today" ? "text-warn" : "text-muted-foreground")}>
                          {state === "overdue" ? "Overdue" : formatShortDate(lead.nextFollowUp)}
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">No follow-up</span>
                      )}
                    </div>
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
