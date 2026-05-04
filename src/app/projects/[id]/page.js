import { getEntityBundle } from "@/lib/content-store";
import ProjectEditor from "./ProjectEditor";
import { notFound } from "next/navigation";

export default async function EditProjectPage({ params }) {
  const { id } = await params;
  const { config, items } = await getEntityBundle("projects");
  
  let project = null;
  if (id === "new") {
    // Generate empty project based on fields
    project = Object.fromEntries(
      config.fields.map(f => [f.name, f.type === "number" ? 0 : f.type === "boolean" ? false : f.type === "json" ? [] : ""])
    );
    project.id = "new";
  } else {
    project = items.find(p => p.id === id);
    if (!project) {
      notFound();
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <ProjectEditor 
        project={project} 
        config={config} 
      />
    </div>
  );
}
