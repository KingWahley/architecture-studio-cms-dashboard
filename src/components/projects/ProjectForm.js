"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  GripVertical,
  LoaderCircle,
  Plus,
  Save,
  Settings2,
  Trash2,
  Upload,
} from "lucide-react";
import {
  deleteProjectCategoryAction,
  saveProjectAction,
  saveProjectCategoryAction,
  uploadFile,
} from "@/app/actions/content";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { PROJECT_STATUSES } from "@/lib/content-schema";
import { cn } from "@/lib/utils";
import RichTextEditor from "./RichTextEditor";

function createEmptyProject() {
  return {
    id: "new",
    title: "",
    category: "",
    location: {
      city: "",
      state: "",
      country: "",
    },
    status: PROJECT_STATUSES[0],
    description: "",
    sections: [],
    gallery: [],
    createdAt: "",
    updatedAt: "",
  };
}

function normalizeProject(project) {
  const base = createEmptyProject();

  return {
    ...base,
    ...project,
    location: {
      ...base.location,
      ...(project?.location ?? {}),
    },
    sections: Array.isArray(project?.sections) ? project.sections : [],
    gallery: Array.isArray(project?.gallery) ? project.gallery : [],
  };
}

function validateProject(draft) {
  const errors = {};

  if (!draft.title.trim()) {
    errors.title = "Project title is required.";
  }

  if (!draft.category.trim()) {
    errors.category = "Choose a project category.";
  }

  if (!draft.location.city.trim()) {
    errors.city = "City is required.";
  }

  if (!draft.location.state.trim()) {
    errors.state = "State is required.";
  }

  if (!draft.location.country.trim()) {
    errors.country = "Country is required.";
  }

  if (!draft.description.trim()) {
    errors.description = "Project description is required.";
  }

  draft.sections.forEach((section, index) => {
    if (!section.title.trim() && section.body.replace(/<[^>]+>/g, "").trim()) {
      errors[`section-title-${index}`] = "Section title is required when body text is present.";
    }
  });

  return errors;
}

function moveItem(items, fromIndex, toIndex) {
  const nextItems = [...items];
  const [item] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, item);
  return nextItems;
}

