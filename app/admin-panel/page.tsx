import { projectService } from "@/services/project.service";
import { ProjectsTable } from "@/components/AdminPanel/ProjectsTable";

export default async function AdminProjectsPage() {
  const projects = await projectService.getAllProjectsForAdmin();

  return (
    <div>
      <p className="eyebrow">Admin Panel</p>
      <h1 className="mt-2 font-display text-2xl md:text-3xl text-ink dark:text-paper">Projects</h1>
      <p className="mt-1 text-sm text-ink/55 dark:text-paper/55">{projects.length} total</p>

      <div className="mt-6">
        <ProjectsTable projects={projects} />
      </div>
    </div>
  );
}
