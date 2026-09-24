import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { PageHeader, Surface } from "@/components/marks";
import { Button } from "@/components/ui/button";
import { PersonAvatar } from "@/components/ui/display";
import { Input, Label, Textarea } from "@/components/ui/forms";
import { useTheme } from "@/components/theme";
import { useWorkspace } from "@/components/workspace";
import { ACCENT_LABEL, ACCENTS, ROLE_LABEL, type Accent, type Density, type ThemeMode } from "@/lib/types";
import { UserButton } from "@/lib/auth/gates";
import { authClient } from "@/lib/auth/client";
import { googleCalendarProbe, updateEmployee } from "@/lib/server/fns";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/settings")({ component: SettingsPage });

const TABS = ["Profile", "Appearance", "Security", "Integrations", "Notifications"] as const;

function SettingsPage() {
  const { me, org } = useWorkspace();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Profile");
  const qc = useQueryClient();
  const save = useMutation({
    mutationFn: (data: {
      id: string;
      name: string;
      email: string;
      phone?: string;
      location?: string;
      bio?: string;
      skills?: string;
    }) => updateEmployee({ data }),
    onSuccess: async () => {
      toast.success("Profile saved");
      await qc.invalidateQueries({ queryKey: ["workspace"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    save.mutate({
      id: me.id,
      name: String(fd.get("name") ?? me.displayName),
      email: me.email ?? "",
      phone: String(fd.get("phone") ?? ""),
      location: String(fd.get("location") ?? ""),
      bio: String(fd.get("bio") ?? ""),
      skills: String(fd.get("skills") ?? ""),
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Account" title="Settings" description="Profile, appearance, security and integrations for this workspace." />
      <div className="flex gap-1 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "h-9 shrink-0 rounded-full px-3 text-sm",
              tab === t ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Profile" ? (
        <Surface className="p-5">
          <div className="flex items-center gap-4">
            <PersonAvatar person={me} size="lg" />
            <div>
              <p className="font-display text-lg font-semibold">{me.displayName}</p>
              <p className="text-sm text-muted-foreground">{me.email ?? "No email on file"}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {ROLE_LABEL[me.role]} · {me.title} · {org.name}
              </p>
            </div>
          </div>
          <form className="mt-6 grid gap-3 sm:grid-cols-2" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={me.displayName} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={me.phone ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" defaultValue={me.location ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="skills">Skills</Label>
              <Input id="skills" name="skills" defaultValue={me.skills.join(", ")} />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" defaultValue={me.bio} />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "Saving…" : "Save profile"}
              </Button>
            </div>
          </form>
          <div className="mt-6 border-t border-border pt-4">
            <UserButton />
          </div>
        </Surface>
      ) : null}

      {tab === "Appearance" ? <AppearancePanel /> : null}
      {tab === "Security" ? <SecurityPanel /> : null}
      {tab === "Integrations" ? <IntegrationsPanel /> : null}

      {tab === "Notifications" ? (
        <Surface className="p-5">
          <h2 className="font-display text-sm font-semibold">Notifications</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            In-app alerts are on for assignments, mentions, reviews, meetings and missed deadlines. Email and push can follow once a mail provider is configured.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            TRONX only records work you log or move — tasks, time entries, comments and status. There is no screen capture, keylogging or hidden monitoring.
          </p>
        </Surface>
      ) : null}
    </div>
  );
}

function AppearancePanel() {
  const { theme, accent, density, setTheme, setAccent, setDensity } = useTheme();
  return (
    <Surface className="p-5 space-y-6">
      <div>
        <h2 className="font-display text-sm font-semibold">Theme</h2>
        <p className="mt-1 text-sm text-muted-foreground">Applies instantly. Saved to your profile.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {(["light", "dark", "system"] as ThemeMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setTheme(mode)}
              className={cn(
                "rounded-xl border px-3 py-3 text-left text-sm capitalize",
                theme === mode ? "border-brand bg-brand/10" : "border-border hover:bg-accent/40",
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h2 className="font-display text-sm font-semibold">Accent</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {ACCENTS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAccent(a as Accent)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm",
                accent === a ? "border-brand bg-brand/10" : "border-border hover:bg-accent/40",
              )}
            >
              {ACCENT_LABEL[a]}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h2 className="font-display text-sm font-semibold">Density</h2>
        <div className="mt-3 flex gap-2">
          {(["comfortable", "compact"] as Density[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDensity(d)}
              className={cn(
                "rounded-xl border px-3 py-2 text-sm capitalize",
                density === d ? "border-brand bg-brand/10" : "border-border hover:bg-accent/40",
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </Surface>
  );
}

function SecurityPanel() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function onChange(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const currentPassword = String(fd.get("current") ?? "");
    const newPassword = String(fd.get("next") ?? "");
    try {
      const res = await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true });
      if (res.error) throw new Error(res.error.message || "Could not change password");
      toast.success("Password updated");
      e.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password change is not available in this environment.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-4">
      <Surface className="p-5">
        <h2 className="font-display text-sm font-semibold">Change password</h2>
        <p className="mt-1 text-sm text-muted-foreground">Use a long passphrase. Other sessions can be revoked when the platform supports it.</p>
        <form className="mt-4 grid gap-3 sm:max-w-md" onSubmit={onChange}>
          <div className="space-y-1.5">
            <Label htmlFor="current">Current password</Label>
            <Input id="current" name="current" type="password" required autoComplete="current-password" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="next">New password</Label>
            <Input id="next" name="next" type="password" required minLength={8} autoComplete="new-password" />
          </div>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button type="submit" disabled={busy}>
            {busy ? "Updating…" : "Update password"}
          </Button>
        </form>
      </Surface>
      <Surface className="p-5">
        <h2 className="font-display text-sm font-semibold">Email verification</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Invitation-based enrollment is the verification path today. Transactional email (reset links, verify-address mail) requires a mail provider on the auth server — not configured in this workspace yet.
        </p>
      </Surface>
      <Surface className="p-5">
        <h2 className="font-display text-sm font-semibold">Sessions</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your session expires with the signed-in cookie. Two-factor authentication can be enabled later without changing this product surface.
        </p>
        <div className="mt-4">
          <UserButton />
        </div>
      </Surface>
    </div>
  );
}

function IntegrationsPanel() {
  const probe = useQuery({
    queryKey: ["google-calendar-probe"],
    queryFn: () => googleCalendarProbe(),
    retry: false,
  });
  const data = probe.data;
  return (
    <div className="space-y-4">
      <Surface className="p-5">
        <h2 className="font-display text-sm font-semibold">Google Calendar & Meet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Meetings live in TRONX. Join uses Google Meet. Creating a unique Meet conference requires Calendar event-write permission, which this connector does not expose yet.
        </p>
        <dl className="mt-4 space-y-2 text-sm">
          <Row label="Google OAuth" value="Via the connected Google Calendar account" />
          <Row label="List calendars" value="Supported when connected" />
          <Row label="Search events" value="Supported when connected" />
          <Row label="Create event / Meet link" value="Not available on this connector — paste the Meet URL after joining" />
        </dl>
        <div className="mt-4">
          {probe.isPending ? (
            <p className="text-sm text-muted-foreground">Checking connection…</p>
          ) : data?.ok ? (
            <p className="text-sm text-ok">Google Calendar is connected. You can read calendars; Meet rooms are still created in Meet itself.</p>
          ) : data?.loginRequired && data.loginUrl ? (
            <a href={data.loginUrl} target="_blank" rel="noreferrer">
              <Button>Connect Google Calendar</Button>
            </a>
          ) : data?.pending ? (
            <p className="text-sm text-muted-foreground">Waiting for Google authorization…</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {data?.error || "Google Calendar is not connected for this viewer. Connect it from Grok, then return here."}
            </p>
          )}
        </div>
      </Surface>
      <Surface className="p-5">
        <h2 className="font-display text-sm font-semibold">Coming later</h2>
        <p className="mt-2 text-sm text-muted-foreground">Google Drive, Gmail, Slack and Microsoft Teams stay modular. Credentials never belong in the browser.</p>
      </Surface>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="sm:text-right">{value}</dd>
    </div>
  );
}
