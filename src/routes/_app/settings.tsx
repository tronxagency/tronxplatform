import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type FormEvent } from "react";
import { toast } from "sonner";
import { PageHeader, Surface } from "@/components/marks";
import { Button } from "@/components/ui/button";
import { PersonAvatar } from "@/components/ui/display";
import { Input, Label, Textarea } from "@/components/ui/forms";
import { useWorkspace } from "@/components/workspace";
import { ROLE_LABEL } from "@/lib/types";
import { UserButton } from "@/lib/auth/gates";
import { updateEmployee } from "@/lib/server/fns";

export const Route = createFileRoute("/_app/settings")({ component: SettingsPage });

function SettingsPage() {
  const { me, org } = useWorkspace();
  const qc = useQueryClient();
  const save = useMutation({
    mutationFn: (data: {
      id: string;
      name: string;
      email: string;
      phone?: string;
      location?: string;
      bio?: string;
      skills?: string;
    }) => updateEmployee({ data }),
    onSuccess: async () => {
      toast.success("Profile saved");
      await qc.invalidateQueries({ queryKey: ["workspace"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    save.mutate({
      id: me.id,
      name: String(fd.get("name") ?? me.displayName),
      email: me.email ?? "",
      phone: String(fd.get("phone") ?? ""),
      location: String(fd.get("location") ?? ""),
      bio: String(fd.get("bio") ?? ""),
      skills: String(fd.get("skills") ?? ""),
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Account" title="Settings" description="Your identity in this workspace." />
      <Surface className="p-5">
        <div className="flex items-center gap-4">
          <PersonAvatar person={me} size="lg" />
          <div>
            <p className="font-display text-lg font-semibold">{me.displayName}</p>
            <p className="text-sm text-muted-foreground">{me.email ?? "No email on file"}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {ROLE_LABEL[me.role]} · {me.title} · {org.name}
            </p>
          </div>
        </div>
        <form className="mt-6 grid gap-3 sm:grid-cols-2" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={me.displayName} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={me.phone ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" defaultValue={me.location ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="skills">Skills</Label>
            <Input id="skills" name="skills" defaultValue={me.skills.join(", ")} />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" name="bio" defaultValue={me.bio} />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save profile"}
            </Button>
          </div>
        </form>
        <div className="mt-6 border-t border-border pt-4">
          <UserButton />
        </div>
      </Surface>
      <Surface className="p-5">
        <h2 className="font-display text-sm font-semibold">Notifications</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          In-app alerts are on for assignments, mentions, reviews and missed deadlines. Email and push can follow later.
        </p>
      </Surface>
      <Surface className="p-5">
        <h2 className="font-display text-sm font-semibold">Work tracking</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          TRONX only records work you log or move — tasks, time entries, comments and status. There is no screen capture, keylogging or hidden monitoring.
        </p>
      </Surface>
    </div>
  );
}
