import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  MAX_VISIBLE_TOASTS,
  dismissToast,
  getToasts,
  resetToasts,
  runToastAction,
  subscribeToasts,
  toast,
  undoable,
} from "./store";

beforeEach(() => {
  resetToasts();
});

describe("toast store", () => {
  it("adds a toast with a unique id and notifies subscribers", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToasts(listener);
    const a = toast({ title: "Saved" });
    const b = toast({ title: "Saved again" });
    expect(a).not.toBe(b);
    expect(getToasts().map((t) => t.title)).toEqual(["Saved", "Saved again"]);
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    toast({ title: "Quiet" });
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("keeps only the newest toasts", () => {
    for (let i = 1; i <= MAX_VISIBLE_TOASTS + 2; i += 1) {
      toast({ title: `Toast ${i}` });
    }
    const titles = getToasts().map((t) => t.title);
    expect(titles).toHaveLength(MAX_VISIBLE_TOASTS);
    expect(titles.at(-1)).toBe(`Toast ${MAX_VISIBLE_TOASTS + 2}`);
    expect(titles).not.toContain("Toast 1");
  });

  it("gives errors and actions longer to read than plain toasts", () => {
    const plainId = toast({ title: "a" });
    const actionId = undoable("b", () => {});
    const errorId = toast({ title: "c", tone: "error" });
    const durationOf = (id: string) =>
      getToasts().find((t) => t.id === id)?.duration ?? 0;
    expect(durationOf(plainId)).toBeGreaterThan(0);
    expect(durationOf(plainId)).toBeLessThan(durationOf(actionId));
    expect(durationOf(actionId)).toBeLessThan(durationOf(errorId));
  });

  it("respects an explicit duration", () => {
    const id = toast({ title: "x", duration: 1234 });
    expect(getToasts().find((t) => t.id === id)?.duration).toBe(1234);
  });

  it("labels the undo button Undo", () => {
    const id = undoable("Habit archived", () => {});
    expect(getToasts().find((t) => t.id === id)?.action?.label).toBe("Undo");
  });

  it("runs the undo action exactly once, even if tapped twice", () => {
    const onUndo = vi.fn();
    const id = undoable("Task deleted", onUndo);
    runToastAction(id);
    runToastAction(id);
    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(getToasts()).toHaveLength(0);
  });

  it("dismisses one toast and ignores unknown ids", () => {
    const keep = toast({ title: "keep" });
    const drop = toast({ title: "drop" });
    dismissToast(drop);
    dismissToast("toast-does-not-exist");
    expect(getToasts().map((t) => t.id)).toEqual([keep]);
  });
});
