"use client";

import { useMemo, useState } from "react";
import { Check, ImagePlus, Search, X } from "lucide-react";
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

export default function MediaLibraryPickerModal({
  open,
  items,
  onClose,
  onSelect,
  multiple = false,
  initialSelectedIds = [],
  title = "Choose from Media Library",
  description = "Pick an existing image instead of uploading a duplicate.",
}) {
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState(initialSelectedIds);
  const [activeId, setActiveId] = useState(initialSelectedIds[0] ?? items[0]?.id ?? null);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return items;
    }

    return items.filter((item) => {
      return [item.name, item.alt, item.caption]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalized));
    });
  }, [items, query]);

  const activeItem = useMemo(() => {
    return filteredItems.find((item) => item.id === activeId)
      ?? items.find((item) => item.id === activeId)
      ?? filteredItems[0]
      ?? items[0]
      ?? null;
  }, [activeId, filteredItems, items]);

  if (!open) {
    return null;
  }

  const toggleSelect = (item) => {
    setActiveId(item.id);

    if (!multiple) {
      setSelectedIds([item.id]);
      return;
    }

    setSelectedIds((current) =>
      current.includes(item.id)
        ? current.filter((id) => id !== item.id)
        : [...current, item.id],
    );
  };

  const handleConfirm = () => {
    const selected = items.filter((item) => selectedIds.includes(item.id));
    onSelect(multiple ? selected : selected[0] ?? activeItem ?? null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-surface-alt/90 px-4 py-8 backdrop-blur-sm">
      <div className="mx-auto flex min-h-full w-full max-w-6xl items-center">
        <Card className="w-full overflow-hidden border-accent-deep-blue/15 shadow-architectural">
          <CardHeader className="border-b border-border-subtle bg-surface-main/95">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="text-2xl text-accent-deep-blue">{title}</CardTitle>
                <CardDescription className="mt-2 max-w-2xl">{description}</CardDescription>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={onClose} title="Close picker">
                <X size={18} />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1.3fr)_320px]">
            <div className="space-y-4">
              <div className="relative max-w-md">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
                />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search media by file name or alt text"
                  className="h-11 pl-11"
                />
              </div>

              {filteredItems.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border-subtle bg-surface-alt/50 px-6 py-12 text-center text-sm text-text-secondary">
                  No media matched your search.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                  {filteredItems.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    const isActive = activeItem?.id === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleSelect(item)}
                        className={cn(
                          "group relative overflow-hidden rounded-3xl border bg-surface-main text-left transition-all",
                          isActive || isSelected
                            ? "border-accent-deep-blue shadow-architectural"
                            : "border-border-subtle hover:border-accent-deep-blue/35 hover:bg-surface-alt",
                        )}
                      >
                        <div className="relative overflow-hidden bg-surface-alt">
                          {item.url ? (
                            <img
                              src={item.url}
                              alt={item.alt || item.name}
                              className="aspect-square w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex aspect-square items-center justify-center text-text-secondary">
                              <ImagePlus size={20} />
                            </div>
                          )}
                          {isSelected ? (
                            <span className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent-deep-blue text-white shadow-sm">
                              <Check size={14} />
                            </span>
                          ) : null}
                        </div>
                        <div className="space-y-1 p-3">
                          <p className="truncate text-sm font-medium text-on-surface">{item.name}</p>
                          <p className="text-xs text-text-secondary">{formatDateTime(item.createdAt)}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-border-subtle bg-surface-alt/45 p-5">
              {activeItem ? (
                <div className="space-y-5">
                  <div className="overflow-hidden rounded-[1.75rem] border border-border-subtle bg-surface-main">
                    <img
                      src={activeItem.url}
                      alt={activeItem.alt || activeItem.name}
                      className="aspect-[4/5] w-full object-cover"
                    />
                  </div>

                  <div className="space-y-3 text-sm text-text-secondary">
                    <div className="rounded-2xl bg-surface-main px-4 py-3">
                      <p className="font-medium text-on-surface">{activeItem.name}</p>
                      <p className="mt-1">{formatFileSize(activeItem.size)}</p>
                    </div>
                    <div className="rounded-2xl bg-surface-main px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em]">Uploaded</p>
                      <p className="mt-2 text-on-surface">{formatDateTime(activeItem.createdAt)}</p>
                    </div>
                    <div className="rounded-2xl bg-surface-main px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em]">Alt text</p>
                      <p className="mt-2 text-on-surface">{activeItem.alt || "No alt text added yet."}</p>
                    </div>
                    {activeItem.caption ? (
                      <div className="rounded-2xl bg-surface-main px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em]">Caption</p>
                        <p className="mt-2 text-on-surface">{activeItem.caption}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="flex h-full min-h-[280px] items-center justify-center rounded-3xl border border-dashed border-border-subtle bg-surface-main text-center text-sm text-text-secondary">
                  Select an image to preview it here.
                </div>
              )}
            </div>
          </CardContent>

          <div className="flex flex-col gap-3 border-t border-border-subtle px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text-secondary">
              {multiple
                ? `${selectedIds.length} image${selectedIds.length === 1 ? "" : "s"} selected`
                : selectedIds.length > 0
                  ? "1 image selected"
                  : "Select an image to continue"}
            </p>
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={multiple ? selectedIds.length === 0 : !activeItem}
              >
                {multiple ? "Add Selected Images" : "Use Selected Image"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
