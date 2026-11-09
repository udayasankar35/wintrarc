import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  composite,
  contrastRatio,
  extractRule,
  parseColor,
  parseDeclarations,
  relativeLuminance,
} from "./contrast";

describe("contrast maths", () => {
  it("gives 21:1 for black on white and 1:1 for identical colours", () => {
    expect(
      contrastRatio(parseColor("#000"), parseColor("#ffffff")),
    ).toBeCloseTo(21, 5);
    expect(contrastRatio(parseColor("#777"), parseColor("#777777"))).toBe(1);
  });

  it("matches the published WCAG value for #767676 on white (4.54:1)", () => {
    const ratio = contrastRatio(parseColor("#767676"), parseColor("#fff"));
    expect(ratio).toBeGreaterThan(4.5);
    expect(ratio).toBeLessThan(4.6);
  });

  it("parses modern rgb() with alpha and composites it", () => {
    const hairline = parseColor("rgb(255 255 255 / 0.08)");
    expect(hairline.a).toBeCloseTo(0.08);
    const over = composite(hairline, parseColor("#000000"));
    expect(over.r).toBeCloseTo(20.4);
    expect(relativeLuminance(over)).toBeGreaterThan(0);
  });

  it("rejects colours it does not understand", () => {
    expect(() => parseColor("hotpink")).toThrow();
  });
});

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
const dark = parseDeclarations(extractRule(css, ":root"));
const lightOverrides = parseDeclarations(
  extractRule(css, ':root[data-theme="light"]'),
);

const themes = {
  dark,
  // The light block only restates tokens that change.
  light: { ...dark, ...lightOverrides },
} as const;

const surfaces = ["--bg", "--bg-2", "--card", "--card-elevated"] as const;

function colorOf(theme: keyof typeof themes, token: string) {
  const value = themes[theme][token];
  if (value === undefined) throw new Error(`${theme}: ${token} is not defined`);
  return parseColor(value);
}

/** Text must reach 4.5:1 (WCAG AA body text). */
const textTokens = [
  "--text",
  "--text-2",
  "--accent-text",
  "--success",
  "--error",
] as const;

/** Controls and graphics must reach 3:1 (WCAG AA non-text contrast). */
const graphicTokens = ["--control", "--ring", "--accent-graphic"] as const;

describe.each(["dark", "light"] as const)("%s theme tokens", (theme) => {
  for (const token of textTokens) {
    for (const surface of surfaces) {
      it(`${token} reads on ${surface} at 4.5:1 or more`, () => {
        const ratio = contrastRatio(
          colorOf(theme, token),
          colorOf(theme, surface),
        );
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });
    }
  }

  for (const token of graphicTokens) {
    for (const surface of surfaces) {
      it(`${token} is visible on ${surface} at 3:1 or more`, () => {
        const ratio = contrastRatio(
          colorOf(theme, token),
          colorOf(theme, surface),
        );
        expect(ratio).toBeGreaterThanOrEqual(3);
      });
    }
  }

  for (const fill of ["--accent", "--accent-2"] as const) {
    it(`text on the ${fill} fill reaches 4.5:1`, () => {
      const ratio = contrastRatio(
        colorOf(theme, "--on-accent"),
        colorOf(theme, fill),
      );
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  }

  it("keeps the hairline border as a translucent colour", () => {
    expect(colorOf(theme, "--border").a).toBeLessThan(0.2);
  });
});

describe("token sets", () => {
  it("defines the full palette from the design system in dark", () => {
    expect(parseColor(dark["--bg"] ?? "")).toMatchObject({ r: 9, g: 9, b: 13 });
    expect(dark["--accent"]).toBe("#ffd43b");
    expect(dark["--accent-2"]).toBe("#f5b82e");
    expect(dark["--text"]).toBe("#f5f5f5");
    expect(dark["--text-2"]).toBe("#92929d");
  });

  it("restates every colour that must differ in light", () => {
    for (const token of [
      "--bg",
      "--bg-2",
      "--card",
      "--text",
      "--text-2",
      "--accent-text",
      "--accent-graphic",
      "--success",
      "--error",
      "--control",
      "--ring",
      "--on-accent",
    ]) {
      expect(lightOverrides[token], token).toBeDefined();
    }
  });

  it("uses only the three type weights and six sizes of the design system", () => {
    const body = extractRule(css, "@theme");
    const sizes = [...body.matchAll(/--text-([a-z]+):\s*([\d.]+)rem;/g)].map(
      (m) => Math.round(Number(m[2]) * 16),
    );
    expect(sizes).toEqual([12, 14, 16, 20, 28, 40]);
    const weights = [...body.matchAll(/--font-weight-([a-z]+):\s*(\d+);/g)].map(
      (m) => Number(m[2]),
    );
    expect(weights).toEqual([400, 500, 600]);
  });

  it("animates only with the three approved durations", () => {
    expect(dark["--dur-fast"]).toBe("120ms");
    expect(dark["--dur-base"]).toBe("200ms");
    expect(dark["--dur-slow"]).toBe("320ms");
  });
});
