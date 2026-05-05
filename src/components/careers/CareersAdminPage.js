"use client";

import { useMemo, useState, useTransition } from "react";
import { Download, Eye, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import {
  deleteApplicationAction,
  deleteVacancyAction,
  saveVacancyAction,
} from "@/app/actions/content";
import RichTextEditor from "@/components/projects/RichTextEditor";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";

const VACANCIES_PAGE_SIZE = 8;

function formatDateTime(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function stripHtml(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function sortByUpdated(items) {
  return [...items].sort((left, right) => new Date(right.updatedAt ?? 0) - new Date(left.updatedAt ?? 0));
}

function createEmptyVacancy() {
  return {
    id: "new",
    title: "",
    description: "",
    status: "open",
    skills: [],
    createdAt: "",
    updatedAt: "",
  };
}

function createSkill() {
  return {
    id: `skill-${crypto.randomUUID()}`,
    title: "",
    description: "",
  };
}

function normalizeVacancy(vacancy) {
  const base = createEmptyVacancy();

  return {
    ...base,
    ...vacancy,
    skills: Array.isArray(vacancy?.skills) ? vacancy.skills : [],
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

function TabButton({ active, children, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-full px-4 py-2 text-sm font-medium transition-colors",
        active ? "bg-accent-deep-blue text-white" : "bg-surface-main text-text-secondary hover:bg-surface-alt hover:text-on-surface",
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default function CareersAdminPage({ initialVacancies, initialApplications }) {
  const [activeTab, setActiveTab] = useState("vacancies");
  const [vacancies, setVacancies] = useState(() => sortByUpdated(initialVacancies));
  const [applications, setApplications] = useState(() => sortByUpdated(initialApplications));
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingVacancyId, setEditingVacancyId] = useState(null);
  const [vacancyDraft, setVacancyDraft] = useState(createEmptyVacancy);
  const [applicationDetail, setApplicationDetail] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [errors, setErrors] = useState({});
  const [isPending, startTransition] = useTransition();

  const filteredVacancies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return vacancies.filter((vacancy) => {
      const matchesQuery = !normalizedQuery || vacancy.title.toLowerCase().includes(normalizedQuery);
      const matchesStatus = statusFilter === "all" || vacancy.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter, vacancies]);

  const totalPages = Math.max(1, Math.ceil(filteredVacancies.length / VACANCIES_PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedVacancies = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * VACANCIES_PAGE_SIZE;
    return filteredVacancies.slice(startIndex, startIndex + VACANCIES_PAGE_SIZE);
  }, [filteredVacancies, safeCurrentPage]);

  const stats = useMemo(() => {
    return [
      { label: "Open roles", value: vacancies.filter((vacancy) => vacancy.status === "open").length },
      { label: "Closed roles", value: vacancies.filter((vacancy) => vacancy.status === "closed").length },
      { label: "Applications", value: applications.length },
    ];
  }, [applications.length, vacancies]);

  const openCreateModal = () => {
    setEditingVacancyId("new");
    setVacancyDraft(createEmptyVacancy());
    setErrors({});
    setFeedback(null);
  };

  const openEditModal = (vacancy) => {
    setEditingVacancyId(vacancy.id);
    setVacancyDraft(normalizeVacancy(vacancy));
    setErrors({});
    setFeedback(null);
  };

  const closeVacancyModal = () => {
    setEditingVacancyId(null);
    setVacancyDraft(createEmptyVacancy());
    setErrors({});
  };

  const updateVacancyField = (field, value) => {
    setVacancyDraft((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateSkill = (skillId, field, value) => {
    setVacancyDraft((current) => ({
      ...current,
      skills: current.skills.map((skill) =>
        skill.id === skillId ? { ...skill, [field]: value } : skill,
      ),
    }));
  };

  const addSkill = () => {
    setVacancyDraft((current) => ({
      ...current,
      skills: [...current.skills, createSkill()],
    }));
  };

  const removeSkill = (skillId) => {
    setVacancyDraft((current) => ({
      ...current,
      skills: current.skills.filter((skill) => skill.id !== skillId),
    }));
  };

  const handleSaveVacancy = (event) => {
    event.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const result = await saveVacancyAction({
        id: editingVacancyId !== "new" ? vacancyDraft.id : undefined,
        title: vacancyDraft.title,
        description: vacancyDraft.description,
        status: vacancyDraft.status,
        skills: vacancyDraft.skills,
      });

      if (!result.ok) {
        setErrors(result.errors ?? {});
        setFeedback({ type: "error", message: result.message });
        return;
      }

      setVacancies((current) => {
        const nextItems = current.some((item) => item.id === result.item.id)
          ? current.map((item) => (item.id === result.item.id ? result.item : item))
          : [result.item, ...current];

        return sortByUpdated(nextItems);
      });
      setApplications((current) =>
        current.map((application) =>
          application.vacancyId === result.item.id
            ? { ...application, vacancyTitle: result.item.title }
            : application,
        ),
      );
      setFeedback({ type: "success", message: result.message });
      closeVacancyModal();
    });
  };

  const handleDeleteVacancy = (vacancy) => {
    if (!window.confirm(`Delete ${vacancy.title}? Existing applications will keep their applied position label.`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteVacancyAction(vacancy.id);

      if (!result.ok) {
        setFeedback({ type: "error", message: result.message });
        return;
      }

      setVacancies((current) => current.filter((item) => item.id !== vacancy.id));
      setApplications((current) =>
        current.map((application) =>
          application.vacancyId === vacancy.id
            ? { ...application, vacancyId: "", vacancyTitle: application.vacancyTitle || vacancy.title }
            : application,
        ),
      );
      setFeedback({ type: "success", message: result.message });
    });
  };

  const handleDeleteApplication = (application) => {
    if (!window.confirm(`Delete application from ${application.name}?`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteApplicationAction(application.id);

      if (!result.ok) {
        setFeedback({ type: "error", message: result.message });
        return;
      }

      setApplications((current) => current.filter((item) => item.id !== application.id));
      if (applicationDetail?.id === application.id) {
        setApplicationDetail(null);
      }
      setFeedback({ type: "success", message: result.message });
    });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-accent-deep-blue">Careers</h1>
            <p className="mt-2 max-w-3xl text-sm text-text-secondary">
              Manage job vacancies, curate skill requirements, and review incoming applications from one hiring dashboard.
            </p>
          </div>
          <Button className="h-11 gap-2 px-5" onClick={openCreateModal}>
            <Plus size={16} />
            Add Vacancy
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="overflow-hidden border-border-subtle/60">
              <CardContent className="p-5">
                <p className="text-sm text-text-secondary">{stat.label}</p>
                <p className="mt-3 font-display text-2xl font-semibold text-on-surface">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <FeedbackBanner feedback={feedback} />

        <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-alt/70 p-1">
          <TabButton active={activeTab === "vacancies"} onClick={() => setActiveTab("vacancies")}>
            Vacancies
          </TabButton>
          <TabButton active={activeTab === "applications"} onClick={() => setActiveTab("applications")}>
            Applications
          </TabButton>
        </div>

        {activeTab === "vacancies" ? (
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border-subtle bg-surface-main/80">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle>Vacancies List</CardTitle>
                  <CardDescription>
                    Search roles, filter by status, and edit hiring requirements without leaving the careers module.
                  </CardDescription>
                </div>
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px] lg:w-[520px]">
                  <div className="relative">
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
                      placeholder="Search by job title"
                      className="h-11 pl-11"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(event) => {
                      setStatusFilter(event.target.value);
                      setCurrentPage(1);
                    }}
                    className="flex h-11 w-full rounded-md border border-border-subtle bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-deep-blue"
                  >
                    <option value="all">All statuses</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 p-0">
              {filteredVacancies.length === 0 ? (
                <div className="m-6 rounded-3xl border border-dashed border-border-subtle bg-surface-alt/50 px-6 py-12 text-center text-sm text-text-secondary">
                  No vacancies matched the current filters.
                </div>
              ) : (
                <>
                  <Table className="min-w-[760px]">
                    <TableHeader>
                      <TableRow className="bg-surface-alt/50 hover:bg-surface-alt/50">
                        <TableHead>Job Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date Created</TableHead>
                        <TableHead>Date Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedVacancies.map((vacancy) => (
                        <TableRow key={vacancy.id}>
                          <TableCell>
                            <div className="min-w-[240px]">
                              <p className="font-medium text-on-surface">{vacancy.title}</p>
                              <p className="mt-1 text-sm text-text-secondary">
                                {stripHtml(vacancy.description) || "No description added yet."}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={cn(
                              "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em]",
                              vacancy.status === "open"
                                ? "bg-status-active/10 text-status-active"
                                : "bg-surface-alt text-text-secondary",
                            )}>
                              {vacancy.status}
                            </span>
                          </TableCell>
                          <TableCell>{formatDateTime(vacancy.createdAt)}</TableCell>
                          <TableCell>{formatDateTime(vacancy.updatedAt)}</TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="gap-2"
                                onClick={() => openEditModal(vacancy)}
                              >
                                <Pencil size={14} />
                                Edit
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="gap-2 text-error hover:bg-error/10 hover:text-error"
                                onClick={() => handleDeleteVacancy(vacancy)}
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
                      Showing {(safeCurrentPage - 1) * VACANCIES_PAGE_SIZE + 1} to{" "}
                      {Math.min(safeCurrentPage * VACANCIES_PAGE_SIZE, filteredVacancies.length)} of {filteredVacancies.length} vacancies
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
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
                        onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
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
        ) : (
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border-subtle bg-surface-main/80">
              <CardTitle>Applications</CardTitle>
              <CardDescription>
                Review incoming candidates, open full application details, download attachments, and remove outdated entries.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              {applications.length === 0 ? (
                <div className="m-6 rounded-3xl border border-dashed border-border-subtle bg-surface-alt/50 px-6 py-12 text-center text-sm text-text-secondary">
                  No applications have been recorded yet.
                </div>
              ) : (
                <Table className="min-w-[900px]">
                  <TableHeader>
                    <TableRow className="bg-surface-alt/50 hover:bg-surface-alt/50">
                      <TableHead>Applicant Name</TableHead>
                      <TableHead>Email Address</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Applied Position</TableHead>
                      <TableHead>Date Applied</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell className="font-medium text-on-surface">{application.name}</TableCell>
                        <TableCell>{application.email || "Not provided"}</TableCell>
                        <TableCell>{application.phone || "Not provided"}</TableCell>
                        <TableCell>{application.vacancyTitle || "Unlinked vacancy"}</TableCell>
                        <TableCell>{application.dateApplied || formatDateTime(application.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="gap-2"
                              onClick={() => setApplicationDetail(application)}
                            >
                              <Eye size={14} />
                              View
                            </Button>
                            {application.resumeUrl ? (
                              <Button variant="secondary" size="sm" className="gap-2" asChild>
                                <a href={application.resumeUrl} target="_blank" rel="noreferrer">
                                  <Download size={14} />
                                  Resume
                                </a>
                              </Button>
                            ) : (
                              <Button variant="secondary" size="sm" className="gap-2" disabled>
                                <Download size={14} />
                                Resume
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="gap-2 text-error hover:bg-error/10 hover:text-error"
                              onClick={() => handleDeleteApplication(application)}
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
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {editingVacancyId ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-surface-alt/90 px-4 py-8 backdrop-blur-sm">
          <div className="mx-auto flex min-h-full w-full max-w-5xl items-center">
            <Card className="w-full overflow-hidden border-accent-deep-blue/15 shadow-architectural">
              <CardHeader className="border-b border-border-subtle bg-surface-main/95">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="text-2xl text-accent-deep-blue">
                      {editingVacancyId === "new" ? "Add Vacancy" : `Edit ${vacancyDraft.title || "Vacancy"}`}
                    </CardTitle>
                    <CardDescription className="mt-2 max-w-2xl">
                      Define the role, write the full job description, and list the core skills expected from candidates.
                    </CardDescription>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={closeVacancyModal} title="Close form">
                    <X size={18} />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6 sm:p-8">
                <form onSubmit={handleSaveVacancy} className="space-y-6">
                  <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_280px]">
                    <div className="space-y-5">
                      <label className="block space-y-2">
                        <span className="text-sm font-medium text-on-surface">Job Title *</span>
                        <Input
                          value={vacancyDraft.title}
                          onChange={(event) => updateVacancyField("title", event.target.value)}
                          placeholder="Enter job title"
                          className="h-11"
                        />
                        {errors.title ? <p className="text-sm text-error">{errors.title}</p> : null}
                      </label>

                      <RichTextEditor
                        label="Job Description"
                        value={vacancyDraft.description}
                        onChange={(value) => updateVacancyField("description", value)}
                        placeholder="Describe responsibilities, expectations, and context for this role..."
                        error={errors.description}
                        minHeightClassName="min-h-[260px]"
                      />
                    </div>

                    <div className="space-y-5">
                      <div className="rounded-3xl border border-border-subtle bg-surface-alt/40 p-5">
                        <label className="block space-y-2">
                          <span className="text-sm font-medium text-on-surface">Status</span>
                          <select
                            value={vacancyDraft.status}
                            onChange={(event) => updateVacancyField("status", event.target.value)}
                            className="flex h-11 w-full rounded-md border border-border-subtle bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-deep-blue"
                          >
                            <option value="open">Open</option>
                            <option value="closed">Closed</option>
                          </select>
                        </label>
                      </div>

                      <div className="rounded-3xl border border-border-subtle bg-surface-alt/40 p-5">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-lg font-display font-semibold text-on-surface">Skills</p>
                            <p className="mt-1 text-sm text-text-secondary">
                              Add the key capabilities or role requirements.
                            </p>
                          </div>
                          <Button type="button" size="sm" onClick={addSkill}>
                            <Plus size={14} />
                            Add Skill
                          </Button>
                        </div>

                        {errors.skills ? <p className="mt-3 text-sm text-error">{errors.skills}</p> : null}

                        <div className="mt-5 space-y-4">
                          {vacancyDraft.skills.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border-subtle bg-surface-main px-4 py-6 text-center text-sm text-text-secondary">
                              No skills added yet.
                            </div>
                          ) : null}

                          {vacancyDraft.skills.map((skill, index) => (
                            <div key={skill.id} className="rounded-2xl border border-border-subtle bg-surface-main p-4">
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold text-on-surface">Skill {index + 1}</p>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="gap-2 text-error hover:bg-error/10 hover:text-error"
                                  onClick={() => removeSkill(skill.id)}
                                >
                                  <Trash2 size={14} />
                                  Remove
                                </Button>
                              </div>

                              <div className="space-y-3">
                                <Input
                                  value={skill.title}
                                  onChange={(event) => updateSkill(skill.id, "title", event.target.value)}
                                  placeholder="Skill title"
                                  className="h-11"
                                />
                                <Textarea
                                  value={skill.description}
                                  onChange={(event) => updateSkill(skill.id, "description", event.target.value)}
                                  placeholder="Skill description"
                                  className="min-h-24"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-border-subtle pt-5 sm:flex-row sm:items-center sm:justify-end">
                    <Button type="button" variant="ghost" onClick={closeVacancyModal}>
                      Cancel
                    </Button>
                    <Button type="submit" className="gap-2" disabled={isPending}>
                      {isPending ? "Saving..." : editingVacancyId === "new" ? "Save Vacancy" : "Update Vacancy"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}

      {applicationDetail ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-surface-alt/90 px-4 py-8 backdrop-blur-sm">
          <div className="mx-auto flex min-h-full w-full max-w-3xl items-center">
            <Card className="w-full overflow-hidden border-accent-deep-blue/15 shadow-architectural">
              <CardHeader className="border-b border-border-subtle bg-surface-main/95">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="text-2xl text-accent-deep-blue">{applicationDetail.name}</CardTitle>
                    <CardDescription className="mt-2">
                      Applied for {applicationDetail.vacancyTitle || "Unlinked vacancy"}
                    </CardDescription>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => setApplicationDetail(null)} title="Close details">
                    <X size={18} />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-5 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-surface-alt/50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Email</p>
                    <p className="mt-2 text-on-surface">{applicationDetail.email || "Not provided"}</p>
                  </div>
                  <div className="rounded-2xl bg-surface-alt/50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Phone</p>
                    <p className="mt-2 text-on-surface">{applicationDetail.phone || "Not provided"}</p>
                  </div>
                  <div className="rounded-2xl bg-surface-alt/50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Applied Position</p>
                    <p className="mt-2 text-on-surface">{applicationDetail.vacancyTitle || "Unlinked vacancy"}</p>
                  </div>
                  <div className="rounded-2xl bg-surface-alt/50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Date Applied</p>
                    <p className="mt-2 text-on-surface">{applicationDetail.dateApplied || formatDateTime(applicationDetail.createdAt)}</p>
                  </div>
                </div>

                <div className="rounded-3xl border border-border-subtle bg-surface-alt/40 p-5">
                  <p className="text-sm font-medium text-on-surface">Application Notes</p>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-text-secondary">
                    {applicationDetail.notes || "No additional notes were recorded for this application."}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {applicationDetail.resumeUrl ? (
                    <Button variant="secondary" className="gap-2" asChild>
                      <a href={applicationDetail.resumeUrl} target="_blank" rel="noreferrer">
                        <Download size={16} />
                        Download Resume
                      </a>
                    </Button>
                  ) : (
                    <Button variant="secondary" className="gap-2" disabled>
                      <Download size={16} />
                      No Attachment
                    </Button>
                  )}

                  <div className="flex gap-3">
                    <Button type="button" variant="ghost" onClick={() => setApplicationDetail(null)}>
                      Close
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="gap-2 text-error hover:bg-error/10 hover:text-error"
                      onClick={() => handleDeleteApplication(applicationDetail)}
                    >
                      <Trash2 size={16} />
                      Delete Application
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </>
  );
}
