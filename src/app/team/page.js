import TeamAdminPage from "@/components/team/TeamAdminPage";
import { getEntityBundle, getMediaLibraryBundle } from "@/lib/content-store";

export default async function TeamPage() {
  const [{ items }, { items: mediaItems }] = await Promise.all([
    getEntityBundle("team"),
    getMediaLibraryBundle(),
  ]);

  return <TeamAdminPage initialItems={items} mediaItems={mediaItems} />;
}
