"use client";

import { useEffect, useId, useRef } from "react";
import { Bold, Italic, List, ListOrdered, Quote } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const TOOLBAR_ACTIONS = [
  { icon: Bold, label: "Bold", command: "bold" },
  { icon: Italic, label: "Italic", command: "italic" },
  { icon: List, label: "Bullet list", command: "insertUnorderedList" },
  { icon: ListOrdered, label: "Numbered list", command: "insertOrderedList" },
  { icon: Quote, label: "Quote", command: "formatBlock", value: "blockquote" },
];

export default function RichTextEditor({
  label,
  value,
  onChange,
  placeholder,
  error,
  minHeightClassName = "min-h-[220px]",
}) {
  const editorId = useId();
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const runCommand = (command, commandValue) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    onChange(editorRef.current?.innerHTML ?? "");
  };

  return (
    <div className="space-y-2">
      {label ? (
        <label htmlFor={editorId} className="text-sm font-medium text-on-surface">
          {label}
        </label>
      ) : null}

      <div
        className={cn(
          "overflow-hidden rounded-2xl border bg-surface-main shadow-sm",
          error ? "border-error" : "border-border-subtle",
        )}
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle bg-surface-alt/70 px-3 py-3">
          {TOOLBAR_ACTIONS.map((action) => {
            const Icon = action.icon;

            return (
              <Button
                key={action.command}
                type="button"
                variant="secondary"
                size="icon"
                className="h-9 w-9 rounded-xl"
                onClick={() => runCommand(action.command, action.value)}
                title={action.label}
                aria-label={action.label}
              >
                <Icon size={15} />
              </Button>
            );
          })}
        </div>

        <div
          id={editorId}
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className={cn(
            "prose prose-sm max-w-none px-4 py-4 text-sm text-on-surface outline-none",
            "prose-p:my-2 prose-li:my-1 prose-blockquote:border-l-4 prose-blockquote:border-accent-deep-blue prose-blockquote:pl-4",
            minHeightClassName,
            !value && "before:pointer-events-none before:text-text-secondary before:content-[attr(data-placeholder)]",
          )}
          data-placeholder={placeholder}
          onInput={(event) => onChange(event.currentTarget.innerHTML)}
        />
      </div>

      {error ? <p className="text-sm text-error">{error}</p> : null}
    </div>
  );
}
