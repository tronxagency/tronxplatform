import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardCheck } from "lucide-react";
import { useState } from "react";
import { EnrollEmployeeDialog } from "@/components/enroll-employee";
import { EmptyState, PageHeader, Surface } from "@/components/marks";
import { Button } from "@/components/ui/button";
import { Badge, PersonAvatar, ProgressRail, Skeleton } from "@/components/ui/display";
import { useWorkspace } from "@/components/workspace";
import { canEnroll, hasPerm } from "@/lib/permissions";
import { listOnboardings } from "@/lib/server/fns";
import {
  ONBOARDING_STATUS_LABEL,
  ROLE_LABEL,
  type OnboardingStatus,
  type OnboardingSummary,
} from "@/lib/types";
import { formatShortDate } from "@/lib/utils";

export const Route = createFileRoute("/_app/onboarding/")({ component: OnboardingDeskPage });

function OnboardingDeskPage() {
  const { me } = useWorkspace();
  const [status, setStatus] = useState<OnboardingStatus | "all">("open");
  const q = useQuery({
    queryKey: ["onboardings", status],
    queryFn: () => listOnboardings({ data: { status } }),
  });
  const manage = hasPerm(me.role, "onboarding.manage");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Executive office"
        title="Onboarding"
        description="First two weeks for founders and the executive assistant — owned by the desk, visible to the Founder & CEO."
        actions={
          canEnroll(me.role) ? (
            <EnrollEmployeeDialog>
              <Button size="sm">Enroll executive</Button>
            </EnrollEmployeeDialog>
          ) : null
        }
      />

      <div className="flex gap-1 overflow-x-auto no-scrollbar">
        {(["open", "completed", "cancelled", "all"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`h-9 shrink-0 rounded-full px-3 text-sm ${status === s ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {s === "all" ? "All" : ONBOARDING_STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {q.isPending ? (
        <Skeleton className="h-64" />
      ) : (q.data ?? []).length === 0 ? (
        <EmptyState
          title={status === "open" ? "No open executive onboardings" : "Nothing in this view"}
          description={
            manage
              ? "Enroll a founder or executive assistant and a 14-day checklist opens on this desk automatically."
              : "When leadership enrolls you, your first-week checklist will land here."
          }
        />
      ) : (
        <ul className="grid gap-3">
          {(q.data ?? []).map((row) => (
            <OnboardingCard key={row.id} row={row} />
          ))}
        </ul>
      )}
    </div>
  );
}

function OnboardingCard({ row }: { row: OnboardingSummary }) {
  const tone = row.status === "completed" ? "ok" : row.status === "cancelled" ? "muted" : row.progress === 0 ? "warn" : "brand";
  return (
    <li>
      <Link to="/onboarding/$onboardingId" params={{ onboardingId: row.id }} className="block">
        <Surface className="p-5 transition-colors hover:bg-accent/30">
          <div className="flex items-start gap-3">
            <PersonAvatar person={row} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{row.displayName}</p>
                <Badge tone={tone}>{ONBOARDING_STATUS_LABEL[row.status]}</Badge>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {row.title && row.title !== ROLE_LABEL[row.role]
                  ? `${ROLE_LABEL[row.role]} · ${row.title}`
                  : ROLE_LABEL[row.role]}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Desk: {row.ownerName ?? "Unassigned"}
                {row.dueAt ? ` · due ${formatShortDate(row.dueAt)}` : ""}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <ProgressRail value={row.progress} className="flex-1" />
                <span className="text-xs tabular-nums text-muted-foreground">
                  {row.stepDone}/{row.stepTotal}
                </span>
              </div>
            </div>
            <ClipboardCheck className="size-4 shrink-0 text-muted-foreground" />
          </div>
        </Surface>
      </Link>
    </li>
  );
}
