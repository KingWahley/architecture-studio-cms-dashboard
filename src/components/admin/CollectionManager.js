"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, LayoutGrid, List, Pencil, Plus, Save, Search, Trash2, X, Upload } from "lucide-react";
import { deleteContentItem, saveContentItem, uploadFile } from "@/app/actions/content";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";

const DEFAULT_VIEW_MODE = "list";

function readStoredViewMode(storageKey) {
  if (typeof window === "undefined") {
    return DEFAULT_VIEW_MODE;
  }

  const savedViewMode = window.localStorage.getItem(storageKey);
  return savedViewMode === "grid" || savedViewMode === "list" ? savedViewMode : DEFAULT_VIEW_MODE;
}

function subscribeToViewMode(onStoreChange) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleChange = () => onStoreChange();

  window.addEventListener("storage", handleChange);
  window.addEventListener("collection-view-change", handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener("collection-view-change", handleChange);
  };
}

function getEmptyValues(fields) {
  return Object.fromEntries(fields.map((field) => [field.name, field.type === "number" ? 0 : ""]));
}

function getInitialValues(fields, item) {
  return Object.fromEntries(fields.map((field) => [field.name, item?.[field.name] ?? (field.type === "number" ? 0 : "")]));
}

function DisplayModeToggle({ mode, onChange }) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-surface-alt/90 p-1"
      role="group"
      aria-label="Choose display mode"
    >
      <button
        type="button"
        onClick={() => onChange("grid")}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
          mode === "grid" ? "bg-accent-deep-blue text-white shadow-sm" : "text-text-secondary hover:bg-white"
        )}
        aria-pressed={mode === "grid"}
        title="Grid view"
      >
        <LayoutGrid size={16} />
      </button>
      <button
        type="button"
        onClick={() => onChange("list")}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
          mode === "list" ? "bg-accent-deep-blue text-white shadow-sm" : "text-text-secondary hover:bg-white"
        )}
        aria-pressed={mode === "list"}
        title="List view"
      >
        <List size={16} />
      </button>
    </div>
  );
}

