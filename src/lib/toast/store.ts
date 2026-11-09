/*
 * A tiny external store for toasts, so any code can show one without a
 * provider in between. The <Toaster /> component subscribes to it.
 */

export type ToastTone = "neutral" | "success" | "error";

export interface ToastAction {
  label: string;
  onAction: () => void;
}

export interface ToastInput {
  title: string;
  description?: string;
  tone?: ToastTone;
  action?: ToastAction;
  /** Milliseconds before it closes by itself. */
  duration?: number;
}

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
  action?: ToastAction;
  duration: number;
}

/** Older toasts are dropped beyond this, so the screen never fills up. */
export const MAX_VISIBLE_TOASTS = 3;

const DEFAULT_DURATION = 4000;
const ACTION_DURATION = 6000;
const ERROR_DURATION = 8000;

let items: readonly ToastItem[] = [];
let counter = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeToasts(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getToasts(): readonly ToastItem[] {
  return items;
}

/** Shows a toast and returns its id. */
export function toast(input: ToastInput): string {
  counter += 1;
  const tone = input.tone ?? "neutral";
  const item: ToastItem = {
    id: `toast-${counter}`,
    title: input.title,
    description: input.description,
    tone,
    action: input.action,
    duration:
      input.duration ??
      (tone === "error"
        ? ERROR_DURATION
        : input.action
          ? ACTION_DURATION
          : DEFAULT_DURATION),
  };
  items = [...items, item].slice(-MAX_VISIBLE_TOASTS);
  emit();
  return item.id;
}

/** A toast with an Undo button. The same word is used for the button and the result. */
export function undoable(
  title: string,
  onUndo: () => void,
  options: Omit<ToastInput, "title" | "action"> = {},
): string {
  return toast({
    ...options,
    title,
    action: { label: "Undo", onAction: onUndo },
  });
}

export function dismissToast(id: string): void {
  if (!items.some((item) => item.id === id)) return;
  items = items.filter((item) => item.id !== id);
  emit();
}

/**
 * Runs a toast's action once. The toast is removed first, so a second tap on
 * a slow device cannot run the action twice.
 */
export function runToastAction(id: string): void {
  const item = items.find((candidate) => candidate.id === id);
  if (!item) return;
  dismissToast(id);
  item.action?.onAction();
}

/** Clears everything. Used by tests. */
export function resetToasts(): void {
  items = [];
  counter = 0;
  emit();
}
