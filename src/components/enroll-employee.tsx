import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { type FormEvent, type ReactNode, useState } from "react";
import { toast } from "sonner";
import { enrollEmployee, updateEmployee } from "@/lib/server/fns";
import { assignableRoles, canEnroll, canModifyPerson } from "@/lib/permissions";
import { AVATAR_CLASS, EMPLOYMENT_LABEL, EMPLOYMENT_TYPES, ROLE_LABEL, type Profile } from "@/lib/types";
import { Button } from "./ui/button";
import { Input, Label, Select, Textarea } from "./ui/forms";
import { Dialog, DialogContent, DialogTrigger } from "./ui/overlay";
import { useWorkspace } from "./workspace";

export function EnrollEmployeeDialog({
  children,
  person,
  open: controlledOpen,
  onOpenChange,
}: {
  children?: ReactNode;
  person?: Profile;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}) {
  const { me, members, teams, departments } = useWorkspace();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const qc = useQueryClient();
  const navigate = useNavigate();
  const isEdit = Boolean(person);
  const enroll = useMutation({
    mutationFn: (payload: Parameters<typeof enrollEmployee>[0] extends { data: infer D } ? D : never) =>
      enrollEmployee({ data: payload }),
    onSuccess: async (res) => {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const link = res.inviteToken ? `${origin}/invite/${res.inviteToken}` : "";
      toast.success(
        res.onboardingId
          ? `Enrolled ${res.employeeCode}. Executive onboarding opened on the desk.`
          : link
            ? `Enrolled ${res.employeeCode}. Invitation ready.`
            : `Enrolled ${res.employeeCode}`,
      );
      if (link) {
        try {
          await navigator.clipboard.writeText(link);
          toast.message("Invitation link copied");
        } catch {
          /* ignore */
        }
      }
      setOpen(false);
      await qc.invalidateQueries();
      if (res.onboardingId) {
        await navigate({ to: "/onboarding/$onboardingId", params: { onboardingId: res.onboardingId } });
      } else if (res.id) {
        await navigate({ to: "/employees/$employeeId", params: { employeeId: res.id } });
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const update = useMutation({
    mutationFn: (payload: Parameters<typeof updateEmployee>[0] extends { data: infer D } ? D : never) =>
      updateEmployee({ data: payload }),
    onSuccess: async () => {
      toast.success("Employee updated");
      setOpen(false);
      await qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!isEdit && !canEnroll(me.role)) return null;
  if (isEdit && person && person.id !== me.id && !canModifyPerson(me.role, person.role) && !canEnroll(me.role)) {
    return null;
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      title: String(fd.get("title") ?? ""),
      role: String(fd.get("role") ?? "employee"),
      departmentId: String(fd.get("departmentId") || "") || undefined,
      teamId: String(fd.get("teamId") || "") || undefined,
      managerId: String(fd.get("managerId") || "") || undefined,
      teamLeadId: String(fd.get("teamLeadId") || "") || undefined,
      phone: String(fd.get("phone") ?? ""),
      gender: String(fd.get("gender") ?? ""),
      dob: String(fd.get("dob") ?? ""),
      emergencyContact: String(fd.get("emergencyContact") ?? ""),
      employmentType: String(fd.get("employmentType") ?? "full_time"),
      location: String(fd.get("location") ?? ""),
      workEmail: String(fd.get("workEmail") ?? ""),
      joiningDate: String(fd.get("joiningDate") ?? ""),
      skills: String(fd.get("skills") ?? ""),
      bio: String(fd.get("bio") ?? ""),
      notes: String(fd.get("notes") ?? ""),
      avatarKey: String(fd.get("avatarKey") ?? "zinc"),
      status: String(fd.get("status") || person?.status || "invited"),
    };
    if (person) update.mutate({ ...payload, id: person.id });
    else enroll.mutate(payload);
  }

  const roles = assignableRoles(me.role);
  const managers = members.filter((m) => m.role === "ceo" || m.role === "founder" || m.role === "manager" || m.role === "executive_assistant");
  const leads = members.filter((m) => m.role === "team_lead" || m.role === "manager");
  const busy = enroll.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent title={isEdit ? "Edit employee" : "Enroll employee"} className="w-[min(100%-1.5rem,44rem)] max-h-[88vh] overflow-y-auto">
        <p className="mt-1 text-sm text-muted-foreground">
          {isEdit
            ? "Updates land immediately. Role changes are limited by your own authority."
            : "Creates an invitation. Founders and executive assistants also open a 14-day checklist on the executive desk. They set their own password — you never invent a permanent one for them."}
        </p>
        <form className="mt-5 space-y-6" onSubmit={onSubmit} key={person?.id ?? "new"}>
          <Section title="Personal">
            <Field label="Full name" name="name" required placeholder="Priya Menon" defaultValue={person?.displayName} />
            <Field label="Email" name="email" type="email" required placeholder="priya@tronx.dev" defaultValue={person?.email ?? ""} />
            <Field label="Phone" name="phone" placeholder="+91 98000 00000" defaultValue={person?.phone ?? ""} />
            <div className="space-y-1.5">
              <Label htmlFor="gender">Gender</Label>
              <Select id="gender" name="gender" defaultValue={person?.gender ?? ""}>
                <option value="">Prefer not to say</option>
                <option value="woman">Woman</option>
                <option value="man">Man</option>
                <option value="nonbinary">Non-binary</option>
              </Select>
            </div>
            <Field label="Date of birth" name="dob" type="date" defaultValue={person?.dob ?? ""} />
            <Field label="Emergency contact" name="emergencyContact" placeholder="Name · phone" defaultValue={person?.emergencyContact ?? ""} />
          </Section>
          <Section title="Professional">
            <Field label="Job title" name="title" required placeholder="Backend Engineer" defaultValue={person?.title} />
            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <Select id="role" name="role" defaultValue={person?.role ?? "employee"} disabled={person?.role === "ceo"}>
                {(person?.role === "ceo" ? (["ceo"] as const) : roles).map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="departmentId">Department</Label>
              <Select id="departmentId" name="departmentId" defaultValue={person?.departmentId ?? ""}>
                <option value="">Unassigned</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="teamId">Team</Label>
              <Select id="teamId" name="teamId" defaultValue={person?.teamId ?? ""}>
                <option value="">Unassigned</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="managerId">Manager</Label>
              <Select id="managerId" name="managerId" defaultValue={person?.managerId ?? ""}>
                <option value="">Unassigned</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.displayName}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="teamLeadId">Team lead</Label>
              <Select id="teamLeadId" name="teamLeadId" defaultValue={person?.teamLeadId ?? ""}>
                <option value="">Unassigned</option>
                {leads.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.displayName}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="employmentType">Employment type</Label>
              <Select id="employmentType" name="employmentType" defaultValue={person?.employmentType ?? "full_time"}>
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {EMPLOYMENT_LABEL[t]}
                  </option>
                ))}
              </Select>
            </div>
            <Field label="Location" name="location" placeholder="Bengaluru" defaultValue={person?.location ?? ""} />
            <Field label="Work email" name="workEmail" type="email" placeholder="Same as email if blank" defaultValue={person?.workEmail ?? ""} />
            <Field label="Joining date" name="joiningDate" type="date" defaultValue={person?.joiningDate ?? ""} />
            {isEdit ? (
              <div className="space-y-1.5">
                <Label htmlFor="status">Account status</Label>
                <Select id="status" name="status" defaultValue={person?.status ?? "active"} disabled={person?.role === "ceo"}>
                  <option value="active">Active</option>
                  <option value="invited">Invited</option>
                  <option value="disabled">Disabled</option>
                </Select>
              </div>
            ) : null}
          </Section>
          <Section title="Profile">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="skills">Skills</Label>
              <Input id="skills" name="skills" placeholder="react, postgres, systems" defaultValue={person?.skills.join(", ")} />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" placeholder="A short professional summary" defaultValue={person?.bio} />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="notes">Internal notes</Label>
              <Textarea id="notes" name="notes" placeholder="Visible to managers and above" defaultValue={person?.notes} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="avatarKey">Avatar color</Label>
              <Select id="avatarKey" name="avatarKey" defaultValue={person?.avatarKey ?? "zinc"}>
                {Object.keys(AVATAR_CLASS).map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </Select>
            </div>
          </Section>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : isEdit ? "Save changes" : "Create employee"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">{title}</legend>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} required={required} placeholder={placeholder} defaultValue={defaultValue} />
    </div>
  );
}
