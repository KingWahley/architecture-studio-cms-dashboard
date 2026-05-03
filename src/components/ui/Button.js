import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

const buttonVariants = ({ variant = "default", size = "default", className }) => {
  const base = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50"
  
  const variants = {
    default: "bg-accent-deep-blue text-white hover:bg-accent-deep-blue/90 shadow-sm",
    secondary: "bg-surface-main text-on-surface border border-border-subtle hover:bg-surface-alt",
    ghost: "hover:bg-surface-alt hover:text-on-surface",
    link: "text-accent-deep-blue underline-offset-4 hover:underline",
  }
  
  const sizes = {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-10 rounded-md px-8",
    icon: "h-9 w-9",
  }

  return cn(base, variants[variant], sizes[size], className)
}

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={buttonVariants({ variant, size, className })}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
