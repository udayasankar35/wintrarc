import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/*
 * A short status. Status words carry the meaning, so colour is never the only
 * signal: "Done" and "Overdue" read the same in greyscale.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-meta font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "border-border bg-bg-2 text-text-2",
        outline: "border-control text-text",
        success: "border-success/40 text-success",
        error: "border-error/40 text-error",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
