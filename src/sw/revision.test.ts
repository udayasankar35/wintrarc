import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { sourceRevision } from "./revision";

const dirs: string[] = [];

function tree(files: Record<string, string>): string {
  const root = mkdtempSync(path.join(tmpdir(), "wintrarc-rev-"));
  dirs.push(root);
  for (const [name, content] of Object.entries(files)) {
    const full = path.join(root, name);
    mkdirSync(path.dirname(full), { recursive: true });
    writeFileSync(full, content);
  }
  return root;
}

afterEach(() => {
  for (const dir of dirs.splice(0))
    rmSync(dir, { recursive: true, force: true });
});

describe("sourceRevision", () => {
  it("is stable for the same files", () => {
    const files = { "src/a.ts": "a", "public/x.png": "x" };
    expect(sourceRevision(tree(files))).toBe(sourceRevision(tree(files)));
  });

  it("is a short hex string", () => {
    expect(sourceRevision(tree({ "src/a.ts": "a" }))).toMatch(/^[0-9a-f]{16}$/);
  });

  it("changes when a source file changes", () => {
    const one = sourceRevision(tree({ "src/a.ts": "a" }));
    const two = sourceRevision(tree({ "src/a.ts": "b" }));
    expect(one).not.toBe(two);
  });

  it("changes when a file is renamed", () => {
    const one = sourceRevision(tree({ "src/a.ts": "a" }));
    const two = sourceRevision(tree({ "src/b.ts": "a" }));
    expect(one).not.toBe(two);
  });

  it("changes with the lockfile", () => {
    const one = sourceRevision(
      tree({ "src/a.ts": "a", "package-lock.json": "1" }),
    );
    const two = sourceRevision(
      tree({ "src/a.ts": "a", "package-lock.json": "2" }),
    );
    expect(one).not.toBe(two);
  });

  it("ignores build output and dependencies", () => {
    const base = sourceRevision(tree({ "src/a.ts": "a" }));
    const noisy = sourceRevision(
      tree({
        "src/a.ts": "a",
        ".next/x.js": "build output",
        "node_modules/y/index.js": "dep",
      }),
    );
    expect(noisy).toBe(base);
  });

  it("does not throw for an empty tree", () => {
    expect(() => sourceRevision(tree({}))).not.toThrow();
  });
});
