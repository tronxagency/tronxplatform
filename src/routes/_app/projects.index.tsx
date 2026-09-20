import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CreateProjectDialog } from "@/components/create-dialogs";
import { EmptyState, PageHeader, Surface } from "@/components/marks";
import { Button } from "@/components/ui/button";
import { PersonAvatar, ProgressRail, Skeleton } from "@/components/ui/display";
import { useWorkspace } from "@/components/workspace";
import { hasPerm } from "@/lib/permissions";
import { listProjects } from "@/lib/server/fns";
import { formatShortDate } from "@/lib/utils";

export const Route = createFileRoute("/_app/projects/")({ component: ProjectsPage });

function ProjectsPage() {
  const { members, me } = useWorkspace();
  const q = useQuery({ queryKey: ["projects"], queryFn: () => listProjects() });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Portfolio"
        title="Projects"
        description="Every active bet, with progress computed from real work."
        actions={
          hasPerm(me.role, "project.create") ? (
            <CreateProjectDialog>
              <Button>New project</Button>
            </CreateProjectDialog>
          ) : null
        }
      />
      {q.isPending ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : !q.data?.length ? (
        <EmptyState title="No projects" description="Create a project to group tasks, files and chat." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {q.data.map((p) => {
            const owner = members.find((m) => m.id === p.ownerId);
            return (
              <Link key={p.id} to="/projects/$projectId" params={{ projectId: p.id }}>
                <Surface className="h-full p-5 transition-colors duration-150 hover:bg-accent/40">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-lg font-semibold tracking-tight">{p.name}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                    </div>
                    <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] text-muted-foreground capitalize">
                      {p.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="mt-6">
                    <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                      <span>
                        {p.taskDone}/{p.taskTotal} complete
                      </span>
                      <span className="tabular-nums">{p.progress}%</span>
                    </div>
                    <ProgressRail value={p.progress} />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex -space-x-1.5">
                      {p.memberIds.slice(0, 5).map((id) => (
                        <PersonAvatar key={id} person={members.find((m) => m.id === id)} size="sm" className="ring-2 ring-card" />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">Due {formatShortDate(p.dueDate)}</span>
                    {owner ? <span className="sr-only">Owner {owner.displayName}</span> : null}
                  </div>
                </Surface>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
