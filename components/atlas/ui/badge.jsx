import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-slate-700 text-slate-50 border-slate-600 hover:bg-slate-600",
        secondary:
          "bg-slate-600 text-slate-50 border-slate-500 hover:bg-slate-500",
        destructive:
          "bg-red-600 text-white border-red-500 hover:bg-red-700",
        outline: "bg-slate-800/50 text-slate-100 border-slate-600",
        success: "bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700",
        warning: "bg-amber-600 text-white border-amber-500 hover:bg-amber-700",
        info: "bg-blue-600 text-white border-blue-500 hover:bg-blue-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }