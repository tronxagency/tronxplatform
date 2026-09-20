import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { EmptyState, PageHeader, Surface } from "@/components/marks";
import { Input } from "@/components/ui/forms";
import { Skeleton } from "@/components/ui/display";
import { addFile, listFiles, listProjects } from "@/lib/server/fns";
import { formatShortDate } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/files")({ component: FilesPage });

function FilesPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const files = useQuery({ queryKey: ["files", q], queryFn: () => listFiles({ data: { q } }) });
  const projects = useQuery({ queryKey: ["projects"], queryFn: () => listProjects() });
  const upload = useMutation({
    mutationFn: (data: { name: string; mime: string; sizeBytes: number; projectId?: string }) => addFile({ data }),
    onSuccess: async () => {
      toast.success("File attached");
      await qc.invalidateQueries({ queryKey: ["files"] });
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Library" title="Files" description="Project and task attachments in one searchable place." />
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search files" className="sm:max-w-xs" />
        <label className="inline-flex h-10 cursor-pointer items-center rounded-lg border border-border bg-secondary px-3 text-sm">
          Attach file
          <input
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              upload.mutate({ name: file.name, mime: file.type, sizeBytes: file.size });
              e.target.value = "";
            }}
          />
        </label>
      </div>
      {files.isPending ? (
        <Skeleton className="h-64" />
      ) : !files.data?.length ? (
        <EmptyState title="No files" description="Attach something to a project or task and it will appear here." />
      ) : (
        <Surface className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] tracking-wide text-muted-foreground uppercase">
              <tr className="border-b border-border">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Size</th>
                <th className="px-4 py-3 font-medium">Added</th>
              </tr>
            </thead>
            <tbody>
              {files.data.map((f) => (
                <tr key={f.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{f.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {projects.data?.find((p) => p.id === f.projectId)?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">
                    {f.sizeBytes > 1_000_000 ? `${(f.sizeBytes / 1_000_000).toFixed(1)} MB` : `${Math.round(f.sizeBytes / 1000)} KB`}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatShortDate(f.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Surface>
      )}
    </div>
  );
}
