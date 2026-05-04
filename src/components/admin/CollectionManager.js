"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { PencilLine, Plus, Save, Search, Sparkles, Trash2, X } from "lucide-react";
import { deleteContentItem, saveContentItem } from "@/app/actions/content";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";

function getEmptyValues(fields) {
  return Object.fromEntries(fields.map((field) => [field.name, field.type === "number" ? 0 : ""]));
}

function getInitialValues(fields, item) {
  return Object.fromEntries(fields.map((field) => [field.name, item?.[field.name] ?? (field.type === "number" ? 0 : "")]));
}

export default function CollectionManager({ entityKey, config, items }) {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(items[0]?.id ?? null);
  const [draft, setDraft] = useState(() => getInitialValues(config.fields, items[0]));
  const [mode, setMode] = useState(items[0] ? "edit" : "idle");
  const [feedback, setFeedback] = useState("");
  const [isPending, startSaving] = useTransition();

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) =>
      Object.values(item).some((value) => String(value ?? "").toLowerCase().includes(normalizedQuery))
    );
  }, [items, query]);

  const activeItem = useMemo(() => items.find((item) => item.id === activeId) ?? null, [activeId, items]);
  const isCreateMode = mode === "create";

  useEffect(() => {
    if (!isCreateMode) {
      return undefined;
    }

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflow;
    };
  }, [isCreateMode]);

  const handleSelect = (item) => {
    setActiveId(item.id);
    setDraft(getInitialValues(config.fields, item));
    setMode("edit");
    setFeedback("");
  };

  const handleCreate = () => {
    setActiveId(null);
    setDraft(getEmptyValues(config.fields));
    setMode("create");
    setFeedback("");
  };

  const handleCloseCreate = () => {
    if (activeItem) {
      handleSelect(activeItem);
      return;
    }

    setMode("idle");
    setFeedback("");
  };

  const handleChange = (fieldName, value) => {
    setDraft((current) => ({
      ...current,
      [fieldName]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFeedback("");

    startSaving(async () => {
      const result = await saveContentItem({
        entityKey,
        id: mode === "edit" ? activeId : undefined,
        ...draft,
      });

      setFeedback(result.message);
      setMode("edit");
      setActiveId(result.item.id);
    });
  };

  const handleDelete = () => {
    if (!activeItem) {
      return;
    }

    if (!window.confirm(`Delete ${activeItem[config.titleField] || config.singular}?`)) {
      return;
    }

    startSaving(async () => {
      await deleteContentItem({ entityKey, id: activeItem.id });
      setFeedback(`${config.singular} deleted.`);
      setMode(items.length > 1 ? "edit" : "idle");
      setActiveId(null);
      setDraft(getEmptyValues(config.fields));
    });
  };

  const renderField = (field, className) => (
    <label key={field.name} className={cn("block space-y-2", className)}>
      <span className="text-sm font-medium text-on-surface">
        {field.label}
        {field.required ? " *" : ""}
      </span>

      {field.type === "textarea" ? (
        <Textarea
          value={draft[field.name]}
          onChange={(event) => handleChange(field.name, event.target.value)}
          required={field.required}
          placeholder={field.label}
          className="min-h-36"
        />
      ) : field.type === "select" ? (
        <select
          value={draft[field.name]}
          onChange={(event) => handleChange(field.name, event.target.value)}
          required={field.required}
          className="flex h-11 w-full rounded-md border border-border-subtle bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-deep-blue"
        >
          <option value="">Select {field.label.toLowerCase()}</option>
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <Input
          type={field.type === "number" ? "number" : "text"}
          value={draft[field.name]}
          onChange={(event) => handleChange(field.name, event.target.value)}
          required={field.required}
          placeholder={field.label}
          className="h-11"
        />
      )}
    </label>
  );

  const formContent = (
    <>
      <div className="grid gap-5 lg:grid-cols-2">
        {config.fields.map((field) => renderField(field, field.type === "textarea" ? "lg:col-span-2" : ""))}
      </div>

      {feedback ? (
        <div className="rounded-xl border border-status-active/20 bg-status-active/10 px-4 py-3 text-sm text-status-active">
          {feedback}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" disabled={isPending} className="gap-2">
            <Save size={16} />
            {isPending ? "Saving..." : "Save changes"}
          </Button>
          <Button type="button" variant="secondary" onClick={handleCreate} disabled={isPending}>
            Reset form
          </Button>
        </div>

        {mode === "edit" ? (
          <Button
            type="button"
            variant="ghost"
            onClick={handleDelete}
            disabled={isPending}
            className="gap-2 text-error hover:bg-error/10 hover:text-error"
          >
            <Trash2 size={16} />
            Delete
          </Button>
        ) : null}
      </div>
    </>
  );

  return (
    <>
      <div className={cn("space-y-6 transition-all", isCreateMode && "pointer-events-none select-none blur-sm opacity-20")}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-accent-deep-blue/15 bg-accent-deep-blue/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent-deep-blue">
              <Sparkles size={12} />
              Content Studio
            </div>
            <h2 className="text-3xl font-display font-semibold text-accent-deep-blue">{config.label}</h2>
            <p className="mt-2 max-w-2xl text-sm text-text-secondary">{config.description}</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <div className="relative min-w-0 sm:min-w-72">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${config.label.toLowerCase()}...`}
                className="pl-9"
              />
            </div>
            <Button onClick={handleCreate} className="gap-2">
              <Plus size={16} />
              New {config.singular}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border-subtle bg-surface-main/80">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>{config.label}</CardTitle>
                  <CardDescription>{filteredItems.length} item(s) shown</CardDescription>
                </div>
                <Link href="/dashboard" className="text-sm font-medium text-accent-deep-blue hover:underline">
                  Dashboard
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              {filteredItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border-subtle bg-surface-alt p-8 text-center text-sm text-text-secondary">
                  No items match your search yet.
                </div>
              ) : (
                filteredItems.map((item) => {
                  const title = item[config.titleField] || config.singular;
                  const description = item[config.descriptionField];
                  const isActive = item.id === activeId && mode === "edit";

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className={cn(
                        "w-full rounded-2xl border p-4 text-left transition-all",
                        isActive
                          ? "border-accent-deep-blue bg-accent-deep-blue/[0.06] shadow-architectural"
                          : "border-border-subtle bg-white hover:border-accent-deep-blue/40 hover:bg-surface-alt"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-lg font-display font-semibold text-on-surface">{title}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {config.metaFields.map((fieldName) =>
                              item[fieldName] ? (
                                <span
                                  key={fieldName}
                                  className="rounded-full bg-surface-alt px-2.5 py-1 text-xs font-medium text-text-secondary"
                                >
                                  {item[fieldName]}
                                </span>
                              ) : null
                            )}
                          </div>
                        </div>
                        <StatusBadge variant={item[config.statusField] || "draft"}>
                          {item[config.statusField] || "draft"}
                        </StatusBadge>
                      </div>
                      {description ? (
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-text-secondary">{description}</p>
                      ) : null}
                    </button>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader className="border-b border-border-subtle">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{activeItem ? `Edit ${config.singular}` : `${config.singular} details`}</CardTitle>
                  <CardDescription>
                    {activeItem ? "Update details and save changes instantly." : `Select a ${config.singular.toLowerCase()} to edit it.`}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={handleCreate} title={`Create ${config.singular}`}>
                  <PencilLine size={16} />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {activeItem ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {formContent}
                </form>
              ) : (
                <div className="rounded-2xl border border-dashed border-border-subtle bg-surface-alt p-8 text-center text-sm text-text-secondary">
                  Open an existing item from the list or create a new one.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {isCreateMode ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-surface-alt/95 px-4 py-6 backdrop-blur-sm sm:px-6 lg:px-8">
          <div className="mx-auto flex min-h-full w-full max-w-5xl items-center">
            <Card className="w-full overflow-hidden border-accent-deep-blue/10 shadow-architectural">
              <CardHeader className="border-b border-border-subtle bg-surface-main/95">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent-deep-blue/15 bg-accent-deep-blue/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent-deep-blue">
                      <Plus size={12} />
                      New {config.singular}
                    </div>
                    <CardTitle className="text-2xl text-accent-deep-blue">Create {config.singular}</CardTitle>
                    <CardDescription className="mt-2 max-w-2xl">
                      Add a new {config.singular.toLowerCase()} with a focused full-screen form.
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleCloseCreate} title="Close create form">
                    <X size={18} />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {formContent}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </>
  );
}
