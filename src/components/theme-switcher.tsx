import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "./theme";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/overlay";
import { Tip } from "./ui/display";
import { cn } from "@/lib/utils";
import type { ThemeMode } from "@/lib/types";

export function ThemeSwitcher() {
  const { theme, setTheme, resolved } = useTheme();
  const Icon = resolved === "light" ? Sun : Moon;
  return (
    <DropdownMenu>
      <Tip label="Appearance">
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Change theme"
          >
            <Icon className="size-4" />
          </button>
        </DropdownMenuTrigger>
      </Tip>
      <DropdownMenuContent align="end">
        {(
          [
            { id: "light", label: "Light", icon: Sun },
            { id: "dark", label: "Dark", icon: Moon },
            { id: "system", label: "System", icon: Monitor },
          ] as const
        ).map((opt) => (
          <DropdownMenuItem
            key={opt.id}
            onSelect={() => setTheme(opt.id as ThemeMode)}
            className={cn(theme === opt.id && "bg-accent")}
          >
            <opt.icon className="size-4" />
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
