import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { createFinance, createLead } from "@/lib/server/fns";
import { hasPerm } from "@/lib/permissions";
import {
  EXPENSE_CATEGORIES,
  FINANCE_CATEGORY_LABEL,
  LEAD_SOURCES,
  LEAD_SOURCE_LABEL,
  LEAD_STAGES,
  LEAD_STAGE_LABEL,
  LEAD_TEMPS,
  LEAD_TEMP_LABEL,
  REVENUE_CATEGORIES,
  type FinanceKind,
} from "@/lib/types";
import { Button } from "./ui/button";
import { Input, Label, Select, Textarea } from "./ui/forms";
import { Dialog, DialogContent, DialogTrigger } from "./ui/overlay";
import { useWorkspace } from "./workspace";

export function CreateLeadDialog({ children }: { children?: ReactNode }) {
  const { members, me } = useWorkspace();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const owners = members.filter(
    (m) => m.status === "active" && ["ceo", "founder", "executive_assistant", "manager"].includes(m.role),
  );
  const mut = useMutation({
    mutationFn: (payload: Parameters<typeof createLead>[0] extends { data: infer D } ? D : never) =>
      createLead({ data: payload }),
    onSuccess: async (res) => {
      toast.success("Lead opened");
      setOpen(false);
      await qc.invalidateQueries();
      if (res.id) await navigate({ to: "/leads/$leadId", params: { leadId: res.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    mut.mutate({
      name: String(fd.get("name") ?? ""),
      company: String(fd.get("company") ?? ""),
      email: String(fd.get("email") ?? "") || undefined,
      phone: String(fd.get("phone") ?? "") || undefined,
      title: String(fd.get("title") ?? ""),
      source: String(fd.get("source") || "inbound"),
      stage: String(fd.get("stage") || "new"),
      temperature: String(fd.get("temperature") || "warm"),
      valueInr: Number(fd.get("valueInr") || 0),
      ownerId: String(fd.get("ownerId") || me.id),
      nextFollowUp: String(fd.get("nextFollowUp") || "") || undefined,
      city: String(fd.get("city") ?? "") || undefined,
      industry: String(fd.get("industry") ?? "") || undefined,
      notes: String(fd.get("notes") ?? ""),
    });
  }

  if (!hasPerm(me.role, "lead.manage")) return children ? <>{children}</> : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent title="New lead" className="w-[min(100%-1.5rem,36rem)]">
        <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={onSubmit}>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="lead-name">Contact</Label>
            <Input id="lead-name" name="name" required placeholder="Priya Menon" autoFocus />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="lead-company">Company</Label>
            <Input id="lead-company" name="company" placeholder="Coastal Estates" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lead-email">Email</Label>
            <Input id="lead-email" name="email" type="email" placeholder="hello@company.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lead-phone">Phone</Label>
            <Input id="lead-phone" name="phone" placeholder="+91 …" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lead-title">Title</Label>
            <Input id="lead-title" name="title" placeholder="Head of Sales" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lead-value">Deal value (₹)</Label>
            <Input id="lead-value" name="valueInr" type="number" min={0} step={1000} placeholder="480000" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lead-source">Source</Label>
            <Select id="lead-source" name="source" defaultValue="inbound">
              {LEAD_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {LEAD_SOURCE_LABEL[s]}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lead-stage">Stage</Label>
            <Select id="lead-stage" name="stage" defaultValue="new">
              {LEAD_STAGES.filter((s) => s !== "won" && s !== "lost").map((s) => (
                <option key={s} value={s}>
                  {LEAD_STAGE_LABEL[s]}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lead-temp">Temperature</Label>
            <Select id="lead-temp" name="temperature" defaultValue="warm">
              {LEAD_TEMPS.map((s) => (
                <option key={s} value={s}>
                  {LEAD_TEMP_LABEL[s]}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lead-owner">Owner</Label>
            <Select id="lead-owner" name="ownerId" defaultValue={me.id}>
              {owners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.displayName}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lead-follow">Next follow-up</Label>
            <Input id="lead-follow" name="nextFollowUp" type="date" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lead-city">City</Label>
            <Input id="lead-city" name="city" placeholder="Bengaluru" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="lead-industry">Industry</Label>
            <Input id="lead-industry" name="industry" placeholder="Healthcare" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="lead-notes">Notes</Label>
            <Textarea id="lead-notes" name="notes" placeholder="What they need, timeline, politics" />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2 pt-1">
            <Button type="submit" disabled={mut.isPending}>
              {mut.isPending ? "Opening…" : "Open lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PostFinanceDialog({
  children,
  defaultKind = "expense",
  leadId,
}: {
  children?: ReactNode;
  defaultKind?: FinanceKind;
  leadId?: string;
}) {
  const { me } = useWorkspace();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<FinanceKind>(defaultKind);
  const cats = kind === "revenue" ? REVENUE_CATEGORIES : EXPENSE_CATEGORIES;
  const mut = useMutation({
    mutationFn: (payload: Parameters<typeof createFinance>[0] extends { data: infer D } ? D : never) =>
      createFinance({ data: payload }),
    onSuccess: async () => {
      toast.success(kind === "revenue" ? "Revenue posted" : "Cost posted");
      setOpen(false);
      await qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    mut.mutate({
      kind,
      category: String(fd.get("category") || "other"),
      amountInr: Number(fd.get("amountInr") || 0),
      entryDate: String(fd.get("entryDate") || new Date().toISOString().slice(0, 10)),
      title: String(fd.get("title") ?? ""),
      notes: String(fd.get("notes") ?? ""),
      vendor: String(fd.get("vendor") ?? "") || undefined,
      leadId: leadId || undefined,
      status: "posted",
    });
  }

  if (!hasPerm(me.role, "finance.manage")) return children ? <>{children}</> : null;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) setKind(defaultKind);
      }}
    >
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent title={kind === "revenue" ? "Post revenue" : "Post a cost"}>
        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-secondary p-1">
            {(["revenue", "expense"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={`h-9 rounded-lg text-sm ${kind === k ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"}`}
              >
                {k === "revenue" ? "Revenue" : "Cost"}
              </button>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fin-title">Title</Label>
            <Input id="fin-title" name="title" required placeholder={kind === "revenue" ? "Milestone invoice" : "Payroll, tools, vendor"} autoFocus />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="fin-amount">Amount (₹)</Label>
              <Input id="fin-amount" name="amountInr" type="number" min={1} step={100} required placeholder="45000" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fin-date">Date</Label>
              <Input id="fin-date" name="entryDate" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fin-cat">Category</Label>
              <Select id="fin-cat" name="category" key={kind} defaultValue={cats[0]}>
                {cats.map((c) => (
                  <option key={c} value={c}>
                    {FINANCE_CATEGORY_LABEL[c] ?? c}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fin-vendor">Vendor / client</Label>
              <Input id="fin-vendor" name="vendor" placeholder="Optional" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fin-notes">Notes</Label>
            <Textarea id="fin-notes" name="notes" placeholder="Invoice number, period, context" />
          </div>
          <div className="flex justify-end pt-1">
            <Button type="submit" disabled={mut.isPending}>
              {mut.isPending ? "Posting…" : "Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
