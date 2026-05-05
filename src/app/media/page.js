import MediaLibraryPage from "@/components/media/MediaLibraryPage";
import { getMediaLibraryBundle } from "@/lib/content-store";

export default async function MediaPage() {
  const { items } = await getMediaLibraryBundle();
  return <MediaLibraryPage initialItems={items} />;
}
