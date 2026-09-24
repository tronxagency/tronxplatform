import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Bot,
  Building2,
  CalendarDays,
  ClipboardCheck,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Shield,
  SquareCheckBig,
  Timer,
  Users,
  Files,
  ChartNoAxesCombined,
  Briefcase,
  Video,
  Target,
  IndianRupee,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UserButton } from "@/lib/auth/gates";
import { stopTimer } from "@/lib/server/fns";
import { canEnroll, hasPerm, isExecOffice, portalLabel } from "@/lib/permissions";
import { ROLE_LABEL } from "@/lib/types";
import { cn, firstName } from "@/lib/utils";
import { CommandPalette } from "./command-palette";
import { CreateProjectDialog, CreateTaskDialog } from "./create-dialogs";
import { CreateLeadDialog } from "./commercial-dialogs";
import { EnrollEmployeeDialog } from "./enroll-employee";
import { MeetDialog } from "./meet-dialog";
import { ThemeSwitcher } from "./theme-switcher";
import { Button } from "./ui/button";
import { PersonAvatar, Tip } from "./ui/display";
import { useWorkspace } from "./workspace";

export function AppShell() {
  const { me, org, unreadNotifications, runningTimer, liveMeetingCount, openOnboardingCount, overdueFollowUps } = useWorkspace();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [cmdOpen, setCmdOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [meetOpen, setMeetOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const qc = useQueryClient();
  const stop = useMutation({
    mutationFn: () => stopTimer(),
    onSuccess: async (r) => {
      toast.success(r.ok ? `Logged ${r.minutes}m` : "No timer running");
      await qc.invalidateQueries();
    },
  });

  useEffect(() => {
    setMobileNav(false);
  }, [pathname]);

  const showOnboarding = isExecOffice(me.role) || openOnboardingCount > 0;
  const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/my-work", label: "My Work", icon: Briefcase },
    { to: "/tasks", label: "Tasks", icon: SquareCheckBig },
    { to: "/projects", label: "Projects", icon: FolderKanban },
    ...(hasPerm(me.role, "lead.view") ? [{ to: "/leads", label: "Leads", icon: Target }] : []),
    ...(hasPerm(me.role, "finance.view") ? [{ to: "/finance", label: "Finance", icon: IndianRupee }] : []),
    { to: "/employees", label: "Employees", icon: Users },
    ...(showOnboarding ? [{ to: "/onboarding", label: "Onboarding", icon: ClipboardCheck }] : []),
    { to: "/teams", label: "Teams", icon: Building2 },
    { to: "/chat", label: "Chat", icon: MessageSquare },
    { to: "/meetings", label: "Meetings", icon: Video },
    { to: "/calendar", label: "Calendar", icon: CalendarDays },
    { to: "/files", label: "Files", icon: Files },
    { to: "/inbox", label: "Inbox", icon: Inbox },
    { to: "/analytics", label: "Analytics", icon: ChartNoAxesCombined },
    { to: "/ai", label: "TRONX AI", icon: Bot },
  ];

  const nav = (
    <nav className="flex flex-col gap-0.5 px-2">
      {navItems.map((item) => {
        const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        const Icon = item.icon;
        const badge =
          item.to === "/inbox" && unreadNotifications > 0
            ? unreadNotifications
            : item.to === "/meetings" && liveMeetingCount > 0
              ? liveMeetingCount
              : item.to === "/onboarding" && openOnboardingCount > 0
                ? openOnboardingCount
                : item.to === "/leads" && overdueFollowUps > 0
                  ? overdueFollowUps
                  : 0;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex h-10 items-center gap-3 rounded-xl px-3 text-sm transition-colors duration-150",
              active
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            <span className="flex-1">{item.label}</span>
            {badge ? (
              <span className="grid min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[10px] font-semibold text-brand-foreground tabular-nums">
                {badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-sidebar md:flex">
        <div className="flex h-14 items-center gap-2 px-4">
          <LogoMark />
          <div className="min-w-0">
            <p className="font-display text-sm font-semibold tracking-tight">TRONX</p>
            <p className="truncate text-[11px] text-muted-foreground">{org.name}</p>
          </div>
        </div>
        <div className="px-3 pb-3">
          <button
            type="button"
            onClick={() => setCmdOpen(true)}
            className="flex h-10 w-full items-center gap-2 rounded-xl border border-border bg-secondary px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Search className="size-4" />
            <span className="flex-1 text-left">Search</span>
            <kbd className="rounded-md border border-border px-1.5 text-[10px]">⌘K</kbd>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">{nav}</div>
        <div className="border-t border-border p-2">
          {hasPerm(me.role, "employee.update") || hasPerm(me.role, "admin.audit_logs") ? (
            <Link
              to="/admin"
              className={cn(
                "flex h-10 items-center gap-3 rounded-xl px-3 text-sm text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                pathname.startsWith("/admin") && "bg-accent text-foreground",
              )}
            >
              <Shield className="size-4" />
              Administration
            </Link>
          ) : null}
          <Link
            to="/settings"
            className={cn(
              "flex h-10 items-center gap-3 rounded-xl px-3 text-sm text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              pathname.startsWith("/settings") && "bg-accent text-foreground",
            )}
          >
            <Settings className="size-4" />
            Settings
          </Link>
        </div>
      </aside>

      <div className="md:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur-md sm:px-6">
          <button
            type="button"
            className="grid size-10 place-items-center rounded-lg text-muted-foreground hover:bg-accent md:hidden"
            onClick={() => setMobileNav((v) => !v)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <div className="hidden min-w-0 items-center gap-2 md:flex">
            <span className="text-sm text-muted-foreground">{portalLabel(me.role)}</span>
            <span className="text-muted-foreground/50">·</span>
            <span className="truncate text-sm text-muted-foreground">{ROLE_LABEL[me.role]}</span>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            {runningTimer ? (
              <Tip label="Stop timer">
                <button
                  type="button"
                  onClick={() => stop.mutate()}
                  className="flex h-9 items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3 text-xs font-medium text-brand"
                >
                  <Timer className="size-3.5" />
                  Tracking
                </button>
              </Tip>
            ) : null}
            {canEnroll(me.role) ? (
              <EnrollEmployeeDialog>
                <Button size="sm" variant="secondary" className="hidden sm:inline-flex">
                  Enroll
                </Button>
              </EnrollEmployeeDialog>
            ) : null}
            <CreateTaskDialog>
              <Button size="sm" className="hidden sm:inline-flex">
                <Plus className="size-4" />
                Task
              </Button>
            </CreateTaskDialog>
            {hasPerm(me.role, "lead.manage") ? (
              <CreateLeadDialog>
                <Button size="sm" variant="secondary" className="hidden xl:inline-flex">
                  Lead
                </Button>
              </CreateLeadDialog>
            ) : null}
            {hasPerm(me.role, "project.create") ? (
              <CreateProjectDialog>
                <Button size="sm" variant="secondary" className="hidden xl:inline-flex">
                  Project
                </Button>
              </CreateProjectDialog>
            ) : null}
            <MeetDialog open={meetOpen} onOpenChange={setMeetOpen}>
              <Button size="sm" variant="secondary" className="hidden sm:inline-flex">
                <Video className="size-4" />
                Meet
              </Button>
            </MeetDialog>
            <ThemeSwitcher />
            <Link
              to="/inbox"
              className="relative grid size-10 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Inbox"
            >
              <Bell className="size-4" />
              {unreadNotifications > 0 ? (
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-brand" />
              ) : null}
            </Link>
            <div className="flex items-center gap-2 pl-1 [&_img]:hidden [&_span.grid.h-8]:hidden [&_span.text-sm.font-medium]:hidden">
              <PersonAvatar person={me} />
              <p className="hidden truncate text-sm font-medium sm:block">{firstName(me.displayName)}</p>
              <UserButton />
            </div>
          </div>
        </header>

        {mobileNav ? (
          <div className="border-b border-border bg-sidebar p-2 md:hidden">{nav}</div>
        ) : null}

        <main className="px-3 py-5 pb-24 sm:px-6 sm:py-8 md:pb-10">
          <div className="page-enter mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-sidebar/95 backdrop-blur-md md:hidden">
        {[
          { to: "/", icon: LayoutDashboard, label: "Home" },
          { to: "/tasks", icon: SquareCheckBig, label: "Tasks" },
          { to: "/meetings", icon: Video, label: "Meet" },
          { to: "/chat", icon: MessageSquare, label: "Chat" },
          { to: "/inbox", icon: Inbox, label: "Inbox" },
        ].map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[10px]",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <CommandPalette
        open={cmdOpen}
        onOpenChange={setCmdOpen}
        onCreateTask={() => setTaskOpen(true)}
        onEnroll={() => setEnrollOpen(true)}
        onStartMeeting={() => setMeetOpen(true)}
      />
      <CreateTaskDialog open={taskOpen} onOpenChange={setTaskOpen} />
      {canEnroll(me.role) ? <EnrollEmployeeDialog open={enrollOpen} onOpenChange={setEnrollOpen} /> : null}
    </div>
  );
}

export function LogoMark() {
  return (
    <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
        <path fill="currentColor" d="M5 5h14v3H14v11h-4V8H5V5z" />
      </svg>
    </span>
  );
}
