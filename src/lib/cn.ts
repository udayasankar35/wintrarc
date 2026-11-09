import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/*
 * tailwind-merge has to know the design system's own class names. Without
 * this, `text-secondary` (a font size) and `text-text-2` (a colour) both look
 * like colours to it and one silently replaces the other.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["meta", "secondary", "body", "subhead", "title", "display"],
      "font-weight": ["normal", "medium", "semibold"],
      radius: ["card", "control"],
      shadow: ["soft"],
      color: [
        "bg",
        "bg-2",
        "card",
        "card-elevated",
        "accent",
        "accent-2",
        "on-accent",
        "accent-text",
        "accent-graphic",
        "text",
        "text-2",
        "success",
        "error",
        "border",
        "control",
        "ring",
      ],
    },
  },
});

/** Joins class names and resolves Tailwind conflicts, last one wins. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
