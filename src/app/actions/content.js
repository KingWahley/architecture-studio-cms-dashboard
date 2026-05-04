"use server";

import { refresh, revalidatePath } from "next/cache";
import { getEntityConfig } from "@/lib/content-schema";
import { removeEntityItem, saveEntityItem } from "@/lib/content-store";

function revalidateAdminRoutes(route) {
  revalidatePath("/dashboard");
  revalidatePath(route);
}

export async function saveContentItem(payload) {
  const config = getEntityConfig(payload.entityKey);
  const item = await saveEntityItem(payload.entityKey, payload);
  revalidateAdminRoutes(config.route);
  refresh();

  return {
    ok: true,
    item,
    message: `${config.singular} saved successfully.`,
  };
}

export async function deleteContentItem(payload) {
  const config = getEntityConfig(payload.entityKey);
  await removeEntityItem(payload.entityKey, payload.id);
  revalidateAdminRoutes(config.route);
  refresh();

  return {
    ok: true,
    message: `${config.singular} deleted.`,
  };
}
