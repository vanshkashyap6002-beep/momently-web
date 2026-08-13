import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projectService } from "@/services/project.service";
import { projectToEditableState } from "@/lib/project-mapper";
import { PublicMemoryView } from "@/components/PublicMemory/PublicMemoryView";
import { NotFoundError } from "@/lib/errors";

// Always touches the database for the current request — never statically
// cached/prerendered — matching the same reasoning behind every other
// DB-touching route in this project (see the identical comment on
// app/api/auth/[...nextauth]/route.ts): Next.js must not attempt to run
// this at BUILD time, when the database isn't reachable.
export const dynamic = "force-dynamic";

async function loadPublicProject(slug: string) {
  try {
    return await projectService.getPublicProject(slug);
  } catch (err) {
    if (err instanceof NotFoundError) return null;
    throw err;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await loadPublicProject(slug);

  if (!project) {
    return { title: "Memory not found — Momently" };
  }

  return {
    title: `${project.title} — Momently`,
    description: "A memory page made with Momently.",
    openGraph: {
      title: project.title,
      description: "A memory page made with Momently.",
      images: project.coverImage ? [project.coverImage] : undefined,
    },
  };
}

export default async function PublicMemoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await loadPublicProject(slug);

  if (!project) {
    notFound();
  }

  const state = projectToEditableState(project);

  return <PublicMemoryView state={state} />;
}
