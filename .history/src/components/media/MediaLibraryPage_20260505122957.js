"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import {
  Check,
  Copy,
  ImagePlus,
  Images,
  LoaderCircle,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { deleteMediaItemAction, uploadFile } from "@/app/actions/content";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

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

function formatFileSize(size) {
  if (!size) {
    return "Unknown";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function sortMedia(items) {
  return [...items].sort((left, right) => {
    return new Date(right.updatedAt ?? right.createdAt ?? 0).getTime()
      - new Date(left.updatedAt ?? left.createdAt ?? 0).getTime();
  });
}

function UploadQueue({ queue, progress }) {
  if (queue.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden border-accent-deep-blue/20">
      <CardHeader className="border-b border-border-subtle bg-surface-main/80">
        <CardTitle>Upload Queue</CardTitle>
        <CardDescription>
          Review incoming files before they are added to the media library.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 p-6">
        <div className="h-3 overflow-hidden rounded-full bg-surface-alt">
          <div
            className="h-full rounded-full bg-accent-deep-blue transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {queue.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-3xl border border-border-subtle bg-surface-alt/45">
              <img
                src={item.preview}
                alt={item.file.name}
                className="aspect-square w-full object-cover"
              />
              <div className="space-y-1 p-3">
                <p className="truncate text-sm font-medium text-on-surface">{item.file.name}</p>
                <p className="text-xs text-text-secondary">{formatFileSize(item.file.size)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MediaPreviewModal({ item, onClose, onCopyUrl }) {
  if (!item) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-surface-alt/90 px-4 py-8 backdrop-blur-sm">
      <div className="mx-auto flex min-h-full w-full max-w-5xl items-center">
        <Card className="w-full overflow-hidden border-accent-deep-blue/15 shadow-architectural">
          <CardHeader className="border-b border-border-subtle bg-surface-main/95">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="text-2xl text-accent-deep-blue">{item.name}</CardTitle>
                <CardDescription className="mt-2">
                  Uploaded {formatDateTime(item.createdAt)} • {formatFileSize(item.size)} • {item.mimeType || "Unknown format"}
                </CardDescription>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={onClose} title="Close preview">
                <X size={18} />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 p-6">
            <div className="overflow-hidden rounded-[2rem] border border-border-subtle bg-surface-alt">
              <img
                src={item.url}
                alt={item.alt || item.name}
                className="max-h-[72vh] w-full object-contain"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-text-secondary">
                {item.alt ? `Alt text: ${item.alt}` : "No alt text added yet."}
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={onCopyUrl} className="gap-2">
                  <Copy size={16} />
                  Copy Image URL
                </Button>
                <Button type="button" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function MediaLibraryPage({ initialItems }) {
  const fileInputRef = useRef(null);
  const [items, setItems] = useState(() => sortMedia(initialItems));
  const [previewItem, setPreviewItem] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [queue, setQueue] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const now = new Date();

    return items.filter((item) => {
      const matchesQuery = !normalizedQuery
        || [item.name, item.alt, item.caption].filter(Boolean).some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesType = typeFilter === "all" || item.mimeType === typeFilter;

      let matchesDate = true;
      if (dateFilter === "7d") {
        matchesDate = now.getTime() - new Date(item.createdAt ?? 0).getTime() <= 7 * 24 * 60 * 60 * 1000;
      } else if (dateFilter === "30d") {
        matchesDate = now.getTime() - new Date(item.createdAt ?? 0).getTime() <= 30 * 24 * 60 * 60 * 1000;
      }

      return matchesQuery && matchesType && matchesDate;
    });
  }, [dateFilter, items, query, typeFilter]);

  const mimeTypes = useMemo(() => {
    return [...new Set(items.map((item) => item.mimeType).filter(Boolean))];
  }, [items]);

  const visibleSelectedCount = useMemo(() => {
    return filteredItems.filter((item) => selectedIds.includes(item.id)).length;
  }, [filteredItems, selectedIds]);

  const allVisibleSelected = filteredItems.length > 0 && visibleSelectedCount === filteredItems.length;

  const queueFiles = (files) => {
    const accepted = files.filter((file) => file.type.startsWith("image/"));

    if (accepted.length === 0) {
      setFeedback({ type: "error", message: "Please choose image files only." });
      return;
    }

    setQueue((current) => [
      ...current,
      ...accepted.map((file) => ({
        id: `queue-${crypto.randomUUID()}`,
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);
    setFeedback(null);
  };

  const handleUploadQueue = async () => {
    if (queue.length === 0) {
      return;
    }

    setIsUploading(true);
    setFeedback(null);

    const uploadedItems = [];

    try {
      for (const [index, queued] of queue.entries()) {
        const formData = new FormData();
        formData.append("file", queued.file);
        const result = await uploadFile(formData);
        if (result.media) {
          uploadedItems.push(result.media);
        }
        setUploadProgress(Math.round(((index + 1) / queue.length) * 100));
      }

      const nextItems = sortMedia([...uploadedItems, ...items]);
      setItems(nextItems);
      if (uploadedItems[0]) {
        setPreviewItem(uploadedItems[0]);
      }
      setFeedback({
        type: "success",
        message: `${uploadedItems.length} image${uploadedItems.length === 1 ? "" : "s"} uploaded to the media library.`,
      });
      queue.forEach((queued) => URL.revokeObjectURL(queued.preview));
      setQueue([]);
      setUploadProgress(0);
    } catch (error) {
      setFeedback({ type: "error", message: error.message || "Upload failed." });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id],
    );
  };

  const handleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) => current.filter((id) => !filteredItems.some((item) => item.id === id)));
      return;
    }

    setSelectedIds((current) => {
      const next = new Set(current);
      filteredItems.forEach((item) => next.add(item.id));
      return [...next];
    });
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) {
      return;
    }

    if (!window.confirm(`Delete ${selectedIds.length} selected media item${selectedIds.length === 1 ? "" : "s"}?`)) {
      return;
    }

    startTransition(async () => {
      const idsToDelete = [...selectedIds];
      const results = await Promise.all(idsToDelete.map((id) => deleteMediaItemAction(id)));
      const failed = results.filter((result) => !result.ok);

      if (failed.length > 0) {
        setFeedback({ type: "error", message: "Some media items could not be deleted." });
        return;
      }

      const nextItems = items.filter((item) => !idsToDelete.includes(item.id));
      setItems(nextItems);
      setSelectedIds([]);
      if (previewItem && idsToDelete.includes(previewItem.id)) {
        setPreviewItem(null);
      }
      setFeedback({
        type: "success",
        message: `${idsToDelete.length} media item${idsToDelete.length === 1 ? "" : "s"} deleted.`,
      });
    });
  };

  const handleCopyUrl = async () => {
    if (!previewItem?.url) {
      return;
    }

    try {
      await navigator.clipboard.writeText(previewItem.url);
      setFeedback({ type: "success", message: "Image URL copied to clipboard." });
    } catch {
      setFeedback({ type: "error", message: "Unable to copy the image URL." });
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-accent-deep-blue">Media Library</h1>
            <p className="mt-2 max-w-3xl text-sm text-text-secondary">
              Upload once and reuse media across Team, Projects, Blog, and other CMS modules.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} className="gap-2">
              <Upload size={16} />
              Choose Files
            </Button>
            <Button type="button" onClick={handleUploadQueue} disabled={queue.length === 0 || isUploading} className="gap-2">
              {isUploading ? <LoaderCircle size={16} className="animate-spin" /> : <Images size={16} />}
              {isUploading ? "Uploading..." : "Upload Media"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              accept="image/*"
              onChange={(event) => queueFiles(Array.from(event.target.files ?? []))}
            />
          </div>
        </div>

        <div
          className={cn(
            "rounded-[2rem] border border-dashed border-border-subtle bg-surface-main/70 p-8 text-center transition-colors",
            "hover:border-accent-deep-blue/40 hover:bg-surface-alt/60",
          )}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            queueFiles(Array.from(event.dataTransfer.files ?? []));
          }}
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-alt text-accent-deep-blue">
            <ImagePlus size={24} />
          </div>
          <h2 className="mt-4 font-display text-xl font-semibold text-on-surface">Drop images here</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Drag and drop multiple images, then upload them to your shared media library.
          </p>
        </div>

        <UploadQueue queue={queue} progress={uploadProgress} />

        {feedback ? (
          <div
            className={
              feedback.type === "error"
                ? "rounded-2xl border border-error/25 bg-error/10 px-4 py-3 text-sm text-error"
                : "rounded-2xl border border-status-active/25 bg-status-active/10 px-4 py-3 text-sm text-status-active"
            }
          >
            {feedback.message}
          </div>
        ) : null}

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border-subtle bg-surface-main/80">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <CardTitle>Media Grid</CardTitle>
                  <CardDescription>
                    Click any image to preview it in a modal. Select multiple images to delete them together.
                  </CardDescription>
                </div>
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_170px_170px]">
                  <div className="relative">
                    <Search
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
                    />
                    <Input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search by file name"
                      className="h-11 pl-11"
                    />
                  </div>
                  <select
                    value={dateFilter}
                    onChange={(event) => setDateFilter(event.target.value)}
                    className="flex h-11 w-full rounded-md border border-border-subtle bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-deep-blue"
                  >
                    <option value="all">All dates</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                  </select>
                  <select
                    value={typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value)}
                    className="flex h-11 w-full rounded-md border border-border-subtle bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-deep-blue"
                  >
                    <option value="all">All types</option>
                    {mimeTypes.map((mimeType) => (
                      <option key={mimeType} value={mimeType}>
                        {mimeType}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface-alt/40 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                  <span>{selectedIds.length} selected</span>
                  <span>{filteredItems.length} visible</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button type="button" variant="secondary" size="sm" onClick={handleSelectAllVisible} disabled={filteredItems.length === 0}>
                    {allVisibleSelected ? "Clear Visible Selection" : "Select Visible"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteSelected}
                    disabled={selectedIds.length === 0 || isPending}
                    className="gap-2 text-error hover:bg-error/10 hover:text-error"
                  >
                    <Trash2 size={14} />
                    Delete Selected
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {filteredItems.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border-subtle bg-surface-alt/50 px-6 py-12 text-center text-sm text-text-secondary">
                No media matched the current filters.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {filteredItems.map((item) => {
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "group relative overflow-hidden rounded-3xl border bg-surface-main transition-all",
                        isSelected
                          ? "border-accent-deep-blue shadow-architectural"
                          : "border-border-subtle hover:border-accent-deep-blue/35 hover:bg-surface-alt",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setPreviewItem(item)}
                        className="block w-full text-left"
                      >
                        <div className="overflow-hidden bg-surface-alt">
                          <img
                            src={item.url}
                            alt={item.alt || item.name}
                            className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                            loading="lazy"
                          />
                        </div>
                        <div className="space-y-1 p-3">
                          <p className="truncate text-sm font-medium text-on-surface">{item.name}</p>
                          <p className="text-xs text-text-secondary">{formatDateTime(item.createdAt)}</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleSelect(item.id);
                        }}
                        className={cn(
                          "absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border shadow-sm transition-colors",
                          isSelected
                            ? "border-accent-deep-blue bg-accent-deep-blue text-white"
                            : "border-border-subtle bg-surface-main/95 text-text-secondary hover:border-accent-deep-blue hover:text-accent-deep-blue",
                        )}
                        aria-label={isSelected ? "Deselect image" : "Select image"}
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <MediaPreviewModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
        onCopyUrl={handleCopyUrl}
      />
    </>
  );
}
