"use client";

import type { ReactNode } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { IconButton } from "./icon-button";
import { focusOnOpen, overlayClasses } from "./dialog";

/*
 * A panel that slides in from an edge: from the side for navigation or a
 * longer edit, from the bottom as a sheet on phones. Same focus handling as a
 * dialog, since it is one underneath.
 */
export const Drawer = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerClose = DialogPrimitive.Close;

const drawerVariants = cva(
  "fixed z-50 flex flex-col border-border bg-card-elevated [box-shadow:var(--edge-highlight),var(--elevation-soft)]",
  {
    variants: {
      side: {
        left: "inset-y-0 left-0 h-dvh w-[min(320px,86vw)] border-r data-[state=closed]:animate-slide-out-left data-[state=open]:animate-slide-in-left",
        right:
          "inset-y-0 right-0 h-dvh w-[min(420px,92vw)] border-l data-[state=closed]:animate-slide-out-right data-[state=open]:animate-slide-in-right",
        bottom:
          "inset-x-0 bottom-0 max-h-[88dvh] rounded-t-card border-t pb-[env(safe-area-inset-bottom)] data-[state=closed]:animate-slide-out-bottom data-[state=open]:animate-slide-in-bottom",
      },
    },
    defaultVariants: { side: "right" },
  },
);

export function DrawerContent({
  title,
  description,
  side,
  children,
  className,
}: {
  /** Required. It names the panel for screen readers. */
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
} & VariantProps<typeof drawerVariants>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={overlayClasses} />
      <DialogPrimitive.Content
        // With no description, opt out so Radix does not warn about a missing one.
        {...(description ? {} : { "aria-describedby": undefined })}
        onOpenAutoFocus={focusOnOpen}
        className={cn(drawerVariants({ side }), "outline-none", className)}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border p-4">
          <div className="grid gap-1">
            <DialogPrimitive.Title className="text-subhead font-semibold">
              {title}
            </DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="text-secondary text-text-2">
                {description}
              </DialogPrimitive.Description>
            ) : null}
          </div>
          <DialogPrimitive.Close asChild>
            <IconButton label="Close" icon={X} shortcut={["Escape"]} />
          </DialogPrimitive.Close>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
