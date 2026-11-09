import localFont from "next/font/local";

/*
 * Fonts are self-hosted from npm (Fontsource, SIL OFL licence) because the
 * build cannot reach Google Fonts. Only the Latin subset ships. The declared
 * weight range stops at 600 on purpose: the design system uses 400, 500, 600.
 */

// Schibsted Grotesk carries all running text.
export const textFont = localFont({
  src: "../../node_modules/@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2",
  weight: "400 600",
  style: "normal",
  display: "swap",
  variable: "--font-text-loaded",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

// Chivo Mono carries ledger numerals. Every digit has the same width.
export const numeralFont = localFont({
  src: "../../node_modules/@fontsource-variable/chivo-mono/files/chivo-mono-latin-wght-normal.woff2",
  weight: "400 600",
  style: "normal",
  display: "swap",
  variable: "--font-numeral-loaded",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});
