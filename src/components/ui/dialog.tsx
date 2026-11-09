"use client";

import type { ReactNode } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { IconButton } from "./icon-button";

/*
 * Centre dialog for short, focused tasks and named confirmations. Radix traps
 * focus inside, closes on Escape and returns focus to the trigger.
 */
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

/**
 * Where focus goes when a dialog or drawer opens: the element marked
 * `data-autofocus` (the first field of a form, say), otherwise the panel
 * itself. Focusing the panel keeps the Close button from grabbing focus and
 * popping its tooltip, which would swallow the first Escape press.
 */
export function focusOnOpen(event: Event) {
  event.preventDefault();
  const panel = event.target;
  if (!(panel instanceof HTMLElement)) return;
  const target = panel.querySelector<HTMLElement>("[data-autofocus]");
  (target ?? panel).focus({ preventScroll: true });
}

export const overlayClasses =
  "fixed inset-0 z-50 bg-black/60 data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in";

export function DialogContent({
  title,
  description,
  children,
  className,
  showClose = true,
  onCloseAutoFocus,
}: {
  /** Required. It names the dialog for screen readers. */
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  showClose?: boolean;
  /**
   * Runs when the dialog closes. Dialogs opened by a trigger get focus back
   * on it automatically. A dialog opened some other way (a keyboard shortcut)
   * uses this to return focus to where the person was.
   */
  onCloseAutoFocus?: (event: Event) => void;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={overlayClasses} />
      <DialogPrimitive.Content
        // With no description, opt out so Radix does not warn about a missing one.
        {...(description ? {} : { "aria-describedby": undefined })}
        onOpenAutoFocus={focusOnOpen}
        onCloseAutoFocus={onCloseAutoFocus}
        className={cn(
          "fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] max-w-md overflow-y-auto rounded-card border border-border bg-card-elevated p-6 [box-shadow:var(--edge-highlight),var(--elevation-soft)] data-[state=closed]:animate-dialog-out data-[state=open]:animate-dialog-in outline-none",
          className,
        )}
      >
        <div className="grid gap-1 pr-10">
          <DialogPrimitive.Title className="text-subhead font-semibold">
            {title}
          </DialogPrimitive.Title>
          {description ? (
            <DialogPrimitive.Description className="text-secondary text-text-2">
              {description}
            </DialogPrimitive.Description>
          ) : null}
        </div>
        <div className="mt-5">{children}</div>
        {showClose ? (
          <DialogPrimitive.Close asChild>
            <IconButton
              label="Close"
              icon={X}
              shortcut={["Escape"]}
              className="absolute top-3 right-3"
            />
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

/** Buttons row at the bottom of a dialog. Primary action last. */
export function DialogFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
    >
      {children}
    </div>
  );
}
