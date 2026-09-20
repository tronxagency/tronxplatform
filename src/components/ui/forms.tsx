import type { ComponentProps, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-lg border border-input bg-secondary px-3 text-sm text-foreground placeholder:text-muted-foreground/80 transition-[box-shadow,border-color] duration-150 focus-visible:border-ring/50 focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-xl border border-input bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/80 transition-[box-shadow,border-color] duration-150 focus-visible:border-ring/50 focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-lg border border-input bg-secondary px-3 text-sm text-foreground transition-[box-shadow,border-color] duration-150 focus-visible:border-ring/50 focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return (
    <label className={cn("text-xs font-medium text-muted-foreground", className)} {...props} />
  );
}
