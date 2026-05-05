"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { ImagePlus, Pencil, Plus, Search, Trash2, Upload, Users, X } from "lucide-react";
import { deleteContentItem, saveContentItem, uploadFile } from "@/app/actions/content";
import RichTextEditor from "@/components/projects/RichTextEditor";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

const PAGE_SIZE = 8;
const TITLE_OPTIONS = ["Mr", "Mrs", "Ms", "Miss", "Arch", "Ar.", "Engr", "Dr", "Prof"];

function formatDateTime(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function stripHtml(html) {
  if (typeof html !== "string") {
    return "";
  }

  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function sortTeamItems(items) {
  return [...items].sort((left, right) => {
    return new Date(right.updatedAt ?? 0).getTime() - new Date(left.updatedAt ?? 0).getTime();
  });
}

function createDraft(item) {
  return {
    title: item?.title ?? "",
    name: item?.name ?? "",
    designation: item?.designation ?? item?.role ?? "",
    qualifications: item?.qualifications ?? "",
    image: item?.image ?? "",
    bio: item?.bio ?? "",
  };
}

function FeedbackBanner({ feedback }) {
  if (!feedback) {
    return null;
  }

  return (
    <div
      className={
        feedback.type === "error"
          ? "rounded-2xl border border-error/25 bg-error/10 px-4 py-3 text-sm text-error"
          : "rounded-2xl border border-status-active/25 bg-status-active/10 px-4 py-3 text-sm text-status-active"
      }
    >
      {feedback.message}
    </div>
  );
}

export default function TeamAdminPage({ initialItems }) {
  const [items, setItems] = useState(() => sortTeamItems(initialItems));
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState(() => createDraft());
  const [feedback, setFeedback] = useState(null);
  const [isUploadPending, setIsUploadPending] = useState(false);
  const [isPending, startTransition] = useTransition();

  const activeItem = useMemo(() => {
    return items.find((item) => item.id === activeId) ?? null;
  }, [activeId, items]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) => {
      return [item.name, item.designation ?? item.role, item.title]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [items, query]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredItems, safeCurrentPage]);

  const stats = useMemo(() => {
    const lastUpdated = items[0]?.updatedAt ? formatDateTime(items[0].updatedAt) : "No updates yet";
    return [
      { label: "Total team members", value: items.length, helper: "Profiles currently available in the CMS" },
      { label: "Search results", value: filteredItems.length, helper: query ? `Matching "${query}"` : "All members visible" },
      { label: "Last update", value: lastUpdated, helper: "Most recently edited profile" },
    ];
  }, [filteredItems.length, items, query]);

  useEffect(() => {
    if (!activeId) {
      return undefined;
    }

    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflow;
    };
  }, [activeId]);

  const openCreateModal = () => {
    setActiveId("new");
    setDraft(createDraft());
    setFeedback(null);
  };

  const openEditModal = (item) => {
    setActiveId(item.id);
    setDraft(createDraft(item));
    setFeedback(null);
  };

  const closeModal = () => {
    setActiveId(null);
    setDraft(createDraft());
  };

  const handleChange = (field, value) => {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleUpload = async (file) => {
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setIsUploadPending(true);
    setFeedback(null);

    try {
      const result = await uploadFile(formData);
      setDraft((current) => ({
        ...current,
        image: result.url,
      }));
      setFeedback({ type: "success", message: "Profile photo uploaded successfully." });
    } catch (error) {
      setFeedback({ type: "error", message: error.message || "Photo upload failed." });
    } finally {
      setIsUploadPending(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!draft.name.trim()) {
      setFeedback({ type: "error", message: "Full name is required." });
      return;
    }

    if (!draft.designation.trim()) {
      setFeedback({ type: "error", message: "Designation is required." });
      return;
    }

    setFeedback(null);

    startTransition(async () => {
      try {
        const result = await saveContentItem({
          entityKey: "team",
          id: activeItem?.id && activeId !== "new" ? activeItem.id : undefined,
          ...draft,
        });

        setItems((current) => {
          const nextItems = current.some((item) => item.id === result.item.id)
            ? current.map((item) => (item.id === result.item.id ? result.item : item))
            : [result.item, ...current];

          return sortTeamItems(nextItems);
        });
        setFeedback({ type: "success", message: result.message });
        closeModal();
      } catch (error) {
        setFeedback({ type: "error", message: error.message || "Unable to save team member." });
      }
    });
  };

  const handleDelete = (item) => {
    if (!window.confirm(`Delete ${item.name}? This action cannot be undone.`)) {
      return;
    }

    setFeedback(null);

    startTransition(async () => {
      try {
        const result = await deleteContentItem({ entityKey: "team", id: item.id });
        setItems((current) => current.filter((entry) => entry.id !== item.id));
        if (activeId === item.id) {
          closeModal();
        }
        setFeedback({ type: "success", message: result.message });
      } catch (error) {
        setFeedback({ type: "error", message: error.message || "Unable to delete team member." });
      }
    });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-accent-deep-blue">Manage Team</h1>
            
          </div>
          <Button className="h-11 gap-2 px-5" onClick={openCreateModal}>
            <Plus size={16} />
            Add Team Member
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="overflow-hidden border-border-subtle/60">
              <CardContent className="p-5">
                <p className="text-sm text-text-secondary">{stat.label}</p>
                <p className="mt-3 font-display text-2xl font-semibold text-on-surface">{stat.value}</p>
                <p className="mt-2 text-sm text-text-secondary">{stat.helper}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <FeedbackBanner feedback={feedback} />

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border-subtle bg-surface-main/80">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Team List</CardTitle>
                <CardDescription>
                  Search, review, edit, and remove team members without leaving the page.
                </CardDescription>
              </div>
              <div className="relative w-full lg:w-[360px]">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
                />
                <Input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by name or designation"
                  className="h-11 pl-11"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 p-0">
            {filteredItems.length === 0 ? (
              <div className="m-6 rounded-3xl border border-dashed border-border-subtle bg-surface-alt/50 px-6 py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-main text-accent-deep-blue">
                  <Users size={24} />
                </div>
                <h2 className="mt-4 font-display text-xl font-semibold text-on-surface">No team members found</h2>
                <p className="mt-2 text-sm text-text-secondary">
                  Adjust the search term or add a new team member to get started.
                </p>
              </div>
            ) : (
              <>
                <Table className="min-w-[860px]">
                  <TableHeader>
                    <TableRow className="bg-surface-alt/50 hover:bg-surface-alt/50">
                      <TableHead>Photo</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Date Created</TableHead>
                      <TableHead>Date Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedItems.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-border-subtle bg-surface-alt">
                            {member.image ? (
                              <img src={member.image} alt={member.name} className="h-full w-full object-cover" />
                            ) : (
                              <ImagePlus size={18} className="text-text-secondary" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="min-w-[180px]">
                            <p className="font-medium text-on-surface">{member.name}</p>
                            <p className="mt-1 text-sm text-text-secondary">
                              {stripHtml(member.bio) || "No bio added yet."}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{member.title || "Not set"}</TableCell>
                        <TableCell>{member.designation || member.role || "Not set"}</TableCell>
                        <TableCell>{formatDateTime(member.createdAt)}</TableCell>
                        <TableCell>{formatDateTime(member.updatedAt)}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="gap-2"
                              onClick={() => openEditModal(member)}
                            >
                              <Pencil size={14} />
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="gap-2 text-error hover:bg-error/10 hover:text-error"
                              onClick={() => handleDelete(member)}
                              disabled={isPending}
                            >
                              <Trash2 size={14} />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex flex-col gap-3 border-t border-border-subtle px-6 py-4 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between">
                  <p>
                    Showing {(safeCurrentPage - 1) * PAGE_SIZE + 1}
                    {" "}to{" "}
                    {Math.min(safeCurrentPage * PAGE_SIZE, filteredItems.length)} of {filteredItems.length} team members
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setCurrentPage((page) => Math.max(1, safeCurrentPage === page ? page - 1 : safeCurrentPage - 1))}
                      disabled={safeCurrentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="rounded-full bg-surface-alt px-3 py-1 text-on-surface">
                      Page {safeCurrentPage} of {totalPages}
                    </span>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, safeCurrentPage === page ? page + 1 : safeCurrentPage + 1))}
                      disabled={safeCurrentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {activeId ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-surface-alt/90 px-4 py-8 backdrop-blur-sm">
          <div className="mx-auto flex min-h-full w-full max-w-5xl items-center">
            <Card className="w-full overflow-hidden border-accent-deep-blue/15 shadow-architectural">
              <CardHeader className="border-b border-border-subtle bg-surface-main/95">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent-deep-blue/15 bg-accent-deep-blue/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent-deep-blue">
                      <Users size={12} />
                      {activeId === "new" ? "New Profile" : "Edit Profile"}
                    </div>
                    <CardTitle className="text-2xl text-accent-deep-blue">
                      {activeId === "new" ? "Add Team Member" : `Edit ${activeItem?.name ?? "Team Member"}`}
                    </CardTitle>
                    <CardDescription className="mt-2 max-w-2xl">
                      Capture honorifics, designation, qualifications, portrait, and a rich biography in one place.
                    </CardDescription>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={closeModal} title="Close form">
                    <X size={18} />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
                    <div className="space-y-5">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <label className="block space-y-2">
                          <span className="text-sm font-medium text-on-surface">Title</span>
                          <Input
                            value={draft.title}
                            onChange={(event) => handleChange("title", event.target.value)}
                            placeholder="Mr, Mrs, Arch, Dr..."
                            list="team-title-options"
                            className="h-11"
                          />
                          <datalist id="team-title-options">
                            {TITLE_OPTIONS.map((option) => (
                              <option key={option} value={option} />
                            ))}
                          </datalist>
                        </label>

                        <label className="block space-y-2 sm:col-span-2">
                          <span className="text-sm font-medium text-on-surface">Full Name *</span>
                          <Input
                            value={draft.name}
                            onChange={(event) => handleChange("name", event.target.value)}
                            placeholder="Enter full name"
                            className="h-11"
                            required
                          />
                        </label>

                        <label className="block space-y-2 sm:col-span-2">
                          <span className="text-sm font-medium text-on-surface">Designation *</span>
                          <Input
                            value={draft.designation}
                            onChange={(event) => handleChange("designation", event.target.value)}
                            placeholder="Senior Architect, Project Manager..."
                            className="h-11"
                            required
                          />
                        </label>

                        <label className="block space-y-2 sm:col-span-2">
                          <span className="text-sm font-medium text-on-surface">Qualifications</span>
                          <Textarea
                            value={draft.qualifications}
                            onChange={(event) => handleChange("qualifications", event.target.value)}
                            placeholder="Degrees, certifications, memberships, specialties"
                            className="min-h-28"
                          />
                        </label>
                      </div>

                      <RichTextEditor
                        label="Bio"
                        value={draft.bio}
                        onChange={(value) => handleChange("bio", value)}
                        placeholder="Write a detailed profile for this team member..."
                        minHeightClassName="min-h-[260px]"
                      />
                    </div>

                    <div className="space-y-5">
                      <div className="rounded-3xl border border-border-subtle bg-surface-alt/50 p-5">
                        <p className="text-sm font-medium text-on-surface">Profile Photo</p>
                        <div className="mt-4 overflow-hidden rounded-[1.75rem] border border-border-subtle bg-surface-main">
                          {draft.image ? (
                            <img src={draft.image} alt={draft.name || "Preview"} className="aspect-[4/5] w-full object-cover" />
                          ) : (
                            <div className="flex aspect-[4/5] items-center justify-center bg-surface-alt text-text-secondary">
                              <div className="text-center">
                                <ImagePlus size={28} className="mx-auto" />
                                <p className="mt-3 text-sm">Image preview will appear here</p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 space-y-3">
                          <label className="block space-y-2">
                            <span className="text-sm font-medium text-on-surface">Photo URL</span>
                            <Input
                              value={draft.image}
                              onChange={(event) => handleChange("image", event.target.value)}
                              placeholder="Paste an image URL or upload below"
                              className="h-11"
                            />
                          </label>

                          <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border-subtle bg-surface-main px-4 text-sm font-medium text-on-surface hover:bg-surface-alt">
                            <Upload size={16} />
                            {isUploadPending ? "Uploading..." : "Upload Photo"}
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(event) => handleUpload(event.target.files?.[0])}
                              disabled={isUploadPending}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-border-subtle bg-surface-alt/40 p-5">
                        <p className="text-sm font-medium text-on-surface">Preview Summary</p>
                        <div className="mt-4 space-y-3 text-sm text-text-secondary">
                          <div className="flex items-center justify-between gap-4 rounded-2xl bg-surface-main px-4 py-3">
                            <span>Name</span>
                            <span className="font-medium text-on-surface">{draft.name || "Not set"}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 rounded-2xl bg-surface-main px-4 py-3">
                            <span>Title</span>
                            <span className="font-medium text-on-surface">{draft.title || "Not set"}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 rounded-2xl bg-surface-main px-4 py-3">
                            <span>Designation</span>
                            <span className="font-medium text-on-surface">{draft.designation || "Not set"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <FeedbackBanner feedback={feedback} />

                  <div className="flex flex-col gap-3 border-t border-border-subtle pt-5 sm:flex-row sm:items-center sm:justify-end">
                    <Button type="button" variant="ghost" onClick={closeModal}>
                      Cancel
                    </Button>
                    <Button type="submit" className="gap-2" disabled={isPending || isUploadPending}>
                      {isPending ? "Saving..." : activeId === "new" ? "Save Team Member" : "Update Team Member"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </>
  );
}