export default function CollectionManager({ entityKey, config, items, customEditRoute }) {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState(() => getEmptyValues(config.fields));
  const [mode, setMode] = useState("idle");
  const [feedback, setFeedback] = useState("");
  const [isMessageListCollapsed, setIsMessageListCollapsed] = useState(false);
  const [isPending, startSaving] = useTransition();
  const viewModeStorageKey = `collection-view:${entityKey}`;
  const viewMode = useSyncExternalStore(
    subscribeToViewMode,
    () => readStoredViewMode(viewModeStorageKey),
    () => DEFAULT_VIEW_MODE
  );

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
  const supportsReadOnlyDetailView = config.readOnly && entityKey === "messages";
  const resolvedReadOnlyActiveItem = useMemo(() => {
    if (!supportsReadOnlyDetailView) {
      return null;
    }

    return filteredItems.find((item) => item.id === activeId) ?? null;
  }, [activeId, filteredItems, supportsReadOnlyDetailView]);
  const displayedActiveItem = supportsReadOnlyDetailView ? resolvedReadOnlyActiveItem : activeItem;

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

  const handleViewModeChange = (nextMode) => {
    window.localStorage.setItem(viewModeStorageKey, nextMode);
    window.dispatchEvent(new CustomEvent("collection-view-change"));
  };

  const handleSelect = (item) => {
    if (supportsReadOnlyDetailView) {
      setActiveId((current) => (current === item.id ? null : item.id));
      return;
    }

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

  const handleFileUpload = async (fieldName, file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setFeedback("Uploading...");
      const result = await uploadFile(formData);
      handleChange(fieldName, result.url);
      setFeedback("Image uploaded successfully.");
    } catch (error) {
      setFeedback("Upload failed: " + error.message);
    }
  };

  const renderField = (field, className) => (
    <label key={field.name} className={cn("block space-y-2", className)}>
      <span className="text-sm font-medium text-on-surface">
        {field.label}
        {field.required ? " *" : ""}
      </span>

      {field.name === "image" && (
        <div className="space-y-4">
          {draft[field.name] && (
            <div className="aspect-square max-w-[200px] overflow-hidden rounded-2xl border border-border-subtle bg-surface-alt shadow-sm">
              <img src={draft[field.name]} alt="Preview" className="h-full w-full object-cover" />
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Input
                type="text"
                value={draft[field.name]}
                onChange={(event) => handleChange(field.name, event.target.value)}
                placeholder="Image URL or upload below..."
                className="h-11 pr-10"
                readOnly={config.readOnly}
              />
            </div>
            <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-surface-alt px-4 text-sm font-medium text-on-surface hover:bg-surface-container transition-colors border border-border-subtle">
              <Upload size={16} />
              <span>Upload</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileUpload(field.name, e.target.files[0])}
                disabled={config.readOnly}
              />
            </label>
          </div>
        </div>
      )}

      {field.name !== "image" && (
        field.type === "textarea" ? (
          <Textarea
            value={draft[field.name]}
            onChange={(event) => handleChange(field.name, event.target.value)}
            required={field.required}
            readOnly={config.readOnly}
            disabled={config.readOnly}
            placeholder={field.label}
            className="min-h-36"
          />
        ) : field.type === "select" ? (
          <select
            value={draft[field.name]}
            onChange={(event) => handleChange(field.name, event.target.value)}
            required={field.required}
            disabled={config.readOnly}
            className="flex h-11 w-full rounded-md border border-border-subtle bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-deep-blue disabled:opacity-50"
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
            readOnly={config.readOnly}
            disabled={config.readOnly}
            placeholder={field.label}
            className="h-11"
          />
        )
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

      {!config.readOnly && (
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
      )}
    </>
  );

  const isSplitView = mode === "edit" && !customEditRoute && !config.readOnly;
  const isReadOnlySplitView = Boolean(supportsReadOnlyDetailView && displayedActiveItem);
  const isMessageRailMode = supportsReadOnlyDetailView && isMessageListCollapsed && isReadOnlySplitView;
  const effectiveViewMode = isMessageRailMode ? "list" : viewMode;
  const isGridView = effectiveViewMode === "grid";
  const itemsLayoutClassName = isGridView
    ? cn(
        "grid gap-4",
        isSplitView || isReadOnlySplitView ? "md:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-3"
      )
    : cn("space-y-4", isMessageRailMode && "space-y-3");

  return (
    <>
      <div
        className={cn(
          "space-y-6 transition-all",
          isCreateMode && "pointer-events-none select-none blur-sm opacity-20",
        )}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-3xl font-display font-semibold text-accent-deep-blue">
              {config.label}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-text-secondary">
              {config.description}
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-stretch">
            <div className="relative min-w-0 sm:min-w-72">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${config.label.toLowerCase()}...`}
                className="h-11 pl-11 pr-4 leading-none"
              />
            </div>
            {!config.readOnly &&
              (customEditRoute ? (
                <Link
                  href={customEditRoute.replace("[id]", "new")}
                  className="inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-accent-deep-blue px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-accent-deep-blue/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-deep-blue disabled:pointer-events-none disabled:opacity-50"
                >
                  <Plus size={16} />
                  New {config.singular}
                </Link>
              ) : (
                <Button onClick={handleCreate} className="h-11 gap-2 px-4">
                  <Plus size={16} />
                  New {config.singular}
                </Button>
              ))}
          </div>
        </div>

        <div
          className={cn(
            "flex flex-col gap-6 xl:flex-row",
            isSplitView || isReadOnlySplitView ? "xl:items-start" : "",
          )}
        >
          <motion.div
            initial={false}
            animate={{
              width: isSplitView || isReadOnlySplitView
                ? isMessageRailMode
                  ? 96
                  : 0
                : 0,
            }}
            transition={{ duration: 0.3 }}
            className={cn(
              "w-full shrink-0 xl:w-auto",
              isSplitView || isReadOnlySplitView
                ? isMessageRailMode
                  ? "xl:basis-[96px]"
                  : "xl:basis-[57.5%]"
                : "xl:basis-full",
            )}
          >
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border-subtle bg-surface-main/80">
              <div className="flex items-center justify-between gap-3">
                {isMessageRailMode ? <div aria-hidden="true" /> : (
                  <div>
                    <CardTitle>
                      <span className="mr-2">{filteredItems.length}</span>
                      {config.label}
                    </CardTitle>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {supportsReadOnlyDetailView && displayedActiveItem ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      onClick={() => setIsMessageListCollapsed((current) => !current)}
                      title={isMessageListCollapsed ? "Expand messages list" : "Collapse messages list"}
                      aria-label={isMessageListCollapsed ? "Expand messages list" : "Collapse messages list"}
                    >
                      {isMessageListCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </Button>
                  ) : null}
                  {!isMessageRailMode ? (
                    <DisplayModeToggle
                      mode={viewMode}
                      onChange={handleViewModeChange}
                    />
                  ) : null}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {filteredItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border-subtle bg-surface-alt p-8 text-center text-sm text-text-secondary">
                  No items match your search yet.
                </div>
              ) : (
                <div className={itemsLayoutClassName}>
                  {filteredItems.map((item) => {
                    const title = item[config.titleField] || config.singular;
                    const description = item[config.descriptionField];
                    const isActive = supportsReadOnlyDetailView
                      ? item.id === displayedActiveItem?.id
                      : item.id === activeId && mode === "edit";

                    const itemContent = (
                      <>
                        <div
                          className={cn(
                            "flex justify-between gap-3",
                            isMessageRailMode ? "items-center" : "items-start",
                          )}
                        >
                          <div
                            className={cn(
                              "min-w-0 flex-1",
                              isMessageRailMode ? "flex items-center justify-center" : isGridView ? "space-y-4" : "flex gap-4",
                            )}
                          >
                            {item.image ? (
                              <div
                                className={cn(
                                  "overflow-hidden border border-border-subtle bg-surface-alt",
                                  isGridView
                                    ? "aspect-[4/3] w-full rounded-2xl"
                                    : "h-12 w-12 shrink-0 rounded-full",
                                  isMessageRailMode && "h-12 w-12 rounded-2xl",
                                )}
                              >
                                <img
                                  src={item.image}
                                  alt={title}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : supportsReadOnlyDetailView ? (
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface-alt text-sm font-semibold text-accent-deep-blue">
                                {item.name?.charAt(0) ?? title?.charAt(0) ?? "M"}
                              </div>
                            ) : null}
                            {!isMessageRailMode ? (
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-lg font-display font-semibold text-on-surface">
                                  {title}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {config.metaFields.map((fieldName) =>
                                    item[fieldName] ? (
                                      <span
                                        key={fieldName}
                                        className="rounded-full bg-surface-alt px-2.5 py-1 text-xs font-medium text-text-secondary"
                                      >
                                        {item[fieldName]}
                                      </span>
                                    ) : null,
                                  )}
                                </div>
                              </div>
                            ) : null}
                          </div>
                          <div className={cn("flex shrink-0 flex-col items-end gap-3", isMessageRailMode && "hidden")}>
                            <StatusBadge
                              variant={item[config.statusField] || "draft"}
                            >
                              {item[config.statusField] || "draft"}
                            </StatusBadge>
                            {!config.readOnly && (
                              <div className="flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                                {customEditRoute ? (
                                  <Button
                                    variant="secondary"
                                    size="icon"
                                    className="h-8 w-8 rounded-full shadow-sm hover:border-accent-deep-blue/40"
                                    asChild
                                    title="Edit"
                                  >
                                    <Link
                                      href={customEditRoute.replace(
                                        "[id]",
                                        item.id,
                                      )}
                                    >
                                      <Pencil
                                        size={14}
                                        className="text-accent-deep-blue"
                                      />
                                    </Link>
                                  </Button>
                                ) : (
                                  <Button
                                    variant="secondary"
                                    size="icon"
                                    className="h-8 w-8 rounded-full shadow-sm hover:border-accent-deep-blue/40"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelect(item);
                                    }}
                                    title="Edit"
                                  >
                                    <Pencil
                                      size={14}
                                      className="text-accent-deep-blue"
                                    />
                                  </Button>
                                )}
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  className="h-8 w-8 rounded-full shadow-sm hover:border-status-active/40 hover:text-status-active"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`Delete ${title}?`)) {
                                      startSaving(async () => {
                                        await deleteContentItem({
                                          entityKey,
                                          id: item.id,
                                        });
                                        if (activeId === item.id) {
                                          setActiveId(null);
                                          setMode("idle");
                                        }
                                      });
                                    }
                                  }}
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        {description && !isMessageRailMode ? (
                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-text-secondary">
                            {description}
                          </p>
                        ) : null}
                      </>
                    );

                    const commonClasses = cn(
                      "group relative block w-full rounded-2xl border p-4 text-left transition-all",
                      isGridView && "h-full",
                      isActive
                        ? "border-accent-deep-blue bg-accent-deep-blue/[0.06] shadow-architectural"
                        : "border-border-subtle bg-white hover:border-accent-deep-blue/40 hover:bg-surface-alt",
                    );

                    return (
                      <div
                        key={item.id}
                        className={cn(
                          commonClasses,
                          (!customEditRoute && !config.readOnly) || supportsReadOnlyDetailView
                            ? "cursor-pointer"
                            : undefined,
                          isMessageRailMode && "flex min-h-[76px] items-center justify-center p-3",
                        )}
                        onClick={
                          (!customEditRoute && !config.readOnly) || supportsReadOnlyDetailView
                            ? () => handleSelect(item)
                            : undefined
                        }
                      >
                        {itemContent}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
          </motion.div>

          {isSplitView && (
            <Card className="h-fit border-accent-deep-blue/20 shadow-architectural">
              <CardHeader className="border-b border-border-subtle bg-surface-main/80">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>Edit {config.singular}</CardTitle>
                    <CardDescription>
                      Update details and save changes instantly.
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMode("idle")}
                    title="Close editor"
                  >
                    <X size={16} />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {formContent}
                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-border-subtle">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setMode("idle")}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isPending}>
                      {isPending ? "Saving..." : "Save changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {isReadOnlySplitView ? (
            <div className="w-full flex-1">
            <Card className="overflow-hidden border-accent-deep-blue/20 shadow-architectural">
              <CardHeader className="border-b border-border-subtle bg-surface-main/80">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border-subtle bg-surface-alt text-lg font-semibold text-accent-deep-blue">
                      {displayedActiveItem.image ? (
                        <img src={displayedActiveItem.image} alt={displayedActiveItem.name} className="h-full w-full object-cover" />
                      ) : (
                        displayedActiveItem.name?.charAt(0) ?? "M"
                      )}
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="truncate text-2xl text-accent-deep-blue">{displayedActiveItem.name}</CardTitle>
                      <CardDescription className="mt-2 break-words text-base">
                        {displayedActiveItem.email}
                        {displayedActiveItem.date ? ` • ${displayedActiveItem.date}` : ""}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-start">
                    <StatusBadge variant={displayedActiveItem[config.statusField] || "draft"}>
                      {displayedActiveItem[config.statusField] || "draft"}
                    </StatusBadge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setActiveId(null)}
                      title="Close message details"
                      aria-label="Close message details"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 p-6">
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Subject</p>
                  <h3 className="font-display text-3xl leading-tight text-on-surface">{displayedActiveItem.subject}</h3>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Message</p>
                  <div className="rounded-2xl border border-border-subtle bg-white p-5">
                    <p className="whitespace-pre-line text-base leading-8 text-on-surface">
                      {displayedActiveItem.body || displayedActiveItem.preview || "No message body available."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          ) : null}
        </div>
      </div>

      {!customEditRoute && isCreateMode ? (
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
                    <CardTitle className="text-2xl text-accent-deep-blue">
                      Create {config.singular}
                    </CardTitle>
                    <CardDescription className="mt-2 max-w-2xl">
                      Add a new {config.singular.toLowerCase()} with a focused
                      full-screen form.
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCloseCreate}
                    title="Close create form"
                  >
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
