import CollectionManager from "@/components/admin/CollectionManager";
import { getEntityBundle, getMediaLibraryBundle } from "@/lib/content-store";

export default async function CollectionPage({ entityKey, customEditRoute }) {
  const [{ config, items }, { items: mediaItems }] = await Promise.all([
    getEntityBundle(entityKey),
    getMediaLibraryBundle(),
  ]);

  return (
    <CollectionManager
      entityKey={entityKey}
      config={config}
      items={items}
      mediaItems={mediaItems}
      customEditRoute={customEditRoute}
    />
  );
}
