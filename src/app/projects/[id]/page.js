import ProjectForm from "@/components/projects/ProjectForm";
import { getMediaLibraryBundle, getProjectById, getProjectsBundle } from "@/lib/content-store";
import { notFound } from "next/navigation";

export default async function EditProjectPage({ params }) {
  const { id } = await params;
  if (id === "new") {
    const [{ categories }, { items: mediaItems }] = await Promise.all([
      getProjectsBundle(),
      getMediaLibraryBundle(),
    ]);
    return <ProjectForm project={{ id: "new" }} categories={categories} mediaItems={mediaItems} />;
  }

  const [project, { categories }, { items: mediaItems }] = await Promise.all([
    getProjectById(id),
    getProjectsBundle(),
    getMediaLibraryBundle(),
  ]);

  if (!project) {
    notFound();
  }

  return <ProjectForm project={project} categories={categories} mediaItems={mediaItems} />;
}
