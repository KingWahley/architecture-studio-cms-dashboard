"use server";

import { refresh, revalidatePath } from "next/cache";
import { getEntityConfig } from "@/lib/content-schema";
import {
  createMediaItem,
  deleteProjectCategory,
  getCareersBundle,
  getContactBundle,
  getMediaLibraryBundle,
  removeEntityItem,
  removeApplication,
  removeMediaItem,
  removeProject,
  removeVacancy,
  saveEntityItem,
  saveContactDetails,
  saveProject,
  saveProjectCategory,
  saveVacancy,
  updateMediaItem,
} from "@/lib/content-store";

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

  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(filePath, buffer);

  const mediaItem = await createMediaItem({
    name: filename,
    url: `/uploads/${filename}`,
    size: buffer.byteLength,
    mimeType: file.type || "image/jpeg",
    alt: file.name.replace(/\.[^.]+$/, ""),
    caption: "",
  });

  revalidateAdminRoutes("/media");
  refresh();

  return {
    url: `/uploads/${filename}`,
    media: mediaItem,
  };
}

export async function getMediaItemsAction() {
  const { items } = await getMediaLibraryBundle();
  return items;
}

export async function updateMediaItemAction(payload) {
  const result = await updateMediaItem(payload);

  if (result.ok) {
    revalidateAdminRoutes("/media");
    refresh();
  }

  return result;
}

export async function deleteMediaItemAction(id) {
  const result = await removeMediaItem(id);

  if (result.ok) {
    revalidateAdminRoutes("/media");
    refresh();
  }

  return result;
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

export async function getCareersBundleAction() {
  return getCareersBundle();
}

export async function getContactBundleAction() {
  return getContactBundle();
}

export async function saveContactDetailsAction(payload) {
  const result = await saveContactDetails(payload);

  if (result.ok) {
    revalidateAdminRoutes("/messages");
    refresh();
  }

  return result;
}

export async function saveVacancyAction(payload) {
  const result = await saveVacancy(payload);

  if (result.ok) {
    revalidateAdminRoutes("/vacancies");
    refresh();
  }

  return result;
}

export async function deleteVacancyAction(id) {
  const result = await removeVacancy(id);

  if (result.ok) {
    revalidateAdminRoutes("/vacancies");
    refresh();
  }

  return result;
}

export async function deleteApplicationAction(id) {
  const result = await removeApplication(id);

  if (result.ok) {
    revalidateAdminRoutes("/vacancies");
    refresh();
  }

  return result;
}

export async function saveProjectAction(payload) {
  const result = await saveProject(payload);

  if (result.ok) {
    revalidateAdminRoutes("/projects");
    revalidatePath(`/projects/${result.item.id}`);
    refresh();
  }

  return result;
}

export async function deleteProjectAction(id) {
  await removeProject(id);
  revalidateAdminRoutes("/projects");
  refresh();

  return {
    ok: true,
    message: "Project deleted.",
  };
}

export async function saveProjectCategoryAction(payload) {
  const result = await saveProjectCategory(payload);

  if (result.ok) {
    revalidateAdminRoutes("/projects");
    refresh();
  }

  return result;
}

export async function deleteProjectCategoryAction(id) {
  const result = await deleteProjectCategory(id);

  if (result.ok) {
    revalidateAdminRoutes("/projects");
    refresh();
  }

  return result;
}
