import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ComponentProps, ReactNode } from "react";
import { AVATAR_CLASS, type Profile } from "@/lib/types";
import { cn, initials } from "@/lib/utils";

export function Badge({
  className,
  tone = "muted",
  children,
}: {
  className?: string;
  tone?: "muted" | "brand" | "ok" | "warn" | "danger" | "info";
  children: ReactNode;
}) {
  const tones = {
    muted: "bg-accent text-muted-foreground",
    brand: "bg-brand/15 text-brand",
    ok: "bg-ok/15 text-ok",
    warn: "bg-warn/15 text-warn",
    danger: "bg-danger/15 text-danger",
    info: "bg-info/15 text-info",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function PersonAvatar({
  person,
  size = "md",
  className,
}: {
  person?: Pick<Profile, "displayName" | "avatarKey"> | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = { sm: "size-6 text-[9px]", md: "size-8 text-[10px]", lg: "size-10 text-xs" };
  const name = person?.displayName ?? "?";
  return (
    <span
      title={name}
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full font-semibold text-primary-foreground",
        AVATAR_CLASS[person?.avatarKey ?? "slate"] ?? "bg-zinc-600",
        sizes[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

export function ProgressRail({ value, className }: { value: number; className?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("progress-bar h-1.5 overflow-hidden rounded-full", className)}>
      <div
        className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-accent", className)} />;
}

export function Separator({
  className,
  orientation = "horizontal",
}: {
  className?: string;
  orientation?: "horizontal" | "vertical";
}) {
  return (
    <SeparatorPrimitive.Root
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
    />
  );
}

export function ScrollArea({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <ScrollAreaPrimitive.Root className={cn("overflow-hidden", className)}>
      <ScrollAreaPrimitive.Viewport className="h-full w-full">{children}</ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.Scrollbar
        orientation="vertical"
        className="flex w-2 touch-none p-0.5"
      >
        <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-foreground/15" />
      </ScrollAreaPrimitive.Scrollbar>
    </ScrollAreaPrimitive.Root>
  );
}

export const Tabs = TabsPrimitive.Root;
export const TabsList = ({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) => (
  <TabsPrimitive.List
    className={cn("inline-flex h-10 items-center gap-1 rounded-xl bg-secondary p-1", className)}
    {...props}
  />
);
export const TabsTrigger = ({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) => (
  <TabsPrimitive.Trigger
    className={cn(
      "inline-flex h-8 items-center rounded-lg px-3 text-sm text-muted-foreground transition-colors duration-150 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-soft",
      className,
    )}
    {...props}
  />
);
export const TabsContent = TabsPrimitive.Content;

export function TooltipProvider({ children }: { children: ReactNode }) {
  return (
    <TooltipPrimitive.Provider delayDuration={250}>{children}</TooltipPrimitive.Provider>
  );
}

export function Tip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          sideOffset={6}
          className="z-50 rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-soft"
        >
          {label}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
