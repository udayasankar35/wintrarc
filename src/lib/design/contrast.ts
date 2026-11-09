/*
 * WCAG 2.x contrast maths. Pure, so CI can check the design tokens.
 * https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */

export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** Parses #rgb, #rrggbb, rgb(r g b), rgb(r, g, b) and rgb(r g b / a). */
export function parseColor(input: string): Rgba {
  const value = input.trim().toLowerCase();

  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(value);
  if (hex) {
    const digits = hex[1] as string;
    const full =
      digits.length === 3
        ? digits
            .split("")
            .map((c) => c + c)
            .join("")
        : digits;
    return {
      r: parseInt(full.slice(0, 2), 16),
      g: parseInt(full.slice(2, 4), 16),
      b: parseInt(full.slice(4, 6), 16),
      a: 1,
    };
  }

  const fn =
    /^rgba?\(\s*(\d+(?:\.\d+)?)[\s,]+(\d+(?:\.\d+)?)[\s,]+(\d+(?:\.\d+)?)(?:\s*[/,]\s*(\d*\.?\d+%?))?\s*\)$/.exec(
      value,
    );
  if (fn) {
    const alphaRaw = fn[4];
    let a = 1;
    if (alphaRaw !== undefined) {
      a = alphaRaw.endsWith("%")
        ? parseFloat(alphaRaw) / 100
        : parseFloat(alphaRaw);
    }
    return { r: Number(fn[1]), g: Number(fn[2]), b: Number(fn[3]), a };
  }

  throw new Error(`Unsupported colour: ${input}`);
}

/** Paints a translucent colour over an opaque background. */
export function composite(foreground: Rgba, background: Rgba): Rgba {
  const a = foreground.a;
  return {
    r: foreground.r * a + background.r * (1 - a),
    g: foreground.g * a + background.g * (1 - a),
    b: foreground.b * a + background.b * (1 - a),
    a: 1,
  };
}

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(color: Rgba): number {
  return (
    0.2126 * channel(color.r) +
    0.7152 * channel(color.g) +
    0.0722 * channel(color.b)
  );
}

export function contrastRatio(a: Rgba, b: Rgba): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Pulls `--name: value;` declarations out of one CSS rule body. */
export function parseDeclarations(body: string): Record<string, string> {
  const result: Record<string, string> = {};
  const withoutComments = body.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const match of withoutComments.matchAll(
    /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi,
  )) {
    result[match[1] as string] = (match[2] as string).trim();
  }
  return result;
}

/** Returns the body of the first rule whose selector is exactly `selector`. */
export function extractRule(css: string, selector: string): string {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const start = withoutComments.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`Rule not found: ${selector}`);
  const open = withoutComments.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < withoutComments.length; i += 1) {
    const char = withoutComments[i];
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return withoutComments.slice(open + 1, i);
    }
  }
  throw new Error(`Unterminated rule: ${selector}`);
}
