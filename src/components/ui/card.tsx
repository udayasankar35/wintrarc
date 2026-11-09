import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/*
 * A raised surface: one step lighter than the page, a hairline border first
 * and an inner top highlight in dark mode. No decorative shadow.
 */
export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-card border border-border bg-card [box-shadow:var(--edge-highlight)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("grid gap-1 p-5 pb-0", className)} {...props} />;
}

export function CardTitle({
  as: Heading = "h3",
  className,
  ...props
}: ComponentProps<"h3"> & { as?: "h2" | "h3" | "h4" }) {
  return (
    <Heading className={cn("text-body font-semibold", className)} {...props} />
  );
}

export function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p className={cn("text-secondary text-text-2", className)} {...props} />
  );
}

export function CardContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("p-5", className)} {...props} />;
}
