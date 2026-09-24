import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { PostFinanceDialog } from "@/components/commercial-dialogs";
import { EmptyState, PageHeader, Surface } from "@/components/marks";
import { Button } from "@/components/ui/button";
import { Badge, PersonAvatar, ProgressRail, Skeleton } from "@/components/ui/display";
import { Input, Label, Select, Textarea } from "@/components/ui/forms";
import { useWorkspace } from "@/components/workspace";
import { hasPerm } from "@/lib/permissions";
import { addLeadActivity, getLead, updateLead } from "@/lib/server/fns";
import {
  FINANCE_CATEGORY_LABEL,
  FINANCE_KIND_LABEL,
  LEAD_ACTIVITY_KINDS,
  LEAD_ACTIVITY_LABEL,
  LEAD_SOURCE_LABEL,
  LEAD_STAGE_LABEL,
  LEAD_STAGES,
  LEAD_TEMP_LABEL,
  LEAD_TEMPS,
  type LeadStage,
} from "@/lib/types";
import { formatInr, formatShortDate, relativeTime } from "@/lib/utils";

export const Route = createFileRoute("/_app/leads/$leadId")({ component: LeadDetailPage });

function stageTone(stage: LeadStage): "muted" | "brand" | "ok" | "warn" | "danger" | "info" {
  if (stage === "won") return "ok";
  if (stage === "lost") return "danger";
  if (stage === "negotiation" || stage === "proposal") return "warn";
  if (stage === "qualified") return "brand";
  if (stage === "contacted") return "info";
  return "muted";
}

