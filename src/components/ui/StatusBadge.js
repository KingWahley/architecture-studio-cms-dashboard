import * as React from "react"
import { cn } from "@/lib/utils"

const badgeVariants = {
  active: "bg-status-active/10 text-status-active border-status-active/20",
  draft: "bg-status-draft/10 text-status-draft border-status-draft/20",
  ongoing: "bg-accent-deep-blue/10 text-accent-deep-blue border-accent-deep-blue/20",
  completed: "bg-status-active/10 text-status-active border-status-active/20",
  new: "bg-accent-muted-gold/10 text-accent-muted-gold border-accent-muted-gold/20",
}

function StatusBadge({ className, variant = "draft", children, ...props }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        badgeVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { StatusBadge, badgeVariants }
