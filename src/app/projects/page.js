import { Suspense } from "react";
import ProjectsAdminPage from "@/components/projects/ProjectsAdminPage";
import { getProjectsBundle } from "@/lib/content-store";

export default async function ProjectsPage() {
  const { items, categories } = await getProjectsBundle();

  return (
    <Suspense fallback={null}>
      <ProjectsAdminPage items={items} categories={categories} />
    </Suspense>
  );
}
