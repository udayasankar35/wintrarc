"use client";

import { Progress as ProgressPrimitive } from "radix-ui";
import { cn } from "@/lib/cn";

/**
 * A bar for progress towards a total. The fill grows with a transform, not a
 * width change, so it stays smooth. Pair it with a number: the bar alone is
 * not enough for someone who cannot see it.
 */
export function Progress({
  value,
  max = 100,
  label,
  className,
}: {
  value: number;
  max?: number;
  /** Names what is being measured, for screen readers. */
  label: string;
  className?: string;
}) {
  const safeMax = max > 0 ? max : 1;
  const clamped = Math.min(safeMax, Math.max(0, value));
  return (
    <ProgressPrimitive.Root
      value={clamped}
      max={safeMax}
      aria-label={label}
      className={cn(
        "relative h-2.5 w-full overflow-hidden rounded-full border border-border bg-bg-2",
        className,
      )}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full origin-left bg-accent-graphic transition-transform duration-(--dur-base) ease-(--ease)"
        style={{ transform: `scaleX(${clamped / safeMax})` }}
      />
    </ProgressPrimitive.Root>
  );
}
