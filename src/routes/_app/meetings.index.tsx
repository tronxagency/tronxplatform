import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Video } from "lucide-react";
import { MeetDialog } from "@/components/meet-dialog";
import { EmptyState, PageHeader, Surface } from "@/components/marks";
import { Button } from "@/components/ui/button";
import { PersonAvatar, Skeleton } from "@/components/ui/display";
import { useWorkspace } from "@/components/workspace";
import { listMeetings } from "@/lib/server/fns";
import { formatShortDate, relativeTime } from "@/lib/utils";

export const Route = createFileRoute("/_app/meetings/")({ component: MeetingsPage });

function MeetingsPage() {
  const { members } = useWorkspace();
  const q = useQuery({ queryKey: ["meetings"], queryFn: () => listMeetings(), refetchInterval: 15_000 });
  const live = (q.data ?? []).filter((m) => m.status === "live");
  const upcoming = (q.data ?? []).filter((m) => m.status === "scheduled");
  const past = (q.data ?? []).filter((m) => m.status === "ended" || m.status === "cancelled");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Communication"
        title="Meetings"
        description="Start a call with the company, a team, a project, or one person — then join in Google Meet."
        actions={
          <MeetDialog>
            <Button>
              <Video className="size-4" />
              Start meeting
            </Button>
          </MeetDialog>
        }
      />
      {q.isPending ? (
        <Skeleton className="h-64" />
      ) : (q.data ?? []).length === 0 ? (
        <EmptyState title="No meetings yet" description="Start an instant meeting from here, a team, a project, or someone’s profile." />
      ) : (
        <div className="space-y-6">
          {live.length > 0 ? (
            <section className="space-y-3">
              <h2 className="font-display text-sm font-semibold">Live now</h2>
              {live.map((m) => (
                <MeetingCard key={m.id} meeting={m} members={members} />
              ))}
            </section>
          ) : null}
          {upcoming.length > 0 ? (
            <section className="space-y-3">
              <h2 className="font-display text-sm font-semibold">Upcoming</h2>
              {upcoming.map((m) => (
                <MeetingCard key={m.id} meeting={m} members={members} />
              ))}
            </section>
          ) : null}
          {past.length > 0 ? (
            <section className="space-y-3">
              <h2 className="font-display text-sm font-semibold">Earlier</h2>
              {past.slice(0, 12).map((m) => (
                <MeetingCard key={m.id} meeting={m} members={members} />
              ))}
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}

function MeetingCard({
  meeting,
  members,
}: {
  meeting: { id: string; title: string; scope: string; status: string; startsAt: string; participantIds: string[]; organizerId: string | null };
  members: { id: string; displayName: string; avatarKey: string }[];
}) {
  const organizer = members.find((m) => m.id === meeting.organizerId);
  return (
    <Link to="/meetings/$meetingId" params={{ meetingId: meeting.id }}>
      <Surface className="flex items-center gap-4 p-4 transition-colors hover:bg-accent/40">
        <div className="grid size-10 place-items-center rounded-xl bg-brand/15 text-brand">
          <Video className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{meeting.title}</p>
          <p className="text-xs text-muted-foreground">
            {meeting.scope} · {organizer?.displayName ?? "Organizer"} · {formatShortDate(meeting.startsAt)} · {relativeTime(meeting.startsAt)}
          </p>
        </div>
        <div className="hidden items-center -space-x-1.5 sm:flex">
          {meeting.participantIds.slice(0, 5).map((id) => (
            <PersonAvatar key={id} person={members.find((m) => m.id === id)} size="sm" className="ring-2 ring-card" />
          ))}
        </div>
        <span className="text-[11px] tracking-wide text-muted-foreground uppercase">{meeting.status}</span>
      </Surface>
    </Link>
  );
}
