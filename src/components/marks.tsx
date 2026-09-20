import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  PRIORITY_LABEL,
  STATUS_LABEL,
  type Priority,
  type Profile,
  type Task,
  type TaskStatus,
} from "@/lib/types";
import { cn, formatShortDate } from "@/lib/utils";
import { Badge, PersonAvatar } from "./ui/display";

export function StatusBadge({ status }: { status: TaskStatus }) {
  const tone: Record<TaskStatus, "muted" | "brand" | "ok" | "warn" | "danger" | "info"> = {
    backlog: "muted",
    todo: "info",
    in_progress: "brand",
    in_review: "warn",
    changes_requested: "danger",
    completed: "ok",
    blocked: "danger",
  };
  return <Badge tone={tone[status]}>{STATUS_LABEL[status]}</Badge>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const tone = priority === "urgent" || priority === "high" ? "danger" : priority === "medium" ? "warn" : "muted";
  return <Badge tone={tone}>{PRIORITY_LABEL[priority]}</Badge>;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "danger" | "ok" | "brand";
}) {
  const color =
    tone === "danger"
      ? "text-danger"
      : tone === "ok"
        ? "text-ok"
        : tone === "brand"
          ? "text-brand"
          : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">{label}</p>
      <p className={cn("mt-3 font-display text-3xl font-semibold tabular-nums tracking-tight", color)}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-border px-6 py-16 text-center">
      <div className="size-10 rounded-full border border-border bg-secondary" />
      <h3 className="mt-4 font-display text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function TaskRow({
  task,
  people,
  compact,
}: {
  task: Task;
  people: Profile[];
  compact?: boolean;
}) {
  const assignee = people.find((p) => p.id === task.assigneeId);
  return (
    <Link
      to="/tasks/$taskId"
      params={{ taskId: task.id }}
      className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 transition-colors duration-150 hover:border-border hover:bg-accent/70"
    >
      <span
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          task.blocked
            ? "bg-danger"
            : task.status === "completed"
              ? "bg-ok"
              : task.priority === "urgent"
                ? "bg-danger"
                : "bg-brand",
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-foreground group-hover:text-foreground">{task.title}</p>
        {!compact ? (
          <p className="truncate text-xs text-muted-foreground">
            {task.blocked ? `Blocked · ${task.blockedReason}` : STATUS_LABEL[task.status]}
          </p>
        ) : null}
      </div>
      <StatusBadge status={task.status} />
      <span className="hidden w-16 text-right text-xs text-muted-foreground sm:block">
        {formatShortDate(task.dueDate)}
      </span>
      <PersonAvatar person={assignee} size="sm" />
    </Link>
  );
}

export function Surface({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card shadow-soft", className)}>
      {children}
    </div>
  );
}
