import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Surface } from "@/components/marks";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/forms";
import { useWorkspace } from "@/components/workspace";
import { askTronxAi } from "@/lib/server/fns";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/ai")({ component: AiPage });

const PROMPTS_BY_ROLE: Record<string, string[]> = {
  ceo: [
    "Give me a company work summary.",
    "Which projects are behind schedule?",
    "Show me all blocked tasks.",
    "Who is overloaded this week?",
    "Summarize today's company activity.",
  ],
  founder: [
    "Give me a company work summary.",
    "Which projects are behind schedule?",
    "Show me all blocked tasks.",
    "Who is overloaded this week?",
    "Summarize today's company activity.",
  ],
  manager: [
    "Show my team's overdue tasks.",
    "Who is overloaded?",
    "Summarize the team's progress.",
    "What is blocking my team?",
    "What is due this week?",
  ],
  team_lead: [
    "Show my team's overdue tasks.",
    "Who on my team is overloaded?",
    "Summarize the team's progress.",
    "What is due today for my team?",
  ],
  employee: [
    "What are my tasks today?",
    "What is due tomorrow?",
    "Summarize my tasks.",
    "What am I blocked on?",
  ],
};

function AiPage() {
  const { me } = useWorkspace();
  const [prompt, setPrompt] = useState("");
  const [history, setHistory] = useState<{ q: string; a: string }[]>([]);
  const ask = useMutation({
    mutationFn: (q: string) => askTronxAi({ data: { prompt: q } }),
    onSuccess: (res, q) => {
      const a = res.ok ? res.text : res.error;
      setHistory((h) => [...h, { q, a }]);
      setPrompt("");
    },
  });
  const prompts = PROMPTS_BY_ROLE[me.role] ?? PROMPTS_BY_ROLE.employee;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Assistant"
        title="TRONX AI"
        description="Ask about projects, load, blockers and deadlines. Answers stay inside this workspace."
      />
      <div className="flex flex-wrap gap-2">
        {prompts.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              setPrompt(p);
              ask.mutate(p);
            }}
            className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            {p}
          </button>
        ))}
      </div>
      <Surface className="p-5">
        <div className="space-y-5">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ask about your work, your team, or the company — answers stay inside this workspace and respect your role.
            </p>
          ) : (
            history.map((turn, i) => (
              <div key={i} className="space-y-2">
                <p className="text-sm font-medium">{turn.q}</p>
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{turn.a}</div>
              </div>
            ))
          )}
          {ask.isPending ? <p className="text-sm text-brand">Thinking…</p> : null}
        </div>
        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (prompt.trim()) ask.mutate(prompt.trim());
          }}
        >
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask TRONX AI…"
            className={cn("min-h-24")}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={ask.isPending || !prompt.trim()}>
              {ask.isPending ? "Asking…" : "Ask"}
            </Button>
          </div>
        </form>
      </Surface>
    </div>
  );
}
