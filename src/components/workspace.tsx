import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, type ReactNode } from "react";
import { getWorkspace } from "@/lib/server/fns";
import type { WorkspacePayload } from "@/lib/types";
import { UserButton } from "@/lib/auth/gates";
import { Skeleton } from "./ui/display";

const WorkspaceContext = createContext<WorkspacePayload | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const q = useQuery({
    queryKey: ["workspace"],
    queryFn: () => getWorkspace(),
  });
  if (q.isPending) {
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
          <Skeleton className="mt-6 h-8 w-48" />
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        </div>
      </div>
    );
  }
  if (q.isError || !q.data) {
    return (
      <div className="grid min-h-dvh place-items-center p-6 text-center">
        <div>
          <p className="font-display text-lg font-semibold">Couldn’t load workspace</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            If you just created an account, you need an enrollment invitation from a CEO, director or manager. Sign in with the enrolled email.
          </p>
          <div className="mt-4 flex justify-center">
            <UserButton />
          </div>
        </div>
      </div>
    );
  }
  return <WorkspaceContext.Provider value={q.data}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspacePayload {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace requires WorkspaceProvider");
  return ctx;
}

export function usePerson(id: string | null | undefined) {
  const { members } = useWorkspace();
  return members.find((m) => m.id === id);
}
