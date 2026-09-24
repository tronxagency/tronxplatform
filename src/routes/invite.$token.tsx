import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { LogoMark } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/forms";
import { Skeleton } from "@/components/ui/display";
import { acceptInvitation, getInvitation } from "@/lib/server/fns";
import { authClient, authEnabled } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ROLE_LABEL, type Role } from "@/lib/types";

export const Route = createFileRoute("/invite/$token")({ component: InvitePage });

function InvitePage() {
  const { token } = Route.useParams();
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const q = useQuery({
    queryKey: ["invite", token],
    queryFn: () => getInvitation({ data: token }),
  });
  const accept = useMutation({
    mutationFn: () => acceptInvitation({ data: token }),
    onSuccess: async (r) => {
      if (r.onboardingId) {
        await navigate({ to: "/onboarding/$onboardingId", params: { onboardingId: r.onboardingId } });
      } else {
        await navigate({ to: "/" });
      }
    },
    onError: (e: Error) => setError(e.message),
  });

  const invite = q.data;

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!invite) return;
    setError(null);
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    try {
      const res = await authClient.signUp.email({
        email: invite.email,
        password,
        name: invite.name,
      });
      if (res.error) throw new Error(res.error.message || "Could not create account");
      try {
        const accepted = await acceptInvitation({ data: token });
        if (accepted.onboardingId) {
          await navigate({ to: "/onboarding/$onboardingId", params: { onboardingId: accepted.onboardingId } });
          return;
        }
      } catch {
        /* ensureActor will claim by email */
      }
      await navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <LogoMark />
          <div>
            <p className="font-display text-xl font-semibold tracking-tight">TRONX</p>
            <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Invitation</p>
          </div>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          {q.isPending || isPending ? (
            <Skeleton className="h-40" />
          ) : !invite ? (
            <>
              <h1 className="font-display text-2xl font-semibold">Invitation not found</h1>
              <p className="mt-2 text-sm text-muted-foreground">Ask a CEO, director or manager to send a new one.</p>
              <Link to="/login" className="mt-6 inline-flex">
                <Button variant="secondary">Sign in</Button>
              </Link>
            </>
          ) : invite.expired ? (
            <>
              <h1 className="font-display text-2xl font-semibold">This invitation expired</h1>
              <p className="mt-2 text-sm text-muted-foreground">Ask {invite.orgName} to enroll you again.</p>
            </>
          ) : invite.accepted ? (
            <>
              <h1 className="font-display text-2xl font-semibold">Already accepted</h1>
              <p className="mt-2 text-sm text-muted-foreground">Sign in with {invite.email} to open your portal.</p>
              <Link to="/login" className="mt-6 inline-flex">
                <Button>Sign in</Button>
              </Link>
            </>
          ) : (
            <>
              <h1 className="font-display text-2xl font-semibold">Join {invite.orgName}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {invite.name} · {ROLE_LABEL[(invite.role as Role) ?? "employee"]} · {invite.employeeCode}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {invite.executive
                  ? "Your first two weeks open on the executive desk after you join — kickoff, access and follow-through. Create a password for " +
                    invite.email +
                    "."
                  : `Create a password for ${invite.email}. Nobody else sets it for you.`}
              </p>
              {user ? (
                <div className="mt-6 space-y-3">
                  {error ? <p className="text-sm text-danger">{error}</p> : null}
                  <Button className="w-full" onClick={() => accept.mutate()} disabled={accept.isPending}>
                    {accept.isPending ? "Opening…" : "Accept invitation"}
                  </Button>
                </div>
              ) : (
                <form className="mt-6 space-y-3" onSubmit={onCreate}>
                  <div className="space-y-1.5">
                    <Label htmlFor="password">Create password</Label>
                    <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
                  </div>
                  {error ? <p className="text-sm text-danger">{error}</p> : null}
                  <Button type="submit" className="w-full" disabled={busy || !authEnabled}>
                    {busy ? "Creating…" : "Create account and join"}
                  </Button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
