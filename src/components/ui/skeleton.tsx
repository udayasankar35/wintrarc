import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/**
 * A placeholder for content that is on its way. Use it for waits longer than
 * about a second; shorter waits get an inline spinner or nothing. Pulses by
 * fading, never by moving, and stands still for people who prefer less motion.
 */
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-quiet-pulse rounded-control bg-text/10",
        className,
      )}
      {...props}
    />
  );
}
