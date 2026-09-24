import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { PageHeader, Surface } from "@/components/marks";
import { MeetButton } from "@/components/meet-dialog";
import { Button } from "@/components/ui/button";
import { PersonAvatar } from "@/components/ui/display";
import { Input, Label, Select, Textarea } from "@/components/ui/forms";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/overlay";
import { useWorkspace } from "@/components/workspace";
import { addTeamMember, createDepartment, createTeam } from "@/lib/server/fns";
import { hasPerm } from "@/lib/permissions";
import { ROLE_LABEL } from "@/lib/types";

export const Route = createFileRoute("/_app/teams")({ component: TeamsPage });

function TeamsPage() {
  const { me, teams, members, departments } = useWorkspace();
  const qc = useQueryClient();
  const canDept = hasPerm(me.role, "department.create");
  const canTeam = hasPerm(me.role, "team.create");
  const canManage = hasPerm(me.role, "team.manage");
  const add = useMutation({
    mutationFn: (data: { teamId: string; profileId: string }) => addTeamMember({ data }),
    onSuccess: async () => {
      toast.success("Added to team");
      await qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Organization"
        title="Departments & teams"
        description="How the company is structured — departments, teams and the people in them."
        actions={
          <div className="flex gap-2">
            {canDept ? <CreateDepartmentDialog /> : null}
            {canTeam ? <CreateTeamDialog /> : null}
          </div>
        }
      />
      <section className="space-y-3">
        <h2 className="font-display text-sm font-semibold tracking-tight">Departments</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {departments.map((d) => {
            const head = members.find((m) => m.id === d.headId);
            const count = members.filter((m) => m.departmentId === d.id).length;
            return (
              <Surface key={d.id} className="p-4">
                <p className="font-display font-semibold">{d.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{d.description}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {head ? `Head · ${head.displayName}` : "No head"} · {count} people
                </p>
              </Surface>
            );
          })}
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="font-display text-sm font-semibold tracking-tight">Teams</h2>
        <div className="grid gap-3 lg:grid-cols-3">
          {teams.map((t) => {
            const lead = members.find((m) => m.id === t.leadId);
            const dept = departments.find((d) => d.id === t.departmentId);
            const available = members.filter((m) => m.status === "active" && !t.memberIds.includes(m.id));
            return (
              <Surface key={t.id} className="p-5">
                <p className="font-display text-lg font-semibold">{t.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {dept?.name ?? "No department"}
                  {lead ? ` · Lead ${lead.displayName}` : ""}
                </p>
                <div className="mt-4 space-y-2">
                  {t.memberIds.map((id) => {
                    const p = members.find((m) => m.id === id);
                    if (!p) return null;
                    return (
                      <Link key={id} to="/employees/$employeeId" params={{ employeeId: id }} className="flex items-center gap-2">
                        <PersonAvatar person={p} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-sm">{p.displayName}</p>
                          <p className="text-xs text-muted-foreground">{p.title}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                {canManage && available.length > 0 ? (
                  <select
                    className="mt-4 h-9 w-full rounded-lg border border-input bg-secondary px-2 text-xs"
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) add.mutate({ teamId: t.id, profileId: e.target.value });
                      e.target.value = "";
                    }}
                  >
                    <option value="">Add member…</option>
                    {available.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.displayName}
                      </option>
                    ))}
                  </select>
                ) : null}
                <div className="mt-4 flex gap-2">
                  <MeetButton label="Meet team" defaultScope="team" teamId={t.id} title={`${t.name} sync`} />
                </div>
              </Surface>
            );
          })}
        </div>
      </section>
      <Surface className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs tracking-wide text-muted-foreground uppercase">
            <tr className="border-b border-border">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Department</th>
            </tr>
          </thead>
          <tbody>
            {members.filter((m) => m.status !== "disabled").map((m) => (
              <tr key={m.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <Link to="/employees/$employeeId" params={{ employeeId: m.id }} className="flex items-center gap-2 hover:underline">
                    <PersonAvatar person={m} size="sm" />
                    {m.displayName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{m.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{ROLE_LABEL[m.role]}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {departments.find((d) => d.id === m.departmentId)?.name ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Surface>
    </div>
  );
}

function CreateDepartmentDialog() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const mut = useMutation({
    mutationFn: (data: { name: string; description?: string }) => createDepartment({ data }),
    onSuccess: async () => {
      toast.success("Department created");
      setOpen(false);
      await qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    mut.mutate({ name: String(fd.get("name") ?? ""), description: String(fd.get("description") ?? "") });
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          New department
        </Button>
      </DialogTrigger>
      <DialogContent title="New department">
        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="dept-name">Name</Label>
            <Input id="dept-name" name="name" required placeholder="Design" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dept-desc">Description</Label>
            <Textarea id="dept-desc" name="description" />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={mut.isPending}>
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CreateTeamDialog() {
  const { departments, members } = useWorkspace();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const mut = useMutation({
    mutationFn: (data: { name: string; description?: string; departmentId?: string; leadId?: string }) =>
      createTeam({ data }),
    onSuccess: async () => {
      toast.success("Team created");
      setOpen(false);
      await qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    mut.mutate({
      name: String(fd.get("name") ?? ""),
      description: String(fd.get("description") ?? ""),
      departmentId: String(fd.get("departmentId") || "") || undefined,
      leadId: String(fd.get("leadId") || "") || undefined,
    });
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">New team</Button>
      </DialogTrigger>
      <DialogContent title="New team">
        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="team-name">Name</Label>
            <Input id="team-name" name="name" required placeholder="MERN Team" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="team-desc">Description</Label>
            <Textarea id="team-desc" name="description" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="team-dept">Department</Label>
            <Select id="team-dept" name="departmentId" defaultValue="">
              <option value="">Unassigned</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="team-lead">Lead</Label>
            <Select id="team-lead" name="leadId" defaultValue="">
              <option value="">Unassigned</option>
              {members
                .filter((m) => m.role === "team_lead" || m.role === "manager")
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.displayName}
                  </option>
                ))}
            </Select>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={mut.isPending}>
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
