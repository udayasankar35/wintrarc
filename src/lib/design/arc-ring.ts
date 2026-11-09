/*
 * Geometry and state for the Arc ring: one segment per day of an arc.
 * Pure so it can be tested without a browser.
 */

export interface RingSegment {
  /** 1-based day of the arc. */
  day: number;
  /** SVG path for this day's stroke. */
  d: string;
}

export type RingDayState = "done" | "today" | "missed" | "upcoming";

const MAX_DAYS = 366;

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/** Degrees run clockwise from twelve o'clock. */
export function polarPoint(
  cx: number,
  cy: number,
  radius: number,
  degrees: number,
): { x: number; y: number } {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return {
    x: round(cx + radius * Math.cos(radians)),
    y: round(cy + radius * Math.sin(radians)),
  };
}

/** The gap between segments in degrees. Shrinks as the ring gets busier. */
export function segmentGap(total: number): number {
  return Math.min(3, (360 / total) * 0.25);
}

export function ringSegments(options: {
  total: number;
  /** Centre x and y, and the radius of the stroke centre line. */
  cx: number;
  cy: number;
  radius: number;
}): RingSegment[] {
  const total = Math.min(MAX_DAYS, Math.max(1, Math.floor(options.total)));
  const step = 360 / total;
  const gap = segmentGap(total);
  const segments: RingSegment[] = [];

  for (let index = 0; index < total; index += 1) {
    const start = index * step + gap / 2;
    const end = (index + 1) * step - gap / 2;
    const from = polarPoint(options.cx, options.cy, options.radius, start);
    const to = polarPoint(options.cx, options.cy, options.radius, end);
    const largeArc = end - start > 180 ? 1 : 0;
    segments.push({
      day: index + 1,
      d: `M ${from.x} ${from.y} A ${options.radius} ${options.radius} 0 ${largeArc} 1 ${to.x} ${to.y}`,
    });
  }
  return segments;
}

/**
 * `today` is the 1-based day the person is on, or null when the arc is not
 * running (finished, or not started). Without a today, every unfinished day
 * counts as upcoming.
 */
export function ringDayState(
  day: number,
  today: number | null,
  completed: ReadonlySet<number>,
): RingDayState {
  if (today !== null && day === today) return "today";
  if (completed.has(day)) return "done";
  if (today !== null && day < today) return "missed";
  return "upcoming";
}

/** The sentence a screen reader gets instead of the picture. */
export function describeRing(options: {
  total: number;
  completed: number;
  today: number | null;
}): string {
  const { total, completed, today } = options;
  const noun = completed === 1 ? "day" : "days";
  if (today === null) {
    return `${completed} of ${total} days completed.`;
  }
  return `Day ${today} of ${total}. ${completed} ${noun} completed.`;
}

/** Keeps only valid, in-range day numbers. */
export function normaliseCompleted(
  days: Iterable<number>,
  total: number,
): Set<number> {
  const result = new Set<number>();
  for (const day of days) {
    if (Number.isInteger(day) && day >= 1 && day <= total) result.add(day);
  }
  return result;
}
