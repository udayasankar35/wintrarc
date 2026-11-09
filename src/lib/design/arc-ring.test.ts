import { describe, expect, it } from "vitest";
import {
  describeRing,
  normaliseCompleted,
  polarPoint,
  ringDayState,
  ringSegments,
  segmentGap,
} from "./arc-ring";

const CENTRE = 100;
const RADIUS = 80;

function endpoints(d: string) {
  const numbers = (d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
  // M x y A rx ry rot large sweep x y
  return {
    from: { x: numbers[0] as number, y: numbers[1] as number },
    to: { x: numbers[7] as number, y: numbers[8] as number },
  };
}

function angleOf(point: { x: number; y: number }): number {
  const degrees =
    (Math.atan2(point.y - CENTRE, point.x - CENTRE) * 180) / Math.PI + 90;
  return (degrees + 360) % 360;
}

describe("polarPoint", () => {
  it("puts 0 degrees at twelve o'clock and runs clockwise", () => {
    expect(polarPoint(100, 100, 50, 0)).toEqual({ x: 100, y: 50 });
    expect(polarPoint(100, 100, 50, 90)).toEqual({ x: 150, y: 100 });
    expect(polarPoint(100, 100, 50, 180)).toEqual({ x: 100, y: 150 });
    expect(polarPoint(100, 100, 50, 270)).toEqual({ x: 50, y: 100 });
  });
});

describe("ringSegments", () => {
  it.each([30, 60, 90])(
    "draws one segment per day for a %d-day arc",
    (total) => {
      const segments = ringSegments({
        total,
        cx: CENTRE,
        cy: CENTRE,
        radius: RADIUS,
      });
      expect(segments).toHaveLength(total);
      expect(segments.map((s) => s.day)).toEqual(
        Array.from({ length: total }, (_, i) => i + 1),
      );
    },
  );

  it("keeps every endpoint on the circle", () => {
    for (const { d } of ringSegments({
      total: 30,
      cx: CENTRE,
      cy: CENTRE,
      radius: RADIUS,
    })) {
      const { from, to } = endpoints(d);
      for (const point of [from, to]) {
        const distance = Math.hypot(point.x - CENTRE, point.y - CENTRE);
        expect(distance).toBeCloseTo(RADIUS, 1);
      }
    }
  });

  it("starts at the top and moves clockwise without overlapping", () => {
    const segments = ringSegments({
      total: 30,
      cx: CENTRE,
      cy: CENTRE,
      radius: RADIUS,
    });
    const first = endpoints(segments[0]?.d ?? "");
    // Day 1 begins just past twelve o'clock.
    expect(angleOf(first.from)).toBeGreaterThan(0);
    expect(angleOf(first.from)).toBeLessThan(5);

    let previousEnd = -1;
    for (const { d } of segments) {
      const { from, to } = endpoints(d);
      const start = angleOf(from);
      const end = angleOf(to);
      expect(start).toBeGreaterThan(previousEnd);
      expect(end).toBeGreaterThan(start);
      previousEnd = end;
    }
  });

  it("leaves a gap between segments and shrinks it for busy rings", () => {
    expect(segmentGap(30)).toBe(3);
    expect(segmentGap(90)).toBe(1);
    expect(segmentGap(366)).toBeLessThan(1);
  });

  it("clamps absurd totals to a usable ring", () => {
    expect(ringSegments({ total: 0, cx: 50, cy: 50, radius: 40 })).toHaveLength(
      1,
    );
    expect(
      ringSegments({ total: 5000, cx: 50, cy: 50, radius: 40 }),
    ).toHaveLength(366);
  });

  it("never produces NaN in a path", () => {
    for (const total of [1, 2, 7, 30, 90, 366]) {
      for (const { d } of ringSegments({ total, cx: 60, cy: 60, radius: 50 })) {
        expect(d).not.toMatch(/NaN|Infinity/);
      }
    }
  });
});

describe("ringDayState", () => {
  const done = new Set([1, 2, 4]);

  it("marks today, done, missed and upcoming days", () => {
    expect(ringDayState(5, 5, done)).toBe("today");
    expect(ringDayState(2, 5, done)).toBe("done");
    expect(ringDayState(3, 5, done)).toBe("missed");
    expect(ringDayState(9, 5, done)).toBe("upcoming");
  });

  it("keeps today distinct even when today is already done", () => {
    expect(ringDayState(5, 5, new Set([5]))).toBe("today");
  });

  it("treats unfinished days as upcoming when no arc is running", () => {
    expect(ringDayState(3, null, done)).toBe("upcoming");
    expect(ringDayState(2, null, done)).toBe("done");
  });
});

describe("describeRing", () => {
  it("says where you are in a running arc", () => {
    expect(describeRing({ total: 30, completed: 9, today: 12 })).toBe(
      "Day 12 of 30. 9 days completed.",
    );
    expect(describeRing({ total: 30, completed: 1, today: 2 })).toBe(
      "Day 2 of 30. 1 day completed.",
    );
  });

  it("describes a ring with no running arc", () => {
    expect(describeRing({ total: 90, completed: 40, today: null })).toBe(
      "40 of 90 days completed.",
    );
  });
});

describe("normaliseCompleted", () => {
  it("drops out-of-range, fractional and duplicate days", () => {
    const result = normaliseCompleted([0, 1, 1, 2.5, 30, 31, -4], 30);
    expect([...result].sort((a, b) => a - b)).toEqual([1, 30]);
  });
});
