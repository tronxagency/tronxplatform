import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Copy, Video } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { toast } from "sonner";
import { createMeeting, updateMeeting } from "@/lib/server/fns";
import { canStartMeeting, meetingScopesFor, type MeetingScope } from "@/lib/permissions";
import { Button } from "./ui/button";
import { Input, Label, Select } from "./ui/forms";
import { Dialog, DialogContent, DialogTrigger } from "./ui/overlay";
import { PersonAvatar } from "./ui/display";
import { useWorkspace } from "./workspace";

export const GOOGLE_MEET_NEW = "https://meet.google.com/new";

const SCOPE_LABEL: Record<MeetingScope, string> = {
  company: "Everyone",
  department: "Department",
  team: "Team",
  project: "Project",
  selected: "Selected people",
  direct: "Individual",
};

export function MeetDialog({
  children,
  defaultScope,
  departmentId,
  teamId,
  projectId,
  taskId,
  profileIds,
  title,
  open: controlledOpen,
  onOpenChange,
}: {
  children?: ReactNode;
  defaultScope?: MeetingScope;
  departmentId?: string;
  teamId?: string;
  projectId?: string;
  taskId?: string;
  profileIds?: string[];
  title?: string;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}) {
  const { me, members, teams, departments } = useWorkspace();
  const scopes = meetingScopesFor(me.role);
  const [internal, setInternal] = useState(false);
  const open = controlledOpen ?? internal;
  const setOpen = onOpenChange ?? setInternal;
  const [scope, setScope] = useState<MeetingScope>(defaultScope && scopes.includes(defaultScope) ? defaultScope : scopes[0] ?? "direct");
  const [dept, setDept] = useState(departmentId ?? "");
  const [team, setTeam] = useState(teamId ?? "");
  const [project, setProject] = useState(projectId ?? "");
  const [picked, setPicked] = useState<string[]>(profileIds ?? []);
  const [step, setStep] = useState<"form" | "room">("form");
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [meetUrl, setMeetUrl] = useState("");
  const navigate = useNavigate();
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: (instant: boolean) =>
      createMeeting({
        data: {
          title: title?.trim() || undefined,
          scope,
          departmentId: scope === "department" ? dept || undefined : undefined,
          teamId: scope === "team" ? team || undefined : undefined,
          projectId: scope === "project" ? project || projectId : projectId,
          taskId,
          profileIds: scope === "direct" || scope === "selected" ? (picked.length ? picked : profileIds) : profileIds,
          instant,
        },
      }),
    onSuccess: async (res, instant) => {
      setMeetingId(res.id);
      setStep("room");
      toast.success(instant ? "Meeting started" : "Meeting scheduled");
      await qc.invalidateQueries({ queryKey: ["workspace"] });
      await qc.invalidateQueries({ queryKey: ["meetings"] });
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveUrl = useMutation({
    mutationFn: (url: string) => updateMeeting({ data: { id: meetingId!, meetUrl: url } }),
    onSuccess: () => toast.success("Meet link saved"),
    onError: (e: Error) => toast.error(e.message),
  });

  const participants = useMemo(() => {
    if (scope === "company") return members.filter((m) => m.status === "active");
    if (scope === "department" && dept) return members.filter((m) => m.departmentId === dept);
    if (scope === "team" && team) {
      const t = teams.find((x) => x.id === team);
      return members.filter((m) => t?.memberIds.includes(m.id));
    }
    if (profileIds?.length) return members.filter((m) => profileIds.includes(m.id) || m.id === me.id);
    if (picked.length) return members.filter((m) => picked.includes(m.id) || m.id === me.id);
    return [me];
  }, [scope, dept, team, members, teams, profileIds, picked, me]);

  if (scopes.length === 0) return children ? <>{children}</> : null;

  function copyLink() {
    const href = meetingId ? `${window.location.origin}/meetings/${meetingId}` : "";
    if (href) {
      void navigator.clipboard.writeText(href);
      toast.success("Meeting link copied");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setStep("form");
          setMeetingId(null);
          setMeetUrl("");
        }
      }}
    >
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent title={step === "room" ? "Join meeting" : "Start meeting"} className="w-[min(100%-1.5rem,32rem)]">
        {step === "form" ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Creates a TRONX meeting room and opens Google Meet. Paste the real Meet URL so everyone joins the same call.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="scope">Who</Label>
              <Select
                id="scope"
                value={scope}
                onChange={(e) => setScope(e.target.value as MeetingScope)}
                disabled={Boolean(defaultScope) && Boolean(profileIds || teamId || projectId || departmentId)}
              >
                {scopes.map((s) => (
                  <option key={s} value={s}>
                    {SCOPE_LABEL[s]}
                  </option>
                ))}
              </Select>
            </div>
            {scope === "department" ? (
              <div className="space-y-1.5">
                <Label htmlFor="dept">Department</Label>
                <Select id="dept" value={dept} onChange={(e) => setDept(e.target.value)}>
                  <option value="">Select…</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </Select>
              </div>
            ) : null}
            {scope === "team" && !teamId ? (
              <div className="space-y-1.5">
                <Label htmlFor="team">Team</Label>
                <Select id="team" value={team} onChange={(e) => setTeam(e.target.value)}>
                  <option value="">Select…</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </div>
            ) : null}
            {(scope === "direct" || scope === "selected") && !profileIds?.length ? (
              <div className="space-y-1.5">
                <Label>People</Label>
                <select
                  className="h-10 w-full rounded-lg border border-input bg-secondary px-3 text-sm"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value && !picked.includes(e.target.value)) setPicked((p) => [...p, e.target.value]);
                    e.target.value = "";
                  }}
                >
                  <option value="">Add participant…</option>
                  {members
                    .filter((m) => m.id !== me.id && m.status === "active" && !picked.includes(m.id))
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.displayName}
                      </option>
                    ))}
                </select>
                <div className="flex flex-wrap gap-1.5">
                  {picked.map((id) => {
                    const p = members.find((m) => m.id === id);
                    return (
                      <button
                        key={id}
                        type="button"
                        className="rounded-full border border-border px-2 py-0.5 text-xs"
                        onClick={() => setPicked((list) => list.filter((x) => x !== id))}
                      >
                        {p?.displayName ?? id}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
            <div>
              <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Participants</p>
              <div className="mt-2 flex -space-x-1.5">
                {participants.slice(0, 8).map((p) => (
                  <PersonAvatar key={p.id} person={p} size="sm" className="ring-2 ring-card" />
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{participants.length} people</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => create.mutate(false)} disabled={create.isPending || !canStartMeeting(me.role, scope)}>
                Schedule
              </Button>
              <Button onClick={() => create.mutate(true)} disabled={create.isPending || !canStartMeeting(me.role, scope)}>
                <Video className="size-4" />
                Start now
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Google Meet cannot mint a unique room from TRONX yet — Calendar write access is not on this connector. Open a new Meet, then paste the URL so the team joins you.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => window.open(GOOGLE_MEET_NEW, "_blank", "noopener")}>
                <Video className="size-4" />
                Join Google Meet
              </Button>
              <Button variant="secondary" onClick={copyLink}>
                <Copy className="size-4" />
                Copy TRONX link
              </Button>
              {meetingId ? (
                <Button variant="ghost" onClick={() => void navigate({ to: "/meetings/$meetingId", params: { meetingId } })}>
                  Open room
                </Button>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="meetUrl">Paste Meet URL</Label>
              <div className="flex gap-2">
                <Input
                  id="meetUrl"
                  value={meetUrl}
                  onChange={(e) => setMeetUrl(e.target.value)}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                />
                <Button
                  variant="secondary"
                  disabled={!meetUrl.trim() || !meetingId || saveUrl.isPending}
                  onClick={() => saveUrl.mutate(meetUrl.trim())}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function MeetButton({
  label = "Meet",
  ...props
}: {
  label?: string;
} & Omit<Parameters<typeof MeetDialog>[0], "children">) {
  return (
    <MeetDialog {...props}>
      <Button size="sm" variant="secondary">
        <Video className="size-4" />
        {label}
      </Button>
    </MeetDialog>
  );
}
