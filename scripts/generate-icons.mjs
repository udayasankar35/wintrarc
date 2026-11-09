/*
 * Generates the app icons from the same ring geometry the interface uses
 * (src/lib/design/arc-ring.ts), so the icon and the in-app logomark cannot
 * drift apart.
 *
 *   node scripts/generate-icons.mjs
 *
 * Needs Node 22.18 or newer (it imports a TypeScript file directly) and a
 * Chromium that Playwright can launch. Set CHROMIUM_PATH to use a browser
 * that is already installed. The PNG files are committed, so this only runs
 * when the design changes.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { ringSegments } from "../src/lib/design/arc-ring.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const BACKGROUND = "#09090D";
const GOLD = "#FFD43B";
const TODAY = "#F5F5F5";
const FAINT = "rgba(124, 124, 136, 0.4)";

const TOTAL = 12;
const DONE = 8;
const TODAY_DAY = 9;

/**
 * One icon as SVG. The ring's outer edge sits at 37.5% of the width, inside
 * the 40% radius that Android keeps visible when it crops a maskable icon.
 */
function iconSvg(size, { rounded }) {
  const thickness = size * 0.1;
  const radius = size * 0.375 - thickness / 2;
  const segments = ringSegments({
    total: TOTAL,
    cx: size / 2,
    cy: size / 2,
    radius,
  });
  const paths = segments
    .map(({ day, d }) => {
      const colour = day <= DONE ? GOLD : day === TODAY_DAY ? TODAY : FAINT;
      return `<path d="${d}" fill="none" stroke="${colour}" stroke-width="${thickness}" stroke-linecap="butt"/>`;
    })
    .join("");
  const corner = rounded ? size * 0.22 : 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="${corner}" fill="${BACKGROUND}"/>${paths}</svg>`;
}

const OUTPUTS = [
  // Purpose "any": rounded square with transparent corners.
  { file: "public/icon-192.png", size: 192, rounded: true },
  { file: "public/icon-512.png", size: 512, rounded: true },
  // Purpose "maskable": full bleed, so the system can crop any shape.
  { file: "public/icon-maskable-512.png", size: 512, rounded: false },
  // Browser tab icon, served by Next.js from src/app/icon.png.
  { file: "src/app/icon.png", size: 192, rounded: true },
  // iOS draws its own corners and fills transparency with black.
  { file: "src/app/apple-icon.png", size: 180, rounded: false },
];

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
try {
  for (const output of OUTPUTS) {
    const page = await browser.newPage({
      viewport: { width: output.size, height: output.size },
      deviceScaleFactor: 1,
    });
    await page.setContent(
      `<!doctype html><html><body style="margin:0;background:transparent">${iconSvg(output.size, output)}</body></html>`,
    );
    const png = await page.screenshot({ omitBackground: true });
    await page.close();
    const target = path.join(root, output.file);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, png);
    console.log(
      `${output.file}  ${output.size}x${output.size}  ${png.length} bytes`,
    );
  }
} finally {
  await browser.close();
}
