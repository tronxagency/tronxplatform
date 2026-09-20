import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { EmptyState, PageHeader, Surface } from "@/components/marks";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/display";
import { listNotifications, markNotificationsRead } from "@/lib/server/fns";
import { cn, parseAppHref, relativeTime } from "@/lib/utils";

export const Route = createFileRoute("/_app/inbox")({ component: InboxPage });

function InboxPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["notifications"], queryFn: () => listNotifications() });
  const mark = useMutation({
    mutationFn: (id?: string) => markNotificationsRead({ data: id }),
    onSuccess: () => qc.invalidateQueries(),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Alerts"
        title="Inbox"
        description="Assignments, mentions, reviews and deadlines."
        actions={
          <Button variant="secondary" size="sm" onClick={() => mark.mutate(undefined)}>
            Mark all read
          </Button>
        }
      />
      {q.isPending ? (
        <Skeleton className="h-64" />
      ) : !q.data?.length ? (
        <EmptyState title="All clear" description="When work needs you, it will land here." />
      ) : (
        <Surface className="divide-y divide-border">
          {q.data.map((n) => (
            <NoticeLink
              key={n.id}
              href={n.href}
              onOpen={() => {
                if (!n.read) mark.mutate(n.id);
              }}
              className={cn("block px-4 py-3 transition-colors hover:bg-accent/50", !n.read && "bg-brand/5")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground">{relativeTime(n.createdAt)}</span>
              </div>
            </NoticeLink>
          ))}
        </Surface>
      )}
    </div>
  );
}

function NoticeLink({
  href,
  onOpen,
  className,
  children,
}: {
  href: string;
  onOpen: () => void;
  className?: string;
  children: ReactNode;
}) {
  const parsed = parseAppHref(href);
  const props = { onClick: onOpen, className };
  if (parsed.kind === "task") {
    return (
      <Link to="/tasks/$taskId" params={{ taskId: parsed.id }} {...props}>
        {children}
      </Link>
    );
  }
  if (parsed.kind === "project") {
    return (
      <Link to="/projects/$projectId" params={{ projectId: parsed.id }} {...props}>
        {children}
      </Link>
    );
  }
  if (parsed.kind === "employee") {
    return (
      <Link to="/employees/$employeeId" params={{ employeeId: parsed.id }} {...props}>
        {children}
      </Link>
    );
  }
  if (parsed.kind === "chat") {
    return (
      <Link to="/chat" search={{ channel: parsed.channel }} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <Link to="/" {...props}>
      {children}
    </Link>
  );
}
