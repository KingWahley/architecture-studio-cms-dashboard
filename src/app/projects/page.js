import CollectionPage from "@/components/admin/CollectionPage";

export default function ProjectsPage() {
  return <CollectionPage entityKey="projects" customEditRoute="/projects/[id]" />;
}
