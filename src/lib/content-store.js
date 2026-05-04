import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { ENTITY_CONFIGS, ENTITY_ORDER } from "@/lib/content-schema";

const DATA_FILE = path.join(process.cwd(), "src", "data", "content.json");

const DEFAULT_CONTENT = {
  projects: [
    {
      id: "project-1",
      title: "Lagos Marina Towers",
      category: "Commercial",
      location: "Lagos, NG",
      year: "2025",
      status: "ongoing",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop",
      summary: "Mixed-use high-rise with phased delivery and active construction oversight.",
      updatedAt: "2026-04-30T11:00:00.000Z",
    },
    {
      id: "project-2",
      title: "Ikoyi Residence",
      category: "Residential",
      location: "Lagos, NG",
      year: "2024",
      status: "completed",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop",
      summary: "Private residential build focused on light, texture, and low-maintenance detailing.",
      updatedAt: "2026-04-25T09:30:00.000Z",
    },
    {
      id: "project-3",
      title: "Victoria Island Mall",
      category: "Retail",
      location: "Lagos, NG",
      year: "2026",
      status: "draft",
      image: "https://images.unsplash.com/photo-1519567281799-9637b92f44eb?q=80&w=2070&auto=format&fit=crop",
      summary: "Concept-stage retail destination preparing for stakeholder review.",
      updatedAt: "2026-04-18T15:10:00.000Z",
    },
  ],
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

  return parsed;
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

export async function getEntityBundle(entityKey) {
  const content = await readContent();
  return {
    config: ENTITY_CONFIGS[entityKey],
    items: [...(content[entityKey] ?? [])].sort((left, right) => {
      return new Date(right.updatedAt ?? 0).getTime() - new Date(left.updatedAt ?? 0).getTime();
    }),
  };
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

export async function removeEntityItem(entityKey, id) {
  const content = await readContent();
  content[entityKey] = (content[entityKey] ?? []).filter((item) => item.id !== id);
  await writeContent(content);
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
      trend: `${projects.filter((item) => item.status === "ongoing").length} ongoing right now`,
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

  return { stats, activity, quickActions, recentMessages };
}
