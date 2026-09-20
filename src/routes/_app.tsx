import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shell";
import { WorkspaceProvider } from "@/components/workspace";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Skeleton } from "@/components/ui/display";

export const Route = createFileRoute("/_app")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <div className="flex min-h-dvh bg-background">
        <div className="hidden w-60 border-r border-border p-4 md:block">
          <Skeleton className="h-6 w-24" />
          <div className="mt-8 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-6">
          <p className="text-sm text-muted-foreground">Loading TRONX Workspace</p>
          <Skeleton className="mt-6 h-8 w-56" />
        </div>
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  return (
    <WorkspaceProvider>
      <AppShell />
    </WorkspaceProvider>
  );
}
