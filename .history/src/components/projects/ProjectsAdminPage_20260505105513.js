"use client";

import { useDeferredValue, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  FolderKanban,
  Pencil,
  Plus,
  Search,
  Settings2,
  Trash2,
} from "lucide-react";
import { deleteProjectAction, deleteProjectCategoryAction, saveProjectCategoryAction } from "@/app/actions/content";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { PROJECT_STATUSES } from "@/lib/content-schema";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

function formatDate(value) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatLocation(location) {
  return [location?.city, location?.state, location?.country].filter(Boolean).join(", ") || "N/A";
}

function getStatusVariant(status) {
  return status === "On Hold" ? "draft" : status.toLowerCase();
}

export default function ProjectsAdminPage({ items, categories }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState("");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryDraft, setCategoryDraft] = useState({ id: null, name: "" });
  const [categoryError, setCategoryError] = useState("");
  const deferredQuery = useDeferredValue(query);

  const categoryOptions = useMemo(() => categories.map((category) => category.name), [categories]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    return items.filter((item) => {
      const matchesQuery =
        !normalizedQuery ||
        [item.title, item.category, item.status, formatLocation(item.location)]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;

      return matchesQuery && matchesStatus && matchesCategory;
    });
  }, [items, deferredQuery, statusFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = filteredItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const stats = useMemo(() => {
    const ongoingCount = items.filter((item) => item.status === "Ongoing").length;
    const completedCount = items.filter((item) => item.status === "Completed").length;

    return [
      { label: "Total Projects", value: items.length, helper: "All tracked portfolio entries" },
      { label: "Ongoing", value: ongoingCount, helper: "Currently in active delivery" },
      { label: "Completed", value: completedCount, helper: "Closed and ready to showcase" },
      { label: "Categories", value: categories.length, helper: "Reusable project groupings" },
    ];
  }, [items, categories]);

  const handleDeleteProject = (projectId, projectTitle) => {
    if (!window.confirm(`Delete ${projectTitle}? This cannot be undone.`)) {
      return;
    }

    setFeedback("");
    startTransition(async () => {
      const result = await deleteProjectAction(projectId);
      setFeedback(result.message);
    });
  };

  const handleSaveCategory = () => {
    const name = categoryDraft.name.trim();

    if (!name) {
      setCategoryError("Category name is required.");
      return;
    }

    setCategoryError("");
    setFeedback("");

    startTransition(async () => {
      const result = await saveProjectCategoryAction(categoryDraft);

      if (!result.ok) {
        setCategoryError(result.errors?.name || result.message);
        return;
      }

      setFeedback(result.message);
      setCategoryDraft({ id: null, name: "" });
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
    setFeedback("");

    startTransition(async () => {
      const result = await deleteProjectCategoryAction(category.id);
      setFeedback(result.message);
      if (categoryDraft.id === category.id) {
        setCategoryDraft({ id: null, name: "" });
      }
    });
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent-deep-blue/15 bg-accent-deep-blue/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent-deep-blue">
              <FolderKanban size={12} />
              Project CMS
            </div>
            <div>
              <h1 className="text-3xl font-display font-semibold text-accent-deep-blue">Projects</h1>
              <p className="mt-2 max-w-3xl text-sm text-text-secondary">
                Manage project records, categories, gallery-heavy case studies, and production-ready descriptions from one scalable admin surface.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" onClick={() => setIsCategoryModalOpen(true)} className="gap-2">
              <Settings2 size={16} />
              Manage Categories
            </Button>
            <Button asChild className="gap-2">
              <Link href="/projects/new">
                <Plus size={16} />
                Add Project
              </Link>
            </Button>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="overflow-hidden border-border-subtle/50">
              <CardContent className="p-5">
                <p className="text-sm text-text-secondary">{stat.label}</p>
                <p className="mt-3 text-3xl font-display font-semibold text-on-surface">{stat.value}</p>
                <p className="mt-2 text-xs text-text-secondary">{stat.helper}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border-subtle bg-surface-main/80">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <CardTitle>Project List</CardTitle>
                <CardDescription>Search, filter, and edit projects in a table built for larger content libraries.</CardDescription>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_180px_220px]">
                <div className="relative">
                  <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <Input
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search title, category, or location"
                    className="h-11 pl-9"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setPage(1);
                  }}
                  className="flex h-11 w-full rounded-md border border-border-subtle bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-deep-blue"
                >
                  <option value="all">All statuses</option>
                  {PROJECT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <select
                  value={categoryFilter}
                  onChange={(event) => {
                    setCategoryFilter(event.target.value);
                    setPage(1);
                  }}
                  className="flex h-11 w-full rounded-md border border-border-subtle bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-deep-blue"
                >
                  <option value="all">All categories</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 p-0">
            {feedback ? (
              <div className="mx-6 mt-6 rounded-2xl border border-status-active/20 bg-status-active/10 px-4 py-3 text-sm text-status-active">
                {feedback}
              </div>
            ) : null}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Title</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead>Date Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="px-6 py-16 text-center text-sm text-text-secondary">
                      No projects match the current search and filters.
                    </TableCell>
                  </TableRow>
                ) : null}

                {paginatedItems.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="min-w-[240px]">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 overflow-hidden rounded-2xl border border-border-subtle bg-surface-alt">
                          {project.gallery?.[0]?.url ? (
                            <img src={project.gallery[0].url} alt={project.gallery[0].alt || project.title} className="h-full w-full object-cover" />
                          ) : null}
                        </div>
                        <div>
                          <p className="font-medium text-on-surface">{project.title}</p>
                          <p className="mt-1 text-xs text-text-secondary">{project.sections.length} section{project.sections.length === 1 ? "" : "s"} . {project.gallery.length} image{project.gallery.length === 1 ? "" : "s"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatLocation(project.location)}</TableCell>
                    <TableCell>
                      <StatusBadge variant={getStatusVariant(project.status)}>{project.status}</StatusBadge>
                    </TableCell>
                    <TableCell>{project.category || "Uncategorized"}</TableCell>
                    <TableCell>{formatDate(project.createdAt)}</TableCell>
                    <TableCell>{formatDate(project.updatedAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="secondary" size="icon" asChild title="Edit project">
                          <Link href={`/projects/${project.id}`}>
                            <Pencil size={15} />
                          </Link>
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          title="Delete project"
                          className="hover:border-error/30 hover:text-error"
                          onClick={() => handleDeleteProject(project.id, project.title)}
                          disabled={isPending}
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex flex-col gap-4 border-t border-border-subtle px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-text-secondary">
                Showing {paginatedItems.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
                {" - "}
                {(currentPage - 1) * PAGE_SIZE + paginatedItems.length} of {filteredItems.length} projects
              </p>

              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={currentPage === 1}>
                  Previous
                </Button>
                <div className="rounded-xl border border-border-subtle px-4 py-2 text-sm text-text-secondary">
                  Page {currentPage} of {totalPages}
                </div>
                <Button variant="secondary" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={currentPage === totalPages}>
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isCategoryModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-alt/85 px-4 py-8 backdrop-blur-sm">
          <Card className="max-h-[90vh] w-full max-w-3xl overflow-hidden">
            <CardHeader className="border-b border-border-subtle bg-surface-main/90">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>Project Categories</CardTitle>
                  <CardDescription>Add, rename, or remove categories used in project forms and filters.</CardDescription>
                </div>
                <Button variant="ghost" onClick={() => setIsCategoryModalOpen(false)}>
                  Close
                </Button>
              </div>
            </CardHeader>

            <CardContent className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)]">
              <div className="space-y-3">
                {categories.map((category) => (
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
                        disabled={isPending}
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
                  Category changes are reflected in project filters and editor dropdowns.
                </p>

                <div className="mt-5 space-y-3">
                  <label className="text-sm font-medium text-on-surface">Category Name</label>
                  <Input value={categoryDraft.name} onChange={(event) => setCategoryDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Enter category name" className="h-11" />
                  {categoryError ? <p className="text-sm text-error">{categoryError}</p> : null}
                </div>

                <div className="mt-5 flex gap-3">
                  <Button onClick={handleSaveCategory} disabled={isPending}>
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
