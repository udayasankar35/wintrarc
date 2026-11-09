"use client";

import type { ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { usePlatform } from "@/lib/shortcuts/use-platform";
import { ariaKeyShortcuts } from "@/lib/shortcuts/format";
import { cn } from "@/lib/cn";
import { Tooltip } from "./tooltip";

const iconButtonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center rounded-control",
    "transition-transform duration-(--dur-fast) ease-(--ease) active:scale-95",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        ghost: "text-text-2 hover:bg-card-elevated hover:text-text",
        secondary:
          "border border-border bg-card-elevated text-text hover:border-control",
      },
    },
    defaultVariants: { variant: "ghost" },
  },
);

export interface IconButtonProps
  extends
    Omit<ComponentProps<"button">, "children" | "aria-label">,
    VariantProps<typeof iconButtonVariants> {
  /** The verb-first name, such as "Open menu". Used as accessible name and tooltip. */
  label: string;
  icon: LucideIcon;
  /** Shown in the tooltip, for example ["Mod", "k"]. */
  shortcut?: readonly string[];
  tooltipSide?: "top" | "right" | "bottom" | "left";
}

/**
 * Always a square 44 by 44 tap area. Every icon button has a tooltip that
 * opens on hover and on focus, plus the same text as its accessible name.
 */
export function IconButton({
  label,
  icon: Icon,
  shortcut,
  tooltipSide,
  variant,
  className,
  type,
  ...props
}: IconButtonProps) {
  const platform = usePlatform();
  return (
    <Tooltip label={label} shortcut={shortcut} side={tooltipSide}>
      <button
        type={type ?? "button"}
        aria-label={label}
        aria-keyshortcuts={
          shortcut ? ariaKeyShortcuts(shortcut, platform) : undefined
        }
        className={cn(iconButtonVariants({ variant }), "size-11", className)}
        {...props}
      >
        <Icon aria-hidden className="size-5" />
      </button>
    </Tooltip>
  );
}
