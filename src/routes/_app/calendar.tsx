import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { addDays, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { useMemo, useState } from "react";
import { PageHeader, Surface } from "@/components/marks";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/display";
import { listEvents } from "@/lib/server/fns";
import { cn, dayKey } from "@/lib/utils";

export const Route = createFileRoute("/_app/calendar")({ component: CalendarPage });

function CalendarPage() {
  const q = useQuery({ queryKey: ["events"], queryFn: () => listEvents() });
  const [cursor, setCursor] = useState(() => new Date());
  const [mode, setMode] = useState<"month" | "week" | "day">("month");

  const days = useMemo(() => {
    if (mode === "day") return [cursor];
    if (mode === "week") {
      return eachDayOfInterval({ start: startOfWeek(cursor, { weekStartsOn: 1 }), end: endOfWeek(cursor, { weekStartsOn: 1 }) });
    }
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 }),
      end: endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 }),
    });
  }, [cursor, mode]);

  const itemsByDay = useMemo(() => {
    const map = new Map<string, { title: string; href?: string; kind: string }[]>();
    const push = (key: string, item: { title: string; href?: string; kind: string }) => {
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    };
    for (const e of q.data?.events ?? []) {
      push(e.startsAt.slice(0, 10), {
        title: e.title,
        kind: e.type === "meeting" || e.meetingId ? "meeting" : e.type,
        href: e.meetingId ? `/meetings/${e.meetingId}` : e.projectId ? `/projects/${e.projectId}` : undefined,
      });
    }
    for (const m of q.data?.meetings ?? []) {
      push(m.startsAt.slice(0, 10), { title: m.title, kind: "meeting", href: `/meetings/${m.id}` });
    }
    for (const d of q.data?.deadlines ?? []) {
      push(d.date, { title: d.title, kind: "deadline", href: `/tasks/${d.id}` });
    }
    return map;
  }, [q.data]);

  const todayMeetings = [
    ...(q.data?.events ?? []).filter((e) => e.startsAt.slice(0, 10) === dayKey(new Date())),
    ...(q.data?.meetings ?? []).filter((e) => e.startsAt.slice(0, 10) === dayKey(new Date())),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Schedule"
        title="Calendar"
        description="Tasks, milestones and meetings on one grid."
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setCursor(addDays(cursor, mode === "month" ? -30 : mode === "week" ? -7 : -1))}>
              Prev
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setCursor(new Date())}>
              Today
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setCursor(addDays(cursor, mode === "month" ? 30 : mode === "week" ? 7 : 1))}>
              Next
            </Button>
            <Button size="sm" variant={mode === "month" ? "default" : "secondary"} onClick={() => setMode("month")}>
              Month
            </Button>
            <Button size="sm" variant={mode === "week" ? "default" : "secondary"} onClick={() => setMode("week")}>
              Week
            </Button>
            <Button size="sm" variant={mode === "day" ? "default" : "secondary"} onClick={() => setMode("day")}>
              Day
            </Button>
          </div>
        }
      />
      {q.isPending ? (
        <Skeleton className="h-96" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <Surface className="p-3">
            <p className="px-2 pb-3 font-display text-sm font-semibold">{format(cursor, "MMMM yyyy")}</p>
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((d) => {
                const key = dayKey(d);
                const items = itemsByDay.get(key) ?? [];
                const isToday = key === dayKey(new Date());
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => {
                      setCursor(d);
                      setMode("day");
                    }}
                    className={cn(
                      "min-h-20 rounded-xl border border-transparent p-1.5 text-left",
                      !isSameMonth(d, cursor) && mode === "month" && "opacity-40",
                      isToday && "border-brand/40 bg-brand/10",
                    )}
                  >
                    <span className="text-xs tabular-nums">{format(d, "d")}</span>
                    <div className="mt-1 space-y-1">
                      {items.slice(0, 3).map((it, i) =>
                        it.href ? (
                          <a key={i} href={it.href} className="block truncate rounded bg-accent px-1 text-[10px]" onClick={(e) => e.stopPropagation()}>
                            {it.title}
                          </a>
                        ) : (
                          <p key={i} className="truncate rounded bg-accent px-1 text-[10px]">
                            {it.title}
                          </p>
                        ),
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Surface>
          <Surface className="p-4">
            <h2 className="font-display text-sm font-semibold">Today</h2>
            <ul className="mt-3 space-y-3">
              {todayMeetings.length === 0 ? (
                <li className="text-sm text-muted-foreground">No meetings on the calendar.</li>
              ) : (
                todayMeetings.map((e) => (
                  <li key={e.id} className="text-sm">
                    {"meetingId" in e && e.meetingId ? (
                      <a href={`/meetings/${e.meetingId}`} className="hover:underline">{e.title}</a>
                    ) : "scope" in e ? (
                      <a href={`/meetings/${e.id}`} className="hover:underline">{e.title}</a>
                    ) : (
                      <p>{e.title}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(e.startsAt), "HH:mm")}
                      {"endsAt" in e && e.endsAt ? ` – ${format(new Date(e.endsAt), "HH:mm")}` : ""}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </Surface>
        </div>
      )}
    </div>
  );
}
