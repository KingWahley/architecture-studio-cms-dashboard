import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import {
  DEFAULT_PROJECT_CATEGORIES,
  ENTITY_CONFIGS,
  ENTITY_ORDER,
  PROJECT_STATUSES,
} from "@/lib/content-schema";

const DATA_FILE = path.join(process.cwd(), "src", "data", "content.json");

function createProjectSection(title, body) {
  return {
    id: `section-${crypto.randomUUID()}`,
    title,
    body,
  };
}

function createProjectGalleryItem(url, alt = "") {
  return {
    id: `gallery-${crypto.randomUUID()}`,
    url,
    alt,
  };
}

const DEFAULT_CONTENT = {
  projects: [
    {
      id: "project-1",
      title: "Lagos Marina Towers",
      category: "Commercial",
      location: {
        city: "Lagos",
        state: "Lagos",
        country: "Nigeria",
      },
      status: "Ongoing",
      description:
        "<p>Mixed-use high-rise with phased delivery, coastal resilience planning, and active construction oversight.</p>",
      sections: [
        createProjectSection(
          "Design Direction",
          "<p>A layered podium and tower composition balances retail activation below with premium workspaces above.</p>",
        ),
        createProjectSection(
          "Delivery Notes",
          "<p>Coordination focuses on facade performance, phased tenant handover, and traffic circulation around the marina edge.</p>",
        ),
      ],
      gallery: [
        createProjectGalleryItem(
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop",
          "Lagos Marina Towers exterior",
        ),
        createProjectGalleryItem(
          "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1974&auto=format&fit=crop",
          "Marina Towers lobby concept",
        ),
      ],
      createdAt: "2026-04-12T08:00:00.000Z",
      updatedAt: "2026-04-30T11:00:00.000Z",
    },
    {
      id: "project-2",
      title: "Ikoyi Residence",
      category: "Residential",
      location: {
        city: "Ikoyi",
        state: "Lagos",
        country: "Nigeria",
      },
      status: "Completed",
      description:
        "<p>Private residential build focused on natural light, tactile finishes, and low-maintenance detailing.</p>",
      sections: [
        createProjectSection(
          "Client Brief",
          "<p>The home was shaped around calm entertaining spaces, shaded terraces, and practical family circulation.</p>",
        ),
      ],
      gallery: [
        createProjectGalleryItem(
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop",
          "Ikoyi Residence exterior",
        ),
      ],
      createdAt: "2026-03-21T12:20:00.000Z",
      updatedAt: "2026-04-25T09:30:00.000Z",
    },
    {
      id: "project-3",
      title: "Victoria Island Mall",
      category: "Retail",
      location: {
        city: "Victoria Island",
        state: "Lagos",
        country: "Nigeria",
      },
      status: "On Hold",
      description:
        "<p>Concept-stage retail destination paused while stakeholders review the revised leasing and access strategy.</p>",
      sections: [
        createProjectSection(
          "Current Status",
          "<p>The scheme is on hold pending commercial approvals and traffic impact review.</p>",
        ),
      ],
      gallery: [
        createProjectGalleryItem(
          "https://images.unsplash.com/photo-1519567281799-9637b92f44eb?q=80&w=2070&auto=format&fit=crop",
          "Victoria Island Mall facade concept",
        ),
      ],
      createdAt: "2026-04-08T15:10:00.000Z",
      updatedAt: "2026-04-18T15:10:00.000Z",
    },
  ],
  projectCategories: DEFAULT_PROJECT_CATEGORIES,
  vacancies: [
    {
      id: "vacancy-1",
      title: "Senior Architectural Designer",
      location: "Lagos, NG",
      type: "Full-time",
      applicants: 12,
      status: "active",
      posted: "Oct 10, 2025",
      summary: "Lead concept development, presentation decks, and client-facing design reviews.",
      updatedAt: "2026-04-29T08:15:00.000Z",
    },
    {
      id: "vacancy-2",
      title: "Project Manager",
      location: "Abuja, NG",
      type: "Full-time",
      applicants: 5,
      status: "active",
      posted: "Oct 15, 2025",
      summary: "Coordinate multidisciplinary delivery and maintain project reporting cadence.",
      updatedAt: "2026-04-28T12:00:00.000Z",
    },
    {
      id: "vacancy-3",
      title: "BIM Modeler",
      location: "Remote",
      type: "Contract",
      applicants: 24,
      status: "draft",
      posted: "Unpublished",
      summary: "Support modeling standards and documentation workflows for large programs.",
      updatedAt: "2026-04-16T10:45:00.000Z",
    },
  ],
  blog: [
    {
      id: "blog-1",
      title: "The Future of Sustainable Architecture in West Africa",
      author: "Alexander Okeke",
      date: "Oct 24, 2025",
      status: "active",
      image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=2065&auto=format&fit=crop",
      Title : "A practical look at climate-aware materials, local context, and commercial viability.",
      body: "A practical look at climate-aware materials, local context, and commercial viability.",
      updatedAt: "2026-04-27T13:30:00.000Z",
    },
    {
      id: "blog-2",
      title: "Minimalism: How Less Creates More in Commercial Spaces",
      author: "Sophia Adebayo",
      date: "Oct 12, 2025",
      status: "active",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop",
      Title : "How restrained material palettes and spatial discipline improve client experience.",
      body: "How restrained material palettes and spatial discipline improve client experience.",
      updatedAt: "2026-04-20T16:20:00.000Z",
    },
    {
      id: "blog-3",
      title: "Integrating Smart Technology in Modern Residential Design",
      author: "Alexander Okeke",
      date: "Draft",
      status: "draft",
      image: "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=2070&auto=format&fit=crop",
      Title : "A draft feature on automation, comfort, and long-term maintainability at home.",
      body: "A draft feature on automation, comfort, and long-term maintainability at home.",
      updatedAt: "2026-04-15T07:50:00.000Z",
    },
  ],
  team: [
    {
      id: "team-1",
      name: "Alexander Okeke",
      role: "Principal Architect",
      email: "alex@pieach.com",
      phone: "+234 800 123 4567",
      status: "active",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
      bio: "Leads studio direction, key client relationships, and final design approvals.",
      updatedAt: "2026-04-29T09:00:00.000Z",
    },
    {
      id: "team-2",
      name: "Sophia Adebayo",
      role: "Senior Interior Designer",
      email: "sophia@pieach.com",
      phone: "+234 800 234 5678",
      status: "active",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
      bio: "Owns interior concept development and material storytelling across premium projects.",
      updatedAt: "2026-04-24T10:00:00.000Z",
    },
    {
      id: "team-3",
      name: "Michael Obi",
      role: "Project Manager",
      email: "michael@pieach.com",
      phone: "+234 800 345 6789",
      status: "ongoing",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
      bio: "Coordinates delivery milestones, reporting, and cross-functional execution.",
      updatedAt: "2026-04-21T14:00:00.000Z",
    },
  ],
  appointments: [
    {
      id: "appointment-1",
      client: "Mr. Ade",
      topic: "Initial Consultation - Residential",
      date: "Today",
      time: "14:00 - 15:00",
      location: "Virtual (Zoom)",
      status: "new",
      notes: "Collect site context and discuss budget expectations.",
      updatedAt: "2026-05-01T09:00:00.000Z",
    },
    {
      id: "appointment-2",
      client: "EJ Investments",
      topic: "Marina Towers Phase 2 Review",
      date: "Tomorrow",
      time: "10:00 - 11:30",
      location: "Studio Office",
      status: "ongoing",
      notes: "Bring revised floor plans and updated facade options.",
      updatedAt: "2026-04-30T17:15:00.000Z",
    },
  ],
  messages: [
    {
      id: "message-1",
      name: "Emmanuel John",
      email: "emmanuel@firm.com",
      subject: "Consultation Inquiry",
      date: "10:45 AM",
      status: "new",
      preview: "I would like to schedule a consultation regarding a new commercial project in Victoria Island.",
      body: "I would like to schedule a consultation regarding a new commercial project in Victoria Island.",
      updatedAt: "2026-05-01T10:45:00.000Z",
    },
    {
      id: "message-2",
      name: "Sandra O.",
      email: "sandra@o-designs.com",
      subject: "Partnership Opportunity",
      date: "Yesterday",
      status: "ongoing",
      preview: "We are an interior design firm looking to collaborate on your upcoming residential development.",
      body: "We are an interior design firm looking to collaborate on your upcoming residential development.",
      updatedAt: "2026-04-29T12:15:00.000Z",
    },
  ],
};