function stripHtml(value) {
  return String(value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function ProjectForm({ project, categories }) {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [draft, setDraft] = useState(() => normalizeProject(project));
  const [projectCategories, setProjectCategories] = useState(categories);
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState("");
  const [isPending, startSaving] = useTransition();
  const [isCategoryPending, startCategoryTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [draggedGalleryId, setDraggedGalleryId] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [categoryDraft, setCategoryDraft] = useState({ id: null, name: "" });
  const [categoryError, setCategoryError] = useState("");
  const categoryOptions = useMemo(
    () => projectCategories.map((category) => category.name),
    [projectCategories],
  );
  const projectSummary = stripHtml(draft.description);
  const previewLocation = [draft.location.city, draft.location.state, draft.location.country]
    .filter(Boolean)
    .join(", ");
  const isNew = draft.id === "new";

  const updateField = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const updateLocationField = (field, value) => {
    setDraft((current) => ({
      ...current,
      location: {
        ...current.location,
        [field]: value,
      },
    }));
  };

  const updateSection = (sectionId, field, value) => {
    setDraft((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === sectionId ? { ...section, [field]: value } : section,
      ),
    }));
  };

  const addSection = () => {
    setDraft((current) => ({
      ...current,
      sections: [
        ...current.sections,
        { id: `section-${crypto.randomUUID()}`, title: "", body: "" },
      ],
    }));
  };

  const removeSection = (sectionId) => {
    setDraft((current) => ({
      ...current,
      sections: current.sections.filter((section) => section.id !== sectionId),
    }));
  };

  const updateGalleryItem = (galleryId, field, value) => {
    setDraft((current) => ({
      ...current,
      gallery: current.gallery.map((item) =>
        item.id === galleryId ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const removeGalleryItem = (galleryId) => {
    setDraft((current) => ({
      ...current,
      gallery: current.gallery.filter((item) => item.id !== galleryId),
    }));
  };

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    setIsUploading(true);
    setFeedback("Uploading gallery images...");

    try {
      const uploaded = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const result = await uploadFile(formData);
        uploaded.push({
          id: `gallery-${crypto.randomUUID()}`,
          url: result.url,
          alt: file.name.replace(/\.[^.]+$/, ""),
        });
      }

      setDraft((current) => ({
        ...current,
        gallery: [...current.gallery, ...uploaded],
      }));
      setFeedback(`${uploaded.length} image${uploaded.length > 1 ? "s" : ""} uploaded.`);
    } catch (error) {
      setFeedback(error.message || "Upload failed.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSave = () => {
    const validationErrors = validateProject(draft);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setFeedback("Please fix the highlighted project fields.");
      return;
    }

    setFeedback("");
    startSaving(async () => {
      const result = await saveProjectAction({
        id: isNew ? undefined : draft.id,
        ...draft,
      });

      if (!result.ok) {
        setErrors(result.errors ?? {});
        setFeedback(result.message);
        return;
      }

      setErrors({});
      setFeedback(result.message);
      setDraft(normalizeProject(result.item));

      if (isNew) {
        router.replace(`/projects/${result.item.id}`);
      } else {
        router.refresh();
      }
    });
  };

  const handleDrop = (targetId) => {
    if (!draggedGalleryId || draggedGalleryId === targetId) {
      return;
    }

    setDraft((current) => {
      const fromIndex = current.gallery.findIndex((item) => item.id === draggedGalleryId);
      const toIndex = current.gallery.findIndex((item) => item.id === targetId);

      if (fromIndex === -1 || toIndex === -1) {
        return current;
      }

      return {
        ...current,
        gallery: moveItem(current.gallery, fromIndex, toIndex),
      };
    });
  };

  const handleSaveCategory = () => {
    const name = categoryDraft.name.trim();

    if (!name) {
      setCategoryError("Category name is required.");
      return;
    }

    setCategoryError("");

    startCategoryTransition(async () => {
      const result = await saveProjectCategoryAction(categoryDraft);

      if (!result.ok) {
        setCategoryError(result.errors?.name || result.message);
        return;
      }

      setProjectCategories((current) => {
        const existingIndex = current.findIndex((category) => category.id === result.item.id);

        if (existingIndex === -1) {
          return [...current, result.item].sort((left, right) => left.name.localeCompare(right.name));
        }

        const nextCategories = [...current];
        nextCategories[existingIndex] = result.item;
        return nextCategories.sort((left, right) => left.name.localeCompare(right.name));
      });
      setDraft((current) => ({
        ...current,
        category: result.item.name,
      }));
      setCategoryDraft({ id: null, name: "" });
      setFeedback(result.message);
      router.refresh();
    });
  };

  const handleDeleteCategory = (category) => {
    if (
      !window.confirm(
        `Delete ${category.name}? Projects using this category will be left uncategorized.`,
      )
    ) {
      return;
    }

    setCategoryError("");

    startCategoryTransition(async () => {
      const result = await deleteProjectCategoryAction(category.id);

      if (!result.ok) {
        setCategoryError(result.message);
        return;
      }

      setProjectCategories((current) =>
        current.filter((currentCategory) => currentCategory.id !== category.id),
      );
      setDraft((current) =>
        current.category === category.name
          ? {
              ...current,
              category: "",
            }
          : current,
      );
      if (categoryDraft.id === category.id) {
        setCategoryDraft({ id: null, name: "" });
      }
      setFeedback(result.message);
      router.refresh();
    });
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Link href="/projects" className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-accent-deep-blue">
              <ArrowLeft size={16} />
              Back to projects
            </Link>
            <div>
              <h1 className="text-3xl font-display font-semibold text-accent-deep-blue">
                {isNew ? "Add New Project" : draft.title || "Edit Project"}
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-text-secondary">
                Build project pages with structured location data, a rich description, modular content sections, and an ordered gallery.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" onClick={() => router.push("/projects")} disabled={isPending || isUploading}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsPreviewOpen(true)}
              disabled={isPending || isUploading}
              className="gap-2"
            >
              <Eye size={16} />
              Preview
            </Button>
            <Button onClick={handleSave} disabled={isPending || isUploading} className="gap-2">
              {isPending ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
              {isPending ? "Saving..." : "Save Project"}
            </Button>
          </div>
        </div>

        {feedback ? (
          <div className={cn(
            "rounded-2xl border px-4 py-3 text-sm",
            Object.keys(errors).length > 0
              ? "border-error/20 bg-error/10 text-error"
              : "border-status-active/20 bg-status-active/10 text-status-active",
          )}>
            {feedback}
          </div>
        ) : null}

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,0.9fr)]">
          <div className="space-y-8">
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border-subtle bg-surface-main/80">
                <CardTitle>Core Details</CardTitle>
                <CardDescription>Define the project identity and where it lives.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface">Project Title</label>
                  <Input
                    value={draft.title}
                    onChange={(event) => updateField("title", event.target.value)}
                    placeholder="Enter project title"
                    className="h-11"
                  />
                  {errors.title ? <p className="text-sm text-error">{errors.title}</p> : null}
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface">City</label>
                    <Input value={draft.location.city} onChange={(event) => updateLocationField("city", event.target.value)} placeholder="City" className="h-11" />
                    {errors.city ? <p className="text-sm text-error">{errors.city}</p> : null}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface">State</label>
                    <Input value={draft.location.state} onChange={(event) => updateLocationField("state", event.target.value)} placeholder="State" className="h-11" />
                    {errors.state ? <p className="text-sm text-error">{errors.state}</p> : null}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface">Country</label>
                    <Input value={draft.location.country} onChange={(event) => updateLocationField("country", event.target.value)} placeholder="Country" className="h-11" />
                    {errors.country ? <p className="text-sm text-error">{errors.country}</p> : null}
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface">Project Category</label>
                    <select
                      value={draft.category}
                      onChange={(event) => updateField("category", event.target.value)}
                      className="flex h-11 w-full rounded-md border border-border-subtle bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-deep-blue"
                    >
                      <option value="">Select a category</option>
                      {categoryOptions.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    {errors.category ? <p className="text-sm text-error">{errors.category}</p> : null}
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto justify-start px-0 py-0 text-xs"
                      onClick={() => setIsCategoryModalOpen(true)}
                    >
                      <Settings2 size={12} />
                      Create new category
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface">Project Status</label>
                    <select
                      value={draft.status}
                      onChange={(event) => updateField("status", event.target.value)}
                      className="flex h-11 w-full rounded-md border border-border-subtle bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-deep-blue"
                    >
                      {PROJECT_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border-subtle bg-surface-main/80">
                <CardTitle>Main Description</CardTitle>
                <CardDescription>Use rich text for the primary project narrative.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <RichTextEditor
                  label="Description"
                  value={draft.description}
                  onChange={(nextValue) => updateField("description", nextValue)}
                  placeholder="Describe the project, client brief, delivery scope, and core design thinking."
                  error={errors.description}
                />
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border-subtle bg-surface-main/80">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Additional Description Sections</CardTitle>
                    <CardDescription>Add modular storytelling blocks for process, outcomes, and project notes.</CardDescription>
                  </div>
                  <Button type="button" onClick={addSection} className="gap-2">
                    <Plus size={16} />
                    Add Section
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 p-6">
                {draft.sections.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border-subtle bg-surface-alt/60 px-5 py-8 text-center text-sm text-text-secondary">
                    No extra sections yet. Add one for design rationale, implementation details, or outcomes.
                  </div>
                ) : null}

                {draft.sections.map((section, index) => (
                  <div key={section.id} className="rounded-3xl border border-border-subtle bg-surface-alt/40 p-5">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Section {index + 1}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        className="gap-2 text-error hover:bg-error/10 hover:text-error"
                        onClick={() => removeSection(section.id)}
                      >
                        <Trash2 size={16} />
                        Remove
                      </Button>
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-on-surface">Section Title</label>
                        <Input
                          value={section.title}
                          onChange={(event) => updateSection(section.id, "title", event.target.value)}
                          placeholder="Enter section title"
                          className="h-11"
                        />
                        {errors[`section-title-${index}`] ? (
                          <p className="text-sm text-error">{errors[`section-title-${index}`]}</p>
                        ) : null}
                      </div>

                      <RichTextEditor
                        label="Section Body"
                        value={section.body}
                        onChange={(nextValue) => updateSection(section.id, "body", nextValue)}
                        placeholder="Add supporting narrative for this section."
                        minHeightClassName="min-h-[180px]"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border-subtle bg-surface-main/80">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Project Gallery</CardTitle>
                    <CardDescription>Upload project images</CardDescription>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="gap-2"
                    >
                      {isUploading ? <LoaderCircle size={16} className="animate-spin" /> : <Upload size={16} />}
                      Upload
                    </Button>
                    <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {draft.gallery.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border-subtle bg-surface-alt/60 px-5 py-8 text-center text-sm text-text-secondary">
                    No gallery items yet. Upload local image files to build the gallery.
                  </div>
                ) : null}

                {draft.gallery.map((item, index) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => setDraggedGalleryId(item.id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleDrop(item.id)}
                    onDragEnd={() => setDraggedGalleryId(null)}
                    className={cn(
                      "rounded-3xl border border-border-subtle bg-surface-alt/40 p-4",
                      draggedGalleryId === item.id && "opacity-60",
                    )}
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 text-sm font-medium text-text-secondary">
                        <GripVertical size={16} />
                        Gallery item {index + 1}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        className="gap-2 text-error hover:bg-error/10 hover:text-error"
                        onClick={() => removeGalleryItem(item.id)}
                      >
                        <Trash2 size={16} />
                        Remove
                      </Button>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-main">
                      {item.url ? (
                        <img src={item.url} alt={item.alt || `Project gallery ${index + 1}`} className="aspect-[4/3] w-full object-cover" />
                      ) : (
                        <div className="flex aspect-[4/3] items-center justify-center text-sm text-text-secondary">
                          Upload a local image file
                        </div>
                    )}
                  </div>
                </div>
              ))}
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border-subtle bg-surface-main/80">
                <CardTitle>Publishing Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6 text-sm text-text-secondary">
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-surface-alt/60 px-4 py-3">
                  <span>Status</span>
                  <span className="font-semibold text-on-surface">{draft.status}</span>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-surface-alt/60 px-4 py-3">
                  <span>Category</span>
                  <span className="font-semibold text-on-surface">{draft.category || "Unassigned"}</span>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-surface-alt/60 px-4 py-3">
                  <span>Gallery Items</span>
                  <span className="font-semibold text-on-surface">{draft.gallery.length}</span>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-surface-alt/60 px-4 py-3">
                  <span>Extra Sections</span>
                  <span className="font-semibold text-on-surface">{draft.sections.length}</span>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full gap-2"
                  onClick={() => setIsPreviewOpen(true)}
                >
                  <Eye size={16} />
                  Open Project Preview
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {isPreviewOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[radial-gradient(circle_at_top,#315b9d_0%,#18202b_45%,#101318_100%)] px-4 py-8 backdrop-blur-sm">
          <div className="mx-auto flex min-h-full w-full max-w-6xl items-center justify-center">
            <Card className="w-full overflow-hidden border-white/10 bg-white/95 shadow-[0_40px_120px_rgba(0,0,0,0.4)]">
              <CardHeader className="border-b border-border-subtle bg-white/90">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent-deep-blue/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent-deep-blue">
                      <Eye size={12} />
                      Live Preview
                    </div>
                    <CardTitle className="text-2xl text-accent-deep-blue">
                      {draft.title || "Untitled Project"}
                    </CardTitle>
                    <CardDescription className="mt-2 text-sm">
                      Review this project as a presentation card before saving.
                    </CardDescription>
                  </div>
                  <Button variant="ghost" onClick={() => setIsPreviewOpen(false)}>
                    Close
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="grid lg:grid-cols-[1.25fr_0.75fr]">
                  <div className="relative overflow-hidden bg-[linear-gradient(135deg,#102038_0%,#315b9d_52%,#c6972a_100%)] p-8 text-white sm:p-10">
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute -left-16 top-10 h-40 w-40 rounded-full bg-white blur-3xl" />
                      <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-accent-muted-gold blur-3xl" />
                    </div>

                    <div className="relative space-y-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                          {draft.status}
                        </span>
                        {draft.category ? (
                          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                            {draft.category}
                          </span>
                        ) : null}
                      </div>

                      <div className="max-w-2xl space-y-4">
                        <h2 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
                          {draft.title || "Untitled Project"}
                        </h2>
                        <p className="max-w-xl text-sm leading-7 text-white/80 sm:text-base">
                          {projectSummary || "Add a project description to see the preview summary here."}
                        </p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Location</p>
                          <p className="mt-3 text-lg font-medium">{previewLocation || "City, State, Country"}</p>
                        </div>
                        <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Story Blocks</p>
                          <p className="mt-3 text-lg font-medium">{draft.sections.length} curated section{draft.sections.length === 1 ? "" : "s"}</p>
                        </div>
                      </div>

                      {draft.gallery[0]?.url ? (
                        <div className="overflow-hidden rounded-[2rem] border border-white/15 bg-black/10 shadow-2xl">
                          <img
                            src={draft.gallery[0].url}
                            alt={draft.title || "Project preview"}
                            className="aspect-[16/10] w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex aspect-[16/10] items-center justify-center rounded-[2rem] border border-dashed border-white/20 bg-white/5 text-sm text-white/70">
                          Upload project images to bring this preview to life.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6 bg-surface-main p-8 sm:p-10">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Preview Notes</p>
                      <h3 className="mt-3 font-display text-2xl font-semibold text-on-surface">
                        Project Snapshot
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {draft.sections.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-border-subtle bg-surface-alt/60 p-5 text-sm text-text-secondary">
                          Additional description sections will appear here once they are added.
                        </div>
                      ) : null}

                      {draft.sections.slice(0, 3).map((section) => (
                        <div key={section.id} className="rounded-3xl border border-border-subtle bg-surface-alt/45 p-5">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">
                            Section
                          </p>
                          <h4 className="mt-3 text-lg font-semibold text-on-surface">
                            {section.title || "Untitled Section"}
                          </h4>
                          <p className="mt-3 text-sm leading-7 text-text-secondary">
                            {stripHtml(section.body) || "Add body content to preview this section."}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-3xl border border-border-subtle bg-surface-alt/45 p-5">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold text-on-surface">Gallery</p>
                        <span className="text-xs text-text-secondary">{draft.gallery.length} image{draft.gallery.length === 1 ? "" : "s"}</span>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-3">
                        {draft.gallery.slice(0, 6).map((item) => (
                          <div key={item.id} className="overflow-hidden rounded-2xl border border-border-subtle bg-white">
                            <img
                              src={item.url}
                              alt={draft.title || "Project gallery preview"}
                              className="aspect-square w-full object-cover"
                            />
                          </div>
                        ))}
                        {draft.gallery.length === 0 ? (
                          <div className="col-span-3 rounded-2xl border border-dashed border-border-subtle px-4 py-6 text-center text-sm text-text-secondary">
                            No images uploaded yet.
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
      {isCategoryModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-alt/85 px-4 py-8 backdrop-blur-sm">
          <Card className="max-h-[90vh] w-full max-w-3xl overflow-hidden">
            <CardHeader className="border-b border-border-subtle bg-surface-main/90">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>Project Categories</CardTitle>
                  <CardDescription>Add, rename, or remove categories without leaving the editor.</CardDescription>
                </div>
                <Button variant="ghost" onClick={() => setIsCategoryModalOpen(false)}>
                  Close
                </Button>
              </div>
            </CardHeader>

            <CardContent className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)]">
              <div className="space-y-3">
                {projectCategories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border-subtle bg-surface-alt/50 px-4 py-3">
                    <div>
                      <p className="font-medium text-on-surface">{category.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setCategoryDraft({ id: category.id, name: category.name });
                          setCategoryError("");
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="hover:border-error/30 hover:text-error"
                        onClick={() => handleDeleteCategory(category)}
                        disabled={isCategoryPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border border-border-subtle bg-surface-alt/40 p-5">
                <p className="text-lg font-display font-semibold text-on-surface">
                  {categoryDraft.id ? "Edit Category" : "Add Category"}
                </p>
                <p className="mt-2 text-sm text-text-secondary">
                  New categories become available in the dropdown immediately after saving.
                </p>

                <div className="mt-5 space-y-3">
                  <label className="text-sm font-medium text-on-surface">Category Name</label>
                  <Input
                    value={categoryDraft.name}
                    onChange={(event) => setCategoryDraft((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Enter category name"
                    className="h-11"
                  />
                  {categoryError ? <p className="text-sm text-error">{categoryError}</p> : null}
                </div>

                <div className="mt-5 flex gap-3">
                  <Button onClick={handleSaveCategory} disabled={isCategoryPending}>
                    {categoryDraft.id ? "Update Category" : "Save Category"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setCategoryDraft({ id: null, name: "" });
                      setCategoryError("");
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  );
}
