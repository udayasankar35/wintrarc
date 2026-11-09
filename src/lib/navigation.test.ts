import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  MORE_HREF,
  MORE_ITEMS,
  NAV_ITEMS,
  QUICK_ACTION_PATHS,
  TAB_BAR_IDS,
  isActive,
  isMoreActive,
} from "./navigation";

const item = (id: string) => {
  const found = NAV_ITEMS.find((i) => i.id === id);
  if (!found) throw new Error(`no nav item ${id}`);
  return found;
};

describe("navigation list", () => {
  it("has unique ids, links, labels and jump keys", () => {
    for (const field of ["id", "href", "label", "jumpKey"] as const) {
      const values = NAV_ITEMS.map((i) => i[field]);
      expect(new Set(values).size, field).toBe(values.length);
    }
  });

  it("points every link at a real page file, so no link can 404", () => {
    const routes = [...NAV_ITEMS.map((i) => i.href), MORE_HREF];
    for (const href of routes) {
      const segment = href === "/" ? "" : href;
      const file = join(process.cwd(), "src/app/(app)", segment, "page.tsx");
      expect(existsSync(file), `${href} -> ${file}`).toBe(true);
    }
  });

  it("gives every quick action a page that exists", () => {
    for (const target of Object.values(QUICK_ACTION_PATHS)) {
      const path = target.split("?")[0] ?? "";
      expect(
        NAV_ITEMS.some((i) => i.href === path),
        target,
      ).toBe(true);
    }
  });

  it("keeps descriptions short and calm", () => {
    for (const i of NAV_ITEMS) {
      expect(i.description.length, i.id).toBeLessThanOrEqual(60);
      expect(i.description.endsWith("."), i.id).toBe(true);
    }
  });
});

describe("tab bar and More", () => {
  it("puts four sections in the tab bar and the rest under More", () => {
    expect(TAB_BAR_IDS).toHaveLength(4);
    expect(MORE_ITEMS.length + TAB_BAR_IDS.length).toBe(NAV_ITEMS.length);
    for (const id of TAB_BAR_IDS) {
      expect(MORE_ITEMS.some((i) => i.id === id)).toBe(false);
    }
  });
});

describe("active state", () => {
  it("matches Today only on the exact root", () => {
    expect(isActive(item("today"), "/")).toBe(true);
    expect(isActive(item("today"), "/habits")).toBe(false);
  });

  it("matches a section and its children but not a lookalike prefix", () => {
    expect(isActive(item("habits"), "/habits")).toBe(true);
    expect(isActive(item("habits"), "/habits/abc")).toBe(true);
    expect(isActive(item("habits"), "/habitsx")).toBe(false);
  });

  it("marks More active for the page itself and for sections inside it", () => {
    expect(isMoreActive("/more")).toBe(true);
    expect(isMoreActive("/settings")).toBe(true);
    expect(isMoreActive("/analytics")).toBe(true);
    expect(isMoreActive("/habits")).toBe(false);
    expect(isMoreActive("/")).toBe(false);
  });
});