function LeadDetailPage() {
  const { leadId } = Route.useParams();
  const { me, members } = useWorkspace();
  const qc = useQueryClient();
  const canView = hasPerm(me.role, "lead.view");
  const q = useQuery({ queryKey: ["lead", leadId], queryFn: () => getLead({ data: leadId }), enabled: canView });
  const canManage = hasPerm(me.role, "lead.manage");
  const canMoney = hasPerm(me.role, "finance.manage");
  const [lostOpen, setLostOpen] = useState(false);

  const save = useMutation({
    mutationFn: (data: Parameters<typeof updateLead>[0] extends { data: infer D } ? D : never) =>
      updateLead({ data }),
    onSuccess: async () => {
      toast.success("Lead updated");
      await qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const activity = useMutation({
    mutationFn: (data: { leadId: string; kind?: string; body: string; nextFollowUp?: string }) =>
      addLeadActivity({ data }),
    onSuccess: async () => {
      toast.success("Follow-up logged");
      await qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!canView) return <EmptyState title="No access" description="Leads are visible to the commercial desk." />;
  if (q.isPending) return <Skeleton className="h-96" />;
  if (!q.data) return <EmptyState title="Lead not found" description="It may have been removed, or you don’t have access." />;

  const { lead, activities, money } = q.data;
  const owner = members.find((m) => m.id === lead.ownerId);
  const owners = members.filter(
    (m) => m.status === "active" && ["ceo", "founder", "executive_assistant", "manager"].includes(m.role),
  );
  const billed = money.filter((e) => e.kind === "revenue").reduce((s, e) => s + e.amountInr, 0);
  const today = new Date().toISOString().slice(0, 10);
  const overdue = Boolean(lead.nextFollowUp && lead.nextFollowUp < today && lead.stage !== "won" && lead.stage !== "lost");

  function onMeta(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    save.mutate({
      id: lead.id,
      name: String(fd.get("name") ?? lead.name),
      company: String(fd.get("company") ?? lead.company),
      email: String(fd.get("email") ?? "") || undefined,
      phone: String(fd.get("phone") ?? "") || undefined,
      title: String(fd.get("title") ?? ""),
      source: String(fd.get("source") || lead.source),
      stage: String(fd.get("stage") || lead.stage),
      temperature: String(fd.get("temperature") || lead.temperature),
      valueInr: Number(fd.get("valueInr") || 0),
      ownerId: String(fd.get("ownerId") || "") || undefined,
      nextFollowUp: String(fd.get("nextFollowUp") || "") || undefined,
      city: String(fd.get("city") ?? "") || undefined,
      industry: String(fd.get("industry") ?? "") || undefined,
      notes: String(fd.get("notes") ?? ""),
    });
  }

  function onFollow(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = String(fd.get("body") ?? "");
    activity.mutate({
      leadId: lead.id,
      kind: String(fd.get("kind") || "follow_up"),
      body,
      nextFollowUp: String(fd.get("nextFollowUp") || "") || undefined,
    });
    e.currentTarget.reset();
  }

  function onLost(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    save.mutate({
      id: lead.id,
      name: lead.name,
      stage: "lost",
      lostReason: String(fd.get("lostReason") ?? ""),
    });
    setLostOpen(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={LEAD_SOURCE_LABEL[lead.source]}
        title={lead.company || lead.name}
        description={`${lead.name}${lead.title ? ` · ${lead.title}` : ""}${lead.city ? ` · ${lead.city}` : ""}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/leads">
              <Button size="sm" variant="secondary">
                Pipeline
              </Button>
            </Link>
            {canManage && lead.stage !== "won" ? (
              <Button
                size="sm"
                onClick={() => save.mutate({ id: lead.id, name: lead.name, stage: "won" })}
                disabled={save.isPending}
              >
                Mark won
              </Button>
            ) : null}
            {canManage && lead.stage !== "lost" ? (
              <Button size="sm" variant="secondary" onClick={() => setLostOpen((v) => !v)}>
                Lost
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={stageTone(lead.stage)}>{LEAD_STAGE_LABEL[lead.stage]}</Badge>
        <Badge tone={lead.temperature === "hot" ? "danger" : lead.temperature === "warm" ? "warn" : "muted"}>
          {LEAD_TEMP_LABEL[lead.temperature]}
        </Badge>
        {overdue ? <Badge tone="danger">Follow-up overdue</Badge> : null}
        {lead.lostReason ? <Badge tone="danger">{lead.lostReason}</Badge> : null}
      </div>

      {lostOpen ? (
        <Surface className="p-5">
          <h2 className="font-display text-sm font-semibold">Why did this stall?</h2>
          <form className="mt-3 flex flex-col gap-3 sm:flex-row" onSubmit={onLost}>
            <Input name="lostReason" required placeholder="Chose incumbent, budget, timing…" className="flex-1" />
            <Button type="submit" variant="secondary" size="sm">
              Record loss
            </Button>
          </form>
        </Surface>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-4">
        <Surface className="p-4">
          <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">Deal value</p>
          <p className="mt-2 font-display text-2xl font-semibold tabular-nums">{formatInr(lead.valueInr)}</p>
        </Surface>
        <Surface className="p-4">
          <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">Score</p>
          <p className="mt-2 font-display text-2xl font-semibold tabular-nums">{lead.score}</p>
          <ProgressRail value={lead.score} className="mt-3" />
        </Surface>
        <Surface className="p-4">
          <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">Billed</p>
          <p className="mt-2 font-display text-2xl font-semibold tabular-nums">{formatInr(billed)}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">{money.length} entries</p>
        </Surface>
        <Surface className="p-4">
          <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">Owner</p>
          <div className="mt-2 flex items-center gap-2">
            <PersonAvatar person={owner} />
            <p className="text-sm">{owner?.displayName ?? "Unassigned"}</p>
          </div>
        </Surface>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          {canManage ? (
            <Surface className="p-5">
              <h2 className="font-display text-base font-semibold">Log a follow-up</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                What happened, and when you will next speak. Overdue dates sit on the pipeline until you move them.
              </p>
              <form className="mt-4 space-y-3" onSubmit={onFollow}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="kind">Type</Label>
                    <Select id="kind" name="kind" defaultValue="follow_up">
                      {LEAD_ACTIVITY_KINDS.map((k) => (
                        <option key={k} value={k}>
                          {LEAD_ACTIVITY_LABEL[k]}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="next">Next follow-up</Label>
                    <Input id="next" name="nextFollowUp" type="date" defaultValue={lead.nextFollowUp ?? ""} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="body">What happened</Label>
                  <Textarea id="body" name="body" required placeholder="Called Sameer. Legal wants SLA language by Friday." />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={activity.isPending}>
                    {activity.isPending ? "Saving…" : "Log follow-up"}
                  </Button>
                </div>
              </form>
            </Surface>
          ) : null}

          <Surface className="p-5">
            <h2 className="font-display text-base font-semibold">Activity</h2>
            {activities.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No notes yet. The first call starts the record.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {activities.map((a) => {
                  const actor = members.find((m) => m.id === a.actorId);
                  return (
                    <li key={a.id} className="flex gap-3">
                      <PersonAvatar person={actor} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span className="text-sm">{actor?.displayName ?? "Someone"}</span>
                          <Badge tone="muted">{LEAD_ACTIVITY_LABEL[a.kind]}</Badge>
                          <span className="text-[11px] text-muted-foreground">{relativeTime(a.createdAt)}</span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
                        {a.nextFollowUp ? (
                          <p className="mt-1 text-[11px] text-muted-foreground">Next {formatShortDate(a.nextFollowUp)}</p>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Surface>
        </div>

        <div className="space-y-6">
          <Surface className="p-5">
            <h2 className="font-display text-base font-semibold">Record</h2>
            <form className="mt-4 space-y-3" onSubmit={onMeta}>
              <div className="space-y-1.5">
                <Label htmlFor="name">Contact</Label>
                <Input id="name" name="name" defaultValue={lead.name} required readOnly={!canManage} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company">Company</Label>
                <Input id="company" name="company" defaultValue={lead.company} readOnly={!canManage} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" defaultValue={lead.email ?? ""} readOnly={!canManage} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" defaultValue={lead.phone ?? ""} readOnly={!canManage} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" defaultValue={lead.title} readOnly={!canManage} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="valueInr">Value (₹)</Label>
                  <Input id="valueInr" name="valueInr" type="number" min={0} defaultValue={lead.valueInr} readOnly={!canManage} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="stage">Stage</Label>
                  <Select id="stage" name="stage" defaultValue={lead.stage} disabled={!canManage}>
                    {LEAD_STAGES.map((s) => (
                      <option key={s} value={s}>
                        {LEAD_STAGE_LABEL[s]}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="temperature">Temperature</Label>
                  <Select id="temperature" name="temperature" defaultValue={lead.temperature} disabled={!canManage}>
                    {LEAD_TEMPS.map((s) => (
                      <option key={s} value={s}>
                        {LEAD_TEMP_LABEL[s]}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ownerId">Owner</Label>
                  <Select id="ownerId" name="ownerId" defaultValue={lead.ownerId ?? me.id} disabled={!canManage}>
                    {owners.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.displayName}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nextFollowUp">Next follow-up</Label>
                  <Input id="nextFollowUp" name="nextFollowUp" type="date" defaultValue={lead.nextFollowUp ?? ""} readOnly={!canManage} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" defaultValue={lead.city ?? ""} readOnly={!canManage} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="industry">Industry</Label>
                  <Input id="industry" name="industry" defaultValue={lead.industry ?? ""} readOnly={!canManage} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" defaultValue={lead.notes} readOnly={!canManage} />
              </div>
              {canManage ? (
                <div className="flex justify-end">
                  <Button type="submit" size="sm" variant="secondary" disabled={save.isPending}>
                    Save record
                  </Button>
                </div>
              ) : null}
            </form>
          </Surface>

          <Surface className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-base font-semibold">Money</h2>
              {canMoney ? (
                <PostFinanceDialog defaultKind="revenue" leadId={lead.id}>
                  <Button size="sm" variant="secondary">
                    Post
                  </Button>
                </PostFinanceDialog>
              ) : null}
            </div>
            {money.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing billed against this lead yet. Marking a deal won posts the value as project revenue.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {money.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm">{e.title}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {FINANCE_KIND_LABEL[e.kind]} · {FINANCE_CATEGORY_LABEL[e.category] ?? e.category} · {formatShortDate(e.entryDate)}
                      </p>
                    </div>
                    <span className={`text-sm tabular-nums ${e.kind === "revenue" ? "text-ok" : "text-foreground"}`}>
                      {e.kind === "revenue" ? "+" : "−"}
                      {formatInr(e.amountInr)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Surface>
        </div>
      </div>
    </div>
  );
}
