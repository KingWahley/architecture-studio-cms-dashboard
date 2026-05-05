"use server";

import { refresh, revalidatePath } from "next/cache";
import { getEntityConfig } from "@/lib/content-schema";
import { removeEntityItem, saveEntityItem } from "@/lib/content-store";

import { promises as fs } from "node:fs";
import path from "node:path";

function revalidateAdminRoutes(route) {
  revalidatePath("/dashboard");
  revalidatePath(route);
}

export async function uploadFile(formData) {
  const file = formData.get("file");
  if (!file) {
    throw new Error("No file uploaded");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const filePath = path.join(uploadDir, filename);

  await fs.writeFile(filePath, buffer);

  return {
    url: `/uploads/${filename}`,
  };
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
