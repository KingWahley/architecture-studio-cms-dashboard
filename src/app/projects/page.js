import ProjectsAdminPage from "@/components/projects/ProjectsAdminPage";
import { getProjectsBundle } from "@/lib/content-store";

export default async function ProjectsPage() {
  const { items, categories } = await getProjectsBundle();

  return <ProjectsAdminPage items={items} categories={categories} />;
}
