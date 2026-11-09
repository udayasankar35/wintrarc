"use client";

import type { ReactElement } from "react";
import { Tooltip as TooltipPrimitive } from "radix-ui";
import { Kbd } from "./kbd";

/** Mount once near the root. Shared timing makes neighbouring tooltips feel instant. */
export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return (
    <TooltipPrimitive.Provider delayDuration={300} skipDelayDuration={200}>
      {children}
    </TooltipPrimitive.Provider>
  );
}

/**
 * A real tooltip: it opens on hover and on keyboard focus, and can show a
 * shortcut. It is a hint only. The control it wraps still needs its own
 * accessible name.
 */
export function Tooltip({
  label,
  shortcut,
  side = "top",
  children,
}: {
  label: string;
  shortcut?: readonly string[];
  side?: "top" | "right" | "bottom" | "left";
  children: ReactElement;
}) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={8}
          collisionPadding={8}
          className="z-[60] flex items-center gap-2 rounded-control border border-border bg-card-elevated px-2.5 py-1.5 text-meta text-text shadow-soft data-[state=closed]:animate-pop-out data-[state=delayed-open]:animate-pop-in data-[state=instant-open]:animate-pop-in"
        >
          {label}
          {shortcut ? <Kbd keys={shortcut} /> : null}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
