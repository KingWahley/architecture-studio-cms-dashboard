"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  GripVertical,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { saveProjectAction, uploadFile } from "@/app/actions/content";
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

export default function ProjectForm({ project, categories }) {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [draft, setDraft] = useState(() => normalizeProject(project));
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState("");
  const [isPending, startSaving] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [draggedGalleryId, setDraggedGalleryId] = useState(null);
  const categoryOptions = useMemo(() => categories.map((category) => category.name), [categories]);
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

  return (
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
                  <p className="text-xs text-text-secondary">
                    Create new category 
                  </p>
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
                  <CardDescription>U</CardDescription>
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

                  <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface">Alt Text</label>
                      <Textarea value={item.alt} onChange={(event) => updateGalleryItem(item.id, "alt", event.target.value)} placeholder="Describe the image for accessibility" className="min-h-24" />
                    </div>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
