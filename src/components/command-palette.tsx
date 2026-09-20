import { Command } from "cmdk";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  CalendarDays,
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  SquareCheckBig,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { searchAll } from "@/lib/server/fns";
import { canEnroll, hasPerm } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { useWorkspace } from "./workspace";

export function CommandPalette({
  open,
  onOpenChange,
  onCreateTask,
  onEnroll,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreateTask: () => void;
  onEnroll?: () => void;
}) {
  const navigate = useNavigate();
  const { me } = useWorkspace();
  const [q, setQ] = useState("");
  const results = useQuery({
    queryKey: ["search", q],
    queryFn: () => searchAll({ data: q }),
    enabled: open && q.trim().length > 0,
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  function go(href: string) {
    onOpenChange(false);
    void navigate({ to: href });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        className="absolute inset-0 bg-background/70"
        aria-label="Close search"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative mx-auto mt-[12vh] w-[min(100%-1.5rem,36rem)] overflow-hidden rounded-2xl border border-border bg-popover shadow-soft">
        <Command className="text-foreground" shouldFilter={q.trim().length === 0}>
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="size-4 text-muted-foreground" />
            <Command.Input
              value={q}
              onValueChange={setQ}
              placeholder="Search people, projects, tasks…"
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
              ESC
            </kbd>
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="px-3 py-8 text-center text-sm text-muted-foreground">
              Nothing matches.
            </Command.Empty>
            <Command.Group heading="Actions" className="mb-2 text-[11px] text-muted-foreground">
              <Item icon={Plus} label="Create task" onSelect={() => { onOpenChange(false); onCreateTask(); }} />
              {canEnroll(me.role) ? (
                <Item
                  icon={UserPlus}
                  label="Enroll employee"
                  onSelect={() => {
                    onOpenChange(false);
                    onEnroll?.();
                  }}
                />
              ) : null}
              {hasPerm(me.role, "project.create") ? (
                <Item icon={FolderKanban} label="Create project" onSelect={() => go("/projects")} />
              ) : null}
              <Item icon={LayoutDashboard} label="Dashboard" onSelect={() => go("/")} />
              <Item icon={Users} label="Employees" onSelect={() => go("/employees")} />
              <Item icon={FolderKanban} label="Projects" onSelect={() => go("/projects")} />
              <Item icon={SquareCheckBig} label="Tasks" onSelect={() => go("/tasks")} />
              <Item icon={MessageSquare} label="Chat" onSelect={() => go("/chat")} />
              <Item icon={CalendarDays} label="Calendar" onSelect={() => go("/calendar")} />
              <Item icon={Bell} label="Inbox" onSelect={() => go("/inbox")} />
              <Item icon={Sparkles} label="TRONX AI" onSelect={() => go("/ai")} />
            </Command.Group>
            {(results.data ?? []).length > 0 ? (
              <Command.Group heading="Results" className="text-[11px] text-muted-foreground">
                {(results.data ?? []).map((hit) => (
                  <Command.Item
                    key={`${hit.kind}-${hit.id}`}
                    value={`${hit.title} ${hit.subtitle}`}
                    onSelect={() => go(hit.href)}
                    className="cmdk-item flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm"
                  >
                    <span className="w-14 shrink-0 text-[10px] tracking-wide text-muted-foreground uppercase">
                      {hit.kind}
                    </span>
                    <span className="min-w-0 truncate">{hit.title}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            ) : null}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

function Item({
  icon: Icon,
  label,
  onSelect,
}: {
  icon: typeof Search;
  label: string;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      value={label}
      onSelect={onSelect}
      className={cn("cmdk-item flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm")}
    >
      <Icon className="size-4 text-muted-foreground" />
      {label}
    </Command.Item>
  );
}
