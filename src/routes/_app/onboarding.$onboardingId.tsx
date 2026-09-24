import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Video } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { EmptyState, PageHeader, Surface } from "@/components/marks";
import { MeetButton } from "@/components/meet-dialog";
import { Button } from "@/components/ui/button";
import { Badge, PersonAvatar, ProgressRail, Skeleton } from "@/components/ui/display";
import { Label, Select, Textarea } from "@/components/ui/forms";
import { useWorkspace } from "@/components/workspace";
import { hasPerm, isExecOffice } from "@/lib/permissions";
import {
  cancelOnboarding,
  completeOnboarding,
  getOnboarding,
  saveOnboarding,
  toggleOnboardingStep,
} from "@/lib/server/fns";
import {
  ONBOARDING_CATEGORY_LABEL,
  ONBOARDING_STATUS_LABEL,
  ROLE_LABEL,
  type OnboardingStep,
} from "@/lib/types";
import { cn, formatShortDate } from "@/lib/utils";

export const Route = createFileRoute("/_app/onboarding/$onboardingId")({ component: OnboardingDetailPage });

const CATEGORIES: OnboardingStep["category"][] = ["setup", "access", "people", "rhythm"];

function OnboardingDetailPage() {
  const { onboardingId } = Route.useParams();
  const { me, members } = useWorkspace();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["onboarding", onboardingId],
    queryFn: () => getOnboarding({ data: onboardingId }),
  });
  const manage = hasPerm(me.role, "onboarding.manage");

  const toggle = useMutation({
    mutationFn: (data: { stepId: string; done: boolean }) => toggleOnboardingStep({ data }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["onboarding"] });
      await qc.invalidateQueries({ queryKey: ["onboardings"] });
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
      await qc.invalidateQueries({ queryKey: ["workspace"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const complete = useMutation({
    mutationFn: () => completeOnboarding({ data: onboardingId }),
    onSuccess: async () => {
      toast.success("Onboarding signed off");
      await qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const cancel = useMutation({
    mutationFn: () => cancelOnboarding({ data: onboardingId }),
    onSuccess: async () => {
      toast.success("Onboarding cancelled");
      await qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (q.isPending) return <Skeleton className="h-96" />;
  if (!q.data) return <EmptyState title="Onboarding not found" description="It may have been removed, or you don’t have access." />;

  const board = q.data;
  const person = members.find((m) => m.id === board.profileId);
  const deskOwners = members.filter((m) => isExecOffice(m.role));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="First two weeks"
        title={board.displayName}
        description={
          board.title && board.title !== ROLE_LABEL[board.role]
            ? `${ROLE_LABEL[board.role]} · ${board.title} · desk owned by ${board.ownerName ?? "unassigned"}`
            : `${ROLE_LABEL[board.role]} · desk owned by ${board.ownerName ?? "unassigned"}`
        }
        actions={
          <div className="flex flex-wrap gap-2">
            {board.kickoffMeetingId ? (
              <Link to="/meetings/$meetingId" params={{ meetingId: board.kickoffMeetingId }}>
                <Button size="sm" variant="secondary">
                  <Video className="size-4" />
                  Kickoff
                </Button>
              </Link>
            ) : person && person.id !== me.id ? (
              <MeetButton
                label="Kickoff meeting"
                defaultScope="selected"
                profileIds={[board.profileId, board.ownerId].filter(Boolean) as string[]}
                title={`Onboarding — ${board.displayName}`}
              />
            ) : null}
            {manage && board.status === "open" ? (
              <Button size="sm" onClick={() => complete.mutate()} disabled={complete.isPending}>
                Sign off
              </Button>
            ) : null}
            {manage && board.status === "open" ? (
              <Button size="sm" variant="secondary" onClick={() => cancel.mutate()} disabled={cancel.isPending}>
                Cancel
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Surface className="p-4">
          <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">Progress</p>
          <p className="mt-2 font-display text-2xl font-semibold tabular-nums">{board.progress}%</p>
          <ProgressRail value={board.progress} className="mt-3" />
          <p className="mt-2 text-xs text-muted-foreground">
            {board.stepDone} of {board.stepTotal} steps
          </p>
        </Surface>
        <Surface className="p-4">
          <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">Status</p>
          <div className="mt-3">
            <Badge tone={board.status === "completed" ? "ok" : board.status === "cancelled" ? "muted" : "brand"}>
              {ONBOARDING_STATUS_LABEL[board.status]}
            </Badge>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Due {formatShortDate(board.dueAt)}</p>
        </Surface>
        <Surface className="p-4">
          <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">Person</p>
          <Link to="/employees/$employeeId" params={{ employeeId: board.profileId }} className="mt-3 flex items-center gap-3 hover:underline">
            <PersonAvatar person={person ?? board} />
            <span className="text-sm">{board.displayName}</span>
          </Link>
        </Surface>
      </div>

      {CATEGORIES.map((cat) => {
        const steps = board.steps.filter((s) => s.category === cat);
        if (steps.length === 0) return null;
        return (
          <Surface key={cat} className="p-5">
            <h2 className="font-display text-sm font-semibold">{ONBOARDING_CATEGORY_LABEL[cat]}</h2>
            <ul className="mt-3 divide-y divide-border">
              {steps.map((step) => (
                <StepRow
                  key={step.id}
                  step={step}
                  startedAt={board.startedAt}
                  busy={toggle.isPending}
                  onToggle={(done) => toggle.mutate({ stepId: step.id, done })}
                />
              ))}
            </ul>
          </Surface>
        );
      })}

      {manage ? <NotesForm id={board.id} notes={board.notes} ownerId={board.ownerId} owners={deskOwners} /> : board.notes ? (
        <Surface className="p-5">
          <h2 className="font-display text-sm font-semibold">Desk notes</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{board.notes}</p>
        </Surface>
      ) : null}
    </div>
  );
}

function StepRow({
  step,
  startedAt,
  busy,
  onToggle,
}: {
  step: OnboardingStep;
  startedAt: string;
  busy: boolean;
  onToggle: (done: boolean) => void;
}) {
  const due = new Date(startedAt);
  due.setDate(due.getDate() + step.dueOffsetDays);
  const ownerLabel = step.ownerKind === "self" ? "Executive" : step.ownerKind === "both" ? "Shared" : "Desk";
  return (
    <li className="flex items-start gap-3 py-3">
      <button
        type="button"
        onClick={() => onToggle(!step.done)}
        disabled={busy}
        aria-label={step.done ? `Mark ${step.title} incomplete` : `Complete ${step.title}`}
        className={cn(
          "mt-0.5 grid size-11 shrink-0 place-items-center rounded-full border transition-colors",
          step.done ? "border-brand bg-brand/15 text-brand" : "border-border text-muted-foreground hover:border-brand/50",
        )}
      >
        {step.done ? <Check className="size-4" /> : null}
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-medium", step.done && "text-muted-foreground line-through")}>{step.title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{step.description}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {ownerLabel} · day {step.dueOffsetDays} · {formatShortDate(due.toISOString())}
        </p>
      </div>
      {step.href ? (
        <a href={step.href} className="mt-2 shrink-0 text-xs text-muted-foreground hover:text-foreground">
          Open
        </a>
      ) : null}
    </li>
  );
}

function NotesForm({
  id,
  notes,
  ownerId,
  owners,
}: {
  id: string;
  notes: string;
  ownerId: string | null;
  owners: { id: string; displayName: string }[];
}) {
  const qc = useQueryClient();
  const [text, setText] = useState(notes);
  const save = useMutation({
    mutationFn: (payload: { id: string; notes?: string; ownerId?: string | null }) => saveOnboarding({ data: payload }),
    onSuccess: async () => {
      toast.success("Desk updated");
      await qc.invalidateQueries({ queryKey: ["onboarding"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    save.mutate({ id, notes: text });
  }

  return (
    <Surface className="p-5">
      <h2 className="font-display text-sm font-semibold">Desk notes</h2>
      <form className="mt-3 space-y-4" onSubmit={onSubmit}>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Priorities, 30-day goals, follow-through…" />
        <div className="space-y-1.5">
          <Label htmlFor="ownerId">Desk owner</Label>
          <Select
            id="ownerId"
            value={ownerId ?? ""}
            onChange={(e) => save.mutate({ id, ownerId: e.target.value || null })}
          >
            <option value="">Unassigned</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.displayName}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" size="sm" disabled={save.isPending}>
          Save notes
        </Button>
      </form>
    </Surface>
  );
}
