import type { ReactNode } from "react";
import {
  describeRing,
  normaliseCompleted,
  ringDayState,
  ringSegments,
  type RingDayState,
} from "@/lib/design/arc-ring";
import { cn } from "@/lib/cn";

/*
 * The signature element: one segment per day of an arc. Finished days are
 * solid gold, missed days are thin, today is white and pulses once on load,
 * days to come are a faint track. State is carried by thickness as well as
 * colour, and the whole ring has a spoken summary.
 */

const STATE_CLASSES: Record<RingDayState, string> = {
  done: "stroke-accent-graphic",
  today: "stroke-text",
  missed: "stroke-control",
  upcoming: "stroke-control/40",
};

export interface ArcRingProps {
  /** Length of the arc in days, usually 30, 60 or 90. */
  totalDays: number;
  /** 1-based day numbers that were completed. */
  completedDays?: Iterable<number>;
  /** The 1-based day the person is on, or null when no arc is running. */
  todayIndex?: number | null;
  size?: number;
  /** Pulse today's segment once on load. Turn off for a logo or anything that repeats. */
  pulse?: boolean;
  /** Hide from assistive technology, for a purely decorative ring. */
  decorative?: boolean;
  /** Content for the middle, such as a Stat. */
  children?: ReactNode;
  className?: string;
}

export function ArcRing({
  totalDays,
  completedDays = [],
  todayIndex = null,
  size = 160,
  pulse = true,
  decorative = false,
  children,
  className,
}: ArcRingProps) {
  const total = Math.min(366, Math.max(1, Math.floor(totalDays)));
  const completed = normaliseCompleted(completedDays, total);
  const today =
    todayIndex !== null && todayIndex >= 1 && todayIndex <= total
      ? Math.floor(todayIndex)
      : null;

  const thickness = Math.max(3, size * (total > 60 ? 0.05 : 0.065));
  const radius = size / 2 - thickness * 1.3;
  const segments = ringSegments({
    total,
    cx: size / 2,
    cy: size / 2,
    radius,
  });

  const summary = describeRing({
    total,
    completed: completed.size,
    today,
  });

  return (
    <div
      className={cn("relative inline-grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : summary}
        aria-hidden={decorative || undefined}
        focusable="false"
        className="absolute inset-0"
      >
        {segments.map(({ day, d }) => {
          const state = ringDayState(day, today, completed);
          const isDone =
            state === "done" || (state === "today" && completed.has(day));
          return (
            <path
              key={day}
              d={d}
              fill="none"
              strokeLinecap="butt"
              strokeWidth={state === "missed" ? thickness * 0.4 : thickness}
              className={cn(
                STATE_CLASSES[state],
                // Today stays white until it is done, then turns gold.
                state === "today" && isDone && "stroke-accent-graphic",
                state === "today" &&
                  pulse &&
                  "animate-ring-pulse origin-center [transform-box:fill-box]",
              )}
              data-day={day}
              data-state={state}
            />
          );
        })}
      </svg>
      {children ? <div className="relative text-center">{children}</div> : null}
    </div>
  );
}