function ensureProjectCategoryRecords(categories = []) {
  const normalized = categories
    .map((category) => {
      if (typeof category === "string") {
        return {
          id: `project-category-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          name: category.trim(),
        };
      }

      return {
        id:
          typeof category?.id === "string" && category.id.trim()
            ? category.id.trim()
            : `project-category-${crypto.randomUUID()}`,
        name: typeof category?.name === "string" ? category.name.trim() : "",
      };
    })
    .filter((category) => category.name);

  const unique = [];
  const seen = new Set();

  for (const category of normalized) {
    const key = category.name.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(category);
  }

  return unique;
}

function sanitizeProjectRichText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function normalizeProjectLocation(location, fallbackLocation = {}) {
  if (typeof location === "string") {
    const parts = location.split(",").map((part) => part.trim()).filter(Boolean);
    return {
      city: parts[0] ?? "",
      state: parts[1] ?? "",
      country: parts[2] ?? "",
    };
  }

  return {
    city: typeof location?.city === "string" ? location.city.trim() : fallbackLocation.city ?? "",
    state: typeof location?.state === "string" ? location.state.trim() : fallbackLocation.state ?? "",
    country: typeof location?.country === "string" ? location.country.trim() : fallbackLocation.country ?? "",
  };
}

function normalizeProjectSections(sections) {
  if (!Array.isArray(sections)) {
    return [];
  }

  return sections
    .map((section) => ({
      id:
        typeof section?.id === "string" && section.id.trim()
          ? section.id.trim()
          : `section-${crypto.randomUUID()}`,
      title: typeof section?.title === "string" ? section.title.trim() : "",
      body: sanitizeProjectRichText(section?.body),
    }))
    .filter((section) => section.title || section.body);
}

function normalizeProjectGallery(gallery, fallbackImage = "") {
  if (typeof gallery === "string") {
    if (!gallery.trim()) {
      return fallbackImage ? [createProjectGalleryItem(fallbackImage)] : [];
    }

    try {
      return normalizeProjectGallery(JSON.parse(gallery), fallbackImage);
    } catch {
      return [createProjectGalleryItem(gallery.trim())];
    }
  }

  if (!Array.isArray(gallery)) {
    return fallbackImage ? [createProjectGalleryItem(fallbackImage)] : [];
  }

  return gallery
    .map((item) => {
      if (typeof item === "string") {
        const url = item.trim();
        return url ? createProjectGalleryItem(url) : null;
      }

      const url = typeof item?.url === "string" ? item.url.trim() : "";
      if (!url) {
        return null;
      }

      return {
        id:
          typeof item?.id === "string" && item.id.trim()
            ? item.id.trim()
            : `gallery-${crypto.randomUUID()}`,
        url,
        alt: typeof item?.alt === "string" ? item.alt.trim() : "",
      };
    })
    .filter(Boolean);
}

function normalizeProjectStatus(status) {
  if (typeof status !== "string") {
    return PROJECT_STATUSES[0];
  }

  const normalized = status.trim().toLowerCase();

  if (normalized === "ongoing construction" || normalized === "ongoing") {
    return "Ongoing";
  }

  if (normalized === "completed" || normalized === "published") {
    return "Completed";
  }

  if (normalized === "on hold" || normalized === "draft") {
    return "On Hold";
  }

  return PROJECT_STATUSES.includes(status.trim()) ? status.trim() : PROJECT_STATUSES[0];
}

function normalizeProjectRecord(project) {
  const location = normalizeProjectLocation(project.location);
  const gallery = normalizeProjectGallery(project.gallery, project.image);

  return {
    id: project.id,
    title: typeof project.title === "string" ? project.title.trim() : "",
    category: typeof project.category === "string" ? project.category.trim() : "",
    location,
    status: normalizeProjectStatus(project.status),
    description: sanitizeProjectRichText(project.description ?? project.summary),
    sections: normalizeProjectSections(project.sections),
    gallery,
    createdAt: project.createdAt ?? project.updatedAt ?? new Date().toISOString(),
    updatedAt: project.updatedAt ?? project.createdAt ?? new Date().toISOString(),
  };
}

function formatProjectLocation(location) {
  return [location?.city, location?.state, location?.country].filter(Boolean).join(", ");
}

async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(DEFAULT_CONTENT, null, 2));
  }
}

export async function readContent() {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  const parsed = JSON.parse(raw || "{}");

  if (Object.keys(parsed).length === 0) {
    await fs.writeFile(DATA_FILE, JSON.stringify(DEFAULT_CONTENT, null, 2));
    return DEFAULT_CONTENT;
  }

  const normalizedProjects = (parsed.projects ?? []).map(normalizeProjectRecord);
  const storedCategories = ensureProjectCategoryRecords(parsed.projectCategories ?? []);
  const derivedCategories = normalizedProjects
    .map((project) => project.category)
    .filter(Boolean)
    .map((name) => ({ name }));

  return {
    ...parsed,
    projects: normalizedProjects,
    projectCategories: ensureProjectCategoryRecords([
      ...DEFAULT_PROJECT_CATEGORIES,
      ...storedCategories,
      ...derivedCategories,
    ]),
  };
}

async function writeContent(content) {
  await fs.writeFile(DATA_FILE, JSON.stringify(content, null, 2));
}

function sanitizeValue(field, value) {
  if (field.type === "number") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function sanitizeRecord(entityKey, payload, existingItem = {}) {
  const config = ENTITY_CONFIGS[entityKey];
  const record = {};

  for (const field of config.fields) {
    const incoming = payload[field.name];
    const fallback = existingItem[field.name] ?? "";
    const value = incoming === undefined ? fallback : incoming;
    record[field.name] = sanitizeValue(field, value);
  }

  return record;
}

function validateProjectPayload(payload) {
  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  const category = typeof payload.category === "string" ? payload.category.trim() : "";
  const description = sanitizeProjectRichText(payload.description);
  const location = normalizeProjectLocation(payload.location);
  const status = normalizeProjectStatus(payload.status);

  const errors = {};

  if (!title) {
    errors.title = "Project title is required.";
  }

  if (!category) {
    errors.category = "Select a category for this project.";
  }

  if (!location.city) {
    errors.city = "City is required.";
  }

  if (!location.state) {
    errors.state = "State is required.";
  }

  if (!location.country) {
    errors.country = "Country is required.";
  }

  if (!description) {
    errors.description = "Project description is required.";
  }

  if (!PROJECT_STATUSES.includes(status)) {
    errors.status = "Select a valid project status.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    normalized: {
      title,
      category,
      location,
      status,
      description,
      sections: normalizeProjectSections(payload.sections),
      gallery: normalizeProjectGallery(payload.gallery),
    },
  };
}

export async function getEntityBundle(entityKey) {
  const content = await readContent();
  return {
    config: ENTITY_CONFIGS[entityKey],
    items: [...(content[entityKey] ?? [])].sort((left, right) => {
      return new Date(right.updatedAt ?? 0).getTime() - new Date(left.updatedAt ?? 0).getTime();
    }),
  };
}

export async function getProjectsBundle() {
  const content = await readContent();
  const items = [...(content.projects ?? [])].sort((left, right) => {
    return new Date(right.updatedAt ?? 0).getTime() - new Date(left.updatedAt ?? 0).getTime();
  });

  return {
    config: ENTITY_CONFIGS.projects,
    items,
    categories: content.projectCategories ?? [],
  };
}

export async function getProjectById(id) {
  const content = await readContent();
  return (content.projects ?? []).find((project) => project.id === id) ?? null;
}

export async function saveEntityItem(entityKey, payload) {
  const content = await readContent();
  const currentItems = content[entityKey] ?? [];
  const existingItem = currentItems.find((item) => item.id === payload.id);
  const timestamp = new Date().toISOString();
  const normalized = sanitizeRecord(entityKey, payload, existingItem);
  const item = {
    ...existingItem,
    ...normalized,
    id: existingItem?.id ?? `${entityKey.slice(0, -1) || entityKey}-${crypto.randomUUID()}`,
    updatedAt: timestamp,
  };

  content[entityKey] = existingItem
    ? currentItems.map((currentItem) => (currentItem.id === item.id ? item : currentItem))
    : [item, ...currentItems];

  await writeContent(content);
  return item;
}

export async function saveProject(payload) {
  const content = await readContent();
  const currentItems = content.projects ?? [];
  const existingItem = currentItems.find((item) => item.id === payload.id);
  const validation = validateProjectPayload(payload);

  if (!validation.valid) {
    return {
      ok: false,
      errors: validation.errors,
      message: "Please fix the highlighted project fields.",
    };
  }

  const timestamp = new Date().toISOString();
  const item = {
    id: existingItem?.id ?? `project-${crypto.randomUUID()}`,
    ...validation.normalized,
    createdAt: existingItem?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };

  content.projects = existingItem
    ? currentItems.map((currentItem) => (currentItem.id === item.id ? item : currentItem))
    : [item, ...currentItems];

  content.projectCategories = ensureProjectCategoryRecords([
    ...(content.projectCategories ?? []),
    { name: item.category },
  ]);

  await writeContent(content);

  return {
    ok: true,
    item,
    message: `${ENTITY_CONFIGS.projects.singular} saved successfully.`,
  };
}

export async function removeEntityItem(entityKey, id) {
  const content = await readContent();
  content[entityKey] = (content[entityKey] ?? []).filter((item) => item.id !== id);
  await writeContent(content);
}

export async function removeProject(id) {
  const content = await readContent();
  content.projects = (content.projects ?? []).filter((item) => item.id !== id);
  await writeContent(content);
}

export async function saveProjectCategory(payload) {
  const content = await readContent();
  const name = typeof payload?.name === "string" ? payload.name.trim() : "";

  if (!name) {
    return {
      ok: false,
      message: "Category name is required.",
      errors: { name: "Category name is required." },
    };
  }

  const currentCategories = ensureProjectCategoryRecords(content.projectCategories ?? []);
  const existingCategory = currentCategories.find((category) => category.id === payload.id);
  const duplicate = currentCategories.find(
    (category) =>
      category.name.toLowerCase() === name.toLowerCase() &&
      category.id !== payload.id,
  );

  if (duplicate) {
    return {
      ok: false,
      message: "A category with this name already exists.",
      errors: { name: "Choose a unique category name." },
    };
  }

  const category = existingCategory
    ? { ...existingCategory, name }
    : { id: `project-category-${crypto.randomUUID()}`, name };

  content.projectCategories = existingCategory
    ? currentCategories.map((current) => (current.id === category.id ? category : current))
    : [...currentCategories, category];

  if (existingCategory && existingCategory.name !== category.name) {
    content.projects = (content.projects ?? []).map((project) =>
      project.category === existingCategory.name
        ? { ...project, category: category.name, updatedAt: new Date().toISOString() }
        : project,
    );
  }

  await writeContent(content);

  return {
    ok: true,
    item: category,
    message: "Project category saved.",
  };
}

export async function deleteProjectCategory(id) {
  const content = await readContent();
  const categories = ensureProjectCategoryRecords(content.projectCategories ?? []);
  const category = categories.find((item) => item.id === id);

  if (!category) {
    return {
      ok: false,
      message: "Category not found.",
    };
  }

  content.projectCategories = categories.filter((item) => item.id !== id);
  content.projects = (content.projects ?? []).map((project) =>
    project.category === category.name
      ? { ...project, category: "", updatedAt: new Date().toISOString() }
      : project,
  );

  await writeContent(content);

  return {
    ok: true,
    message: "Project category deleted.",
  };
}

function labelForItem(entityKey, item) {
  const config = ENTITY_CONFIGS[entityKey];
  return item[config.titleField] || config.singular;
}

export async function getDashboardData() {
  const content = await readContent();
  const projects = content.projects ?? [];
  const vacancies = content.vacancies ?? [];
  const messages = content.messages ?? [];
  const appointments = content.appointments ?? [];

  const stats = [
    {
      title: "Total Projects",
      value: projects.length,
      trend: `${projects.filter((item) => item.status === "Ongoing").length} ongoing right now`,
      href: "/projects",
    },
    {
      title: "Active Vacancies",
      value: vacancies.filter((item) => item.status === "active").length,
      trend: `${vacancies.length} roles in the pipeline`,
      href: "/vacancies",
    },
    {
      title: "New Messages",
      value: messages.filter((item) => item.status === "new").length,
      trend: `${messages.length} messages tracked`,
      href: "/messages",
    },
    {
      title: "Appointments",
      value: appointments.length,
      trend: `${appointments.filter((item) => item.status !== "completed").length} upcoming or active`,
      href: "/appointments",
    },
  ];

  const activity = ENTITY_ORDER.flatMap((entityKey) =>
    (content[entityKey] ?? []).map((item) => ({
      entityKey,
      label: ENTITY_CONFIGS[entityKey].label,
      action: `Updated ${ENTITY_CONFIGS[entityKey].singular.toLowerCase()}`,
      target: labelForItem(entityKey, item),
      time: item.updatedAt ?? "",
      href: ENTITY_CONFIGS[entityKey].route,
    }))
  )
    .sort((left, right) => new Date(right.time).getTime() - new Date(left.time).getTime())
    .slice(0, 6);

  const quickActions = ENTITY_ORDER
    .filter((key) => !ENTITY_CONFIGS[key].readOnly)
    .slice(0, 6)
    .map((entityKey) => ({
      label: `New ${ENTITY_CONFIGS[entityKey].singular}`,
      href: ENTITY_CONFIGS[entityKey].route,
      helper: ENTITY_CONFIGS[entityKey].label,
    }));

  const recentMessages = messages
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
    .slice(0, 5);

  const upcomingAppointments = appointments
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
    .slice(0, 4);

  return {
    stats,
    activity,
    quickActions,
    recentMessages,
    upcomingAppointments,
  };
}

export { formatProjectLocation };
