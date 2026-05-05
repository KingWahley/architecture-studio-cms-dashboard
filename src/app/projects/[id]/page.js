import ProjectForm from "@/components/projects/ProjectForm";
import { getProjectById, getProjectsBundle } from "@/lib/content-store";
import { notFound } from "next/navigation";

export default async function EditProjectPage({ params }) {
  const { id } = await params;
  if (id === "new") {
    const { categories } = await getProjectsBundle();
    return <ProjectForm project={{ id: "new" }} categories={categories} />;
  }

  const [project, { categories }] = await Promise.all([
    getProjectById(id),
    getProjectsBundle(),
  ]);

  if (!project) {
    notFound();
  }

  return <ProjectForm project={project} categories={categories} />;
}
