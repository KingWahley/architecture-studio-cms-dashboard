import CollectionManager from "@/components/admin/CollectionManager";
import { getEntityBundle } from "@/lib/content-store";

export default async function CollectionPage({ entityKey }) {
  const { config, items } = await getEntityBundle(entityKey);
  return <CollectionManager entityKey={entityKey} config={config} items={items} />;
}
