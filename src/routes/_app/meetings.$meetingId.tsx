import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy, Video } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState, PageHeader, Surface } from "@/components/marks";
import { Button } from "@/components/ui/button";
import { PersonAvatar, Skeleton } from "@/components/ui/display";
import { Input, Label } from "@/components/ui/forms";
import { useWorkspace } from "@/components/workspace";
import { isExecOffice } from "@/lib/permissions";
import { getMeeting, updateMeeting } from "@/lib/server/fns";
import { formatShortDate, relativeTime } from "@/lib/utils";

export const Route = createFileRoute("/_app/meetings/$meetingId")({ component: MeetingDetailPage });

function MeetingDetailPage() {
  const { meetingId } = Route.useParams();
  const { members, me } = useWorkspace();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["meeting", meetingId],
    queryFn: () => getMeeting({ data: meetingId }),
  });
  const [url, setUrl] = useState("");
  const save = useMutation({
    mutationFn: (data: { meetUrl?: string; status?: "scheduled" | "live" | "ended" | "cancelled"; title?: string }) =>
      updateMeeting({ data: { id: meetingId, ...data } }),
    onSuccess: async () => {
      toast.success("Updated");
      await qc.invalidateQueries({ queryKey: ["meeting", meetingId] });
      await qc.invalidateQueries({ queryKey: ["meetings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (q.isPending) return <Skeleton className="h-64" />;
  if (!q.data) return <EmptyState title="Meeting not found" description="It may have been cancelled." />;

  const { meeting, participants } = q.data;
  const organizer = members.find((m) => m.id === meeting.organizerId);
  const canEdit = meeting.organizerId === me.id || isExecOffice(me.role);
  const joinHref = meeting.meetUrl || "https://meet.google.com/new";

  function copy() {
    void navigator.clipboard.writeText(`${window.location.origin}/meetings/${meeting.id}`);
    toast.success("Copied");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={meeting.scope}
        title={meeting.title}
        description={meeting.description || `${organizer?.displayName ?? "Organizer"} · ${formatShortDate(meeting.startsAt)}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => window.open(joinHref, "_blank", "noopener")}>
              <Video className="size-4" />
              Join Google Meet
            </Button>
            <Button variant="secondary" onClick={copy}>
              <Copy className="size-4" />
              Copy link
            </Button>
            {canEdit && meeting.status !== "ended" && meeting.status !== "cancelled" ? (
              <Button variant="ghost" onClick={() => save.mutate({ status: "ended" })}>
                End
              </Button>
            ) : null}
          </div>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Surface className="space-y-4 p-5">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">Status</dt>
              <dd className="mt-1 capitalize">{meeting.status}</dd>
            </div>
            <div>
              <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">Starts</dt>
              <dd className="mt-1">{relativeTime(meeting.startsAt)}</dd>
            </div>
            <div>
              <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">Organizer</dt>
              <dd className="mt-1">{organizer?.displayName ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">Provider</dt>
              <dd className="mt-1">Google Meet</dd>
            </div>
          </dl>
          {meeting.meetUrl ? (
            <p className="break-all text-sm text-brand">{meeting.meetUrl}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              No unique Meet room is attached yet. Join opens a new Google Meet. The organizer can paste the real URL below so everyone lands in the same call.
            </p>
          )}
          {canEdit ? (
            <div className="space-y-1.5">
              <Label htmlFor="url">Meet URL</Label>
              <div className="flex gap-2">
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://meet.google.com/abc-defg-hij"
                />
                <Button variant="secondary" disabled={!url.trim() || save.isPending} onClick={() => save.mutate({ meetUrl: url.trim() })}>
                  Save
                </Button>
              </div>
            </div>
          ) : null}
          {meeting.projectId ? (
            <Link to="/projects/$projectId" params={{ projectId: meeting.projectId }} className="text-sm text-brand hover:underline">
              Open project
            </Link>
          ) : null}
        </Surface>
        <Surface className="p-5">
          <h2 className="font-display text-sm font-semibold">Participants</h2>
          <ul className="mt-3 space-y-2">
            {participants.map((p) => {
              const person = members.find((m) => m.id === p.profile_id);
              return (
                <li key={p.profile_id} className="flex items-center gap-2">
                  <PersonAvatar person={person} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{person?.displayName ?? p.profile_id}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {p.role} · {p.rsvp}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Surface>
      </div>
    </div>
  );
}
