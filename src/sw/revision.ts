import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const SKIP = new Set(["node_modules", ".next", ".git"]);

function collect(dir: string, base: string, into: string[]): void {
  for (const name of readdirSync(dir).sort()) {
    if (SKIP.has(name)) continue;
    const full = path.join(/*turbopackIgnore: true*/ dir, name);
    if (statSync(full).isDirectory()) collect(full, base, into);
    else into.push(path.relative(base, full));
  }
}

/**
 * A short, deterministic fingerprint of everything that can change the
 * offline page: the source, the public files, the lockfile and the Next
 * config. The service worker uses it as the precache revision, so a new
 * build refetches the offline page and an unchanged build does not.
 *
 * It is not random on purpose. The route that serves the worker is built in
 * more than one pass, and every pass must produce the same file.
 */
export function sourceRevision(root: string = process.cwd()): string {
  const hash = createHash("sha256");
  const files: string[] = [];
  for (const folder of ["src", "public"]) {
    try {
      collect(path.join(/*turbopackIgnore: true*/ root, folder), root, files);
    } catch {
      // A missing folder simply contributes nothing.
    }
  }
  for (const single of ["package-lock.json", "next.config.ts"]) {
    try {
      statSync(path.join(/*turbopackIgnore: true*/ root, single));
      files.push(single);
    } catch {
      // Not present in this tree.
    }
  }
  for (const file of files) {
    hash.update(file.split(path.sep).join("/"));
    hash.update("\0");
    hash.update(readFileSync(path.join(/*turbopackIgnore: true*/ root, file)));
    hash.update("\0");
  }
  return hash.digest("hex").slice(0, 16);
}
