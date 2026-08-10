"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Trash2, Image as ImageIcon } from "lucide-react";
import { StatusBadge } from "@/components/AdminPanel/StatusBadge";
import { deleteProjectAsAdmin } from "@/app/actions/admin.actions";

interface AdminProjectRow {
  id: string;
  title: string;
  status: string;
  coverImage: string | null;
  createdAt: Date;
  publishedAt: Date | null;
  user: { fullName: string; email: string };
  template: { title: string };
}

export function ProjectsTable({ projects }: { projects: AdminProjectRow[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
    setPendingId(id);
    setError(null);
    const result = await deleteProjectAsAdmin({ id });
    setPendingId(null);
    if (!result.ok) setError(result.error);
    else router.refresh();
  }

  return (
    <div>
      {error && (
        <p className="mb-4 rounded-lg bg-love/10 px-3 py-2 text-xs text-love dark:text-blush">{error}</p>
      )}
      <div className="overflow-x-auto rounded-2xl border border-ink/10 dark:border-paper/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/10 dark:border-paper/10 text-left text-xs text-ink/50 dark:text-paper/50">
              <th className="px-4 py-3 font-medium">Preview</th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Owner</th>
              <th className="px-4 py-3 font-medium">Template</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Published</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-b border-ink/5 dark:border-paper/5 last:border-0">
                <td className="px-4 py-3">
                  {project.coverImage ? (
                    <a href={project.coverImage} target="_blank" rel="noreferrer">
                      <Image
                        src={project.coverImage}
                        alt={project.title}
                        width={56}
                        height={40}
                        unoptimized
                        className="h-10 w-14 rounded-md object-cover"
                      />
                    </a>
                  ) : (
                    <div className="h-10 w-14 rounded-md bg-ink/5 dark:bg-paper/10 flex items-center justify-center">
                      <ImageIcon className="h-4 w-4 text-ink/30 dark:text-paper/30" />
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-ink dark:text-paper">{project.title}</td>
                <td className="px-4 py-3 text-ink/60 dark:text-paper/60">
                  {project.user.fullName}
                  <span className="block text-xs text-ink/40 dark:text-paper/40">{project.user.email}</span>
                </td>
                <td className="px-4 py-3 text-ink/60 dark:text-paper/60">{project.template.title}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={project.status} />
                </td>
                <td className="px-4 py-3 text-ink/50 dark:text-paper/50">
                  {new Date(project.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-ink/50 dark:text-paper/50">
                  {project.publishedAt ? new Date(project.publishedAt).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  {pendingId === project.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-ink/40 dark:text-paper/40 ml-auto" />
                  ) : (
                    <button
                      onClick={() => handleDelete(project.id, project.title)}
                      className="h-7 w-7 flex items-center justify-center rounded-md text-ink/50 hover:bg-love/10 hover:text-love dark:text-paper/50 dark:hover:text-blush ml-auto"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {projects.length === 0 && (
          <p className="py-10 text-center text-sm text-ink/45 dark:text-paper/45">No projects yet.</p>
        )}
      </div>
    </div>
  );
}
