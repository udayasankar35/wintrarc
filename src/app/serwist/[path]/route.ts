import { createSerwistRoute } from "@serwist/turbopack";
import { NextResponse } from "next/server";
import { sourceRevision } from "@/sw/revision";

/*
 * Builds src/sw/sw.ts with esbuild at `next build` and serves it from
 * /serwist/sw.js (and its source map). Next.js 16 with Cache Components does
 * not allow the `dynamic`, `dynamicParams` and `revalidate` exports that
 * createSerwistRoute also returns, so only the two handlers are re-exported.
 */
const route = createSerwistRoute({
  swSrc: "src/sw/sw.ts",
  useNativeEsbuild: true,
  // The default pattern leaves out fonts, which the offline page needs.
  globPatterns: [
    ".next/static/**/*.{js,css,woff2,ico,png,jpg,jpeg,svg,webp,avif,json}",
    "public/**/*",
  ],
  additionalPrecacheEntries: [{ url: "/offline", revision: sourceRevision() }],
});

export const generateStaticParams = route.generateStaticParams;

// The only files this route produces. Anything else is a 404 and never
// reaches the bundler, which is not available when the app is running.
const SERVED = new Set(["sw.js", "sw.js.map"]);

export async function GET(
  request: Request,
  context: { params: Promise<{ path: string }> },
) {
  const { path } = await context.params;
  if (!SERVED.has(path)) {
    return new NextResponse("Not found", { status: 404 });
  }
  return route.GET(request, context);
}
