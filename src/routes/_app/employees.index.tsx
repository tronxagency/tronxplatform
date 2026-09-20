import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { EnrollEmployeeDialog } from "@/components/enroll-employee";
import { EmptyState, PageHeader } from "@/components/marks";
import { Button } from "@/components/ui/button";
import { PersonAvatar } from "@/components/ui/display";
import { Input, Select } from "@/components/ui/forms";
import { useWorkspace } from "@/components/workspace";
import { canEnroll } from "@/lib/permissions";
import { ROLE_LABEL, type Role } from "@/lib/types";
import { isOnline } from "@/lib/utils";

export const Route = createFileRoute("/_app/employees/")({ component: EmployeesPage });

function EmployeesPage() {
  const { me, members, teams, departments, openTasksByProfile } = useWorkspace();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [dept, setDept] = useState("");
  const [team, setTeam] = useState("");
  const [status, setStatus] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return members.filter((m) => {
      if (status && m.status !== status) return false;
      if (role && m.role !== role) return false;
      if (dept && m.departmentId !== dept) return false;
      if (team && m.teamId !== team) return false;
      if (!term) return true;
      return (
        m.displayName.toLowerCase().includes(term) ||
        (m.email ?? "").toLowerCase().includes(term) ||
        (m.employeeCode ?? "").toLowerCase().includes(term) ||
        m.title.toLowerCase().includes(term)
      );
    });
  }, [members, q, role, dept, team, status]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="People"
        title="Employees"
        description="The company directory — search, open a profile, enroll someone new if you can."
        actions={
          canEnroll(me.role) ? (
            <EnrollEmployeeDialog>
              <Button>Enroll employee</Button>
            </EnrollEmployeeDialog>
          ) : null
        }
      />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, ID, email…" />
        <Select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          {Object.entries(ROLE_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
        <Select value={dept} onChange={(e) => setDept(e.target.value)}>
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </Select>
        <Select value={team} onChange={(e) => setTeam(e.target.value)}>
          <option value="">All teams</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="invited">Invited</option>
          <option value="disabled">Disabled</option>
        </Select>
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="No one matches" description="Try a different search or clear the filters." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((m) => {
            const department = departments.find((d) => d.id === m.departmentId);
            const tm = teams.find((t) => t.id === m.teamId);
            return (
              <Link
                key={m.id}
                to="/employees/$employeeId"
                params={{ employeeId: m.id }}
                className="rounded-2xl border border-border bg-card p-4 shadow-soft transition-colors hover:border-ring/40"
              >
                <div className="flex items-start gap-3">
                  <PersonAvatar person={m} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{m.displayName}</p>
                    <p className="truncate text-xs text-muted-foreground">{m.title}</p>
                    <p className="mt-2 text-[11px] tracking-wide text-muted-foreground uppercase">
                      {ROLE_LABEL[m.role as Role]} · {department?.name ?? "No dept"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {tm?.name ?? "No team"} · {m.employeeCode ?? "—"} · {openTasksByProfile[m.id] ?? 0} open
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      <span className={isOnline(m.lastSeenAt) ? "text-ok" : ""}>
                        {isOnline(m.lastSeenAt) ? "Online" : m.status}
                      </span>
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
