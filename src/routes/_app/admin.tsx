import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { EnrollEmployeeDialog } from "@/components/enroll-employee";
import { PageHeader, Surface } from "@/components/marks";
import { Button } from "@/components/ui/button";
import { PersonAvatar } from "@/components/ui/display";
import { Input, Label, Select } from "@/components/ui/forms";
import { useWorkspace } from "@/components/workspace";
import {
  createAnnouncement,
  createDepartment,
  createTeam,
  getAdmin,
  updateMember,
  updateOrgSettings,
} from "@/lib/server/fns";
import { ALL_PERMS, PERM_LABEL, assignableRoles, canModifyPerson, hasPerm } from "@/lib/permissions";
import { ROLE_LABEL } from "@/lib/types";
import { relativeTime } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/admin")({ component: AdminPage });

const TABS = ["People", "Departments", "Teams", "Announcements", "Audit", "Settings"] as const;

function AdminPage() {
  const { me, members, departments, teams, org } = useWorkspace();
  const allowed = hasPerm(me.role, "employee.update") || hasPerm(me.role, "admin.audit_logs");
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin"],
    queryFn: () => getAdmin(),
    enabled: allowed,
  });
  const [tab, setTab] = useState<(typeof TABS)[number]>("People");
  const update = useMutation({
    mutationFn: (data: { id: string; role?: string; status?: string; title?: string }) => updateMember({ data }),
    onSuccess: () => {
      toast.success("Member updated");
      void qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!allowed) return <Navigate to="/" />;

  const tabs = TABS.filter((t) => {
    if (t === "Audit") return hasPerm(me.role, "admin.audit_logs");
    if (t === "Settings") return hasPerm(me.role, "admin.settings");
    if (t === "Announcements") return hasPerm(me.role, "announce.send");
    if (t === "Departments") return hasPerm(me.role, "department.create");
    if (t === "Teams") return hasPerm(me.role, "team.create");
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Organization"
        description="People, departments, teams and the audit trail. Enrollment is limited to CEO, directors, the executive assistant and managers. Founder and EA enrollments open a first-week desk automatically."
        actions={
          hasPerm(me.role, "employee.create") ? (
            <EnrollEmployeeDialog>
              <Button size="sm">Enroll employee</Button>
            </EnrollEmployeeDialog>
          ) : null
        }
      />
      <div className="flex gap-1 overflow-x-auto no-scrollbar">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`h-9 shrink-0 rounded-full px-3 text-sm ${tab === t ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "People" ? (
        <Surface className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] tracking-wide text-muted-foreground uppercase">
              <tr className="border-b border-border">
                <th className="px-4 py-3 font-medium">Person</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {(q.data?.members ?? members).map((m) => (
                <tr key={m.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Link to="/employees/$employeeId" params={{ employeeId: m.id }} className="flex items-center gap-2 hover:underline">
                      <PersonAvatar person={m} size="sm" />
                      <div>
                        <p>{m.displayName}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {m.title} · {m.employeeCode ?? ""}
                        </p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{m.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    {canModifyPerson(me.role, m.role) && m.id !== me.id ? (
                      <Select
                        value={m.role}
                        onChange={(e) => update.mutate({ id: m.id, role: e.target.value })}
                        className="h-8 text-xs"
                      >
                        {(assignableRoles(me.role).includes(m.role) ? assignableRoles(me.role) : [m.role, ...assignableRoles(me.role)]).map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABEL[r]}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <span className="text-sm">{ROLE_LABEL[m.role]}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {canModifyPerson(me.role, m.role) && m.id !== me.id ? (
                      <Select
                        value={m.status}
                        onChange={(e) => update.mutate({ id: m.id, status: e.target.value })}
                        className="h-8 text-xs"
                      >
                        <option value="active">Active</option>
                        <option value="invited">Invited</option>
                        <option value="disabled">Disabled</option>
                      </Select>
                    ) : (
                      <span className="text-sm capitalize">{m.status}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Surface>
      ) : null}

      {tab === "Departments" ? <DeptForm /> : null}
      {tab === "Teams" ? <TeamForm /> : null}
      {tab === "Announcements" ? <AnnounceForm /> : null}

      {tab === "Audit" ? (
        <Surface className="p-5">
          <h2 className="font-display text-sm font-semibold">Audit log</h2>
          <p className="mt-1 text-xs text-muted-foreground">Read-only. Ordinary users cannot edit this trail.</p>
          <ul className="mt-3 space-y-2">
            {(q.data?.audit ?? []).map((a) => (
              <li key={a.id} className="flex justify-between gap-3 text-sm">
                <span>{a.summary || a.action}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{relativeTime(a.createdAt)}</span>
              </li>
            ))}
          </ul>
        </Surface>
      ) : null}

      {tab === "Settings" ? (
        <OrgForm defaultName={org.name} />
      ) : null}

      {tab === "People" ? (
        <Surface className="p-5">
          <h2 className="font-display text-sm font-semibold">Permission matrix</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            CEO, Founder/Director, Executive Assistant and Manager may enroll employees. Team leads and employees cannot — the API rejects those requests even if a button is forced.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-muted-foreground uppercase tracking-wide">
                <tr className="border-b border-border">
                  <th className="py-2 pr-3">Capability</th>
                  <th className="py-2 pr-3">CEO</th>
                  <th className="py-2 pr-3">Director</th>
                  <th className="py-2 pr-3">EA</th>
                  <th className="py-2 pr-3">Manager</th>
                  <th className="py-2 pr-3">Lead</th>
                  <th className="py-2">Employee</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {[
                  ...ALL_PERMS.map((key) => [
                    PERM_LABEL[key],
                    hasPerm("ceo", key) ? "Yes" : "—",
                    hasPerm("founder", key) ? "Yes" : "—",
                    hasPerm("executive_assistant", key) ? "Yes" : "—",
                    hasPerm("manager", key) ? "Yes" : "—",
                    hasPerm("team_lead", key) ? "Yes" : "—",
                    hasPerm("employee", key) ? "Yes" : "—",
                  ]),
                ].map((row) => (
                  <tr key={row[0]} className="border-b border-border last:border-0">
                    {row.map((c, i) => (
                      <td key={`${row[0]}-${i}`} className="py-2 pr-3">
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Surface>
      ) : null}
    </div>
  );
}

function DeptForm() {
  const { members } = useWorkspace();
  const qc = useQueryClient();
  const { departments } = useWorkspace();
  const mut = useMutation({
    mutationFn: (data: { name: string; description?: string; headId?: string }) => createDepartment({ data }),
    onSuccess: async () => {
      toast.success("Department created");
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
      headId: String(fd.get("headId") || "") || undefined,
    });
    e.currentTarget.reset();
  }
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <Surface className="p-5">
        <h2 className="font-display text-sm font-semibold">New department</h2>
        <form className="mt-3 space-y-3" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="dname">Name</Label>
            <Input id="dname" name="name" required placeholder="Software Development" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ddesc">Description</Label>
            <Input id="ddesc" name="description" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dhead">Head</Label>
            <Select id="dhead" name="headId">
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.displayName}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit" disabled={mut.isPending}>
            Create
          </Button>
        </form>
      </Surface>
      <Surface className="p-5">
        <h2 className="font-display text-sm font-semibold">Departments</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {departments.map((d) => (
            <li key={d.id}>
              <p className="font-medium">{d.name}</p>
              <p className="text-xs text-muted-foreground">{d.description}</p>
            </li>
          ))}
        </ul>
      </Surface>
    </div>
  );
}

function TeamForm() {
  const { members, departments, teams } = useWorkspace();
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: (data: { name: string; description?: string; departmentId?: string; leadId?: string }) =>
      createTeam({ data }),
    onSuccess: async () => {
      toast.success("Team created");
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
    e.currentTarget.reset();
  }
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <Surface className="p-5">
        <h2 className="font-display text-sm font-semibold">New team</h2>
        <form className="mt-3 space-y-3" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="tname">Name</Label>
            <Input id="tname" name="name" required placeholder="MERN Team" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tdesc">Description</Label>
            <Input id="tdesc" name="description" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tdep">Department</Label>
            <Select id="tdep" name="departmentId">
              <option value="">Unassigned</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tlead">Lead</Label>
            <Select id="tlead" name="leadId">
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.displayName}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit" disabled={mut.isPending}>
            Create
          </Button>
        </form>
      </Surface>
      <Surface className="p-5">
        <h2 className="font-display text-sm font-semibold">Teams</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {teams.map((t) => (
            <li key={t.id}>
              <p className="font-medium">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.memberIds.length} members</p>
            </li>
          ))}
        </ul>
      </Surface>
    </div>
  );
}

function AnnounceForm() {
  const qc = useQueryClient();
  const { announcements } = useWorkspace();
  const mut = useMutation({
    mutationFn: (data: { title: string; body: string }) => createAnnouncement({ data }),
    onSuccess: async () => {
      toast.success("Announcement sent");
      await qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    mut.mutate({ title: String(fd.get("title") ?? ""), body: String(fd.get("body") ?? "") });
    e.currentTarget.reset();
  }
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <Surface className="p-5">
        <h2 className="font-display text-sm font-semibold">Send announcement</h2>
        <form className="mt-3 space-y-3" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="atitle">Title</Label>
            <Input id="atitle" name="title" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="abody">Body</Label>
            <Input id="abody" name="body" required />
          </div>
          <Button type="submit" disabled={mut.isPending}>
            Send
          </Button>
        </form>
      </Surface>
      <Surface className="p-5">
        <h2 className="font-display text-sm font-semibold">Recent</h2>
        <ul className="mt-3 space-y-3 text-sm">
          {announcements.map((a) => (
            <li key={a.id}>
              <p className="font-medium">{a.title}</p>
              <p className="text-muted-foreground">{a.body}</p>
            </li>
          ))}
        </ul>
      </Surface>
    </div>
  );
}

function OrgForm({ defaultName }: { defaultName: string }) {
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: (name: string) => updateOrgSettings({ data: { name } }),
    onSuccess: async () => {
      toast.success("Organization updated");
      await qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    mut.mutate(String(fd.get("name") ?? ""));
  }
  return (
    <Surface className="p-5 max-w-lg">
      <h2 className="font-display text-sm font-semibold">Organization</h2>
      <form className="mt-3 space-y-3" onSubmit={onSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="oname">Name</Label>
          <Input id="oname" name="name" defaultValue={defaultName} required />
        </div>
        <Button type="submit" disabled={mut.isPending}>
          Save
        </Button>
      </form>
    </Surface>
  );
}
