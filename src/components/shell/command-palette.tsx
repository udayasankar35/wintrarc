"use client";

import { Command } from "cmdk";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Search } from "lucide-react";
import { NAV_ITEMS } from "@/lib/navigation";
import { shortcutForNav } from "@/lib/shortcuts/definitions";
import { overlayClasses } from "@/components/ui/dialog";
import { NAV_ICONS } from "./nav-icons";
import { ShortcutKeys } from "./shortcut-keys";

/**
 * Jump to any section from the keyboard. Navigation only for now: create and
 * complete actions arrive with the pages that own them. Opens with Ctrl K or
 * Command K, filters as you type, Enter goes, Escape closes and returns focus.
 */
export function CommandPalette({
  open,
  onOpenChange,
  onNavigate,
  onCloseAutoFocus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (href: string) => void;
  onCloseAutoFocus?: (event: Event) => void;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={overlayClasses} />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onCloseAutoFocus={onCloseAutoFocus}
          className="fixed top-[12vh] left-1/2 z-50 w-[min(560px,calc(100vw-32px))] -translate-x-1/2 overflow-hidden rounded-card border border-border bg-card-elevated [box-shadow:var(--edge-highlight),var(--elevation-soft)] data-[state=closed]:animate-pop-out data-[state=open]:animate-pop-in"
        >
          <DialogPrimitive.Title className="sr-only">
            Jump to a section
          </DialogPrimitive.Title>
          <Command label="Jump to a section" loop>
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search aria-hidden className="size-5 shrink-0 text-text-2" />
              <Command.Input
                placeholder="Jump to a section"
                className="min-h-14 w-full bg-transparent text-body text-text outline-none placeholder:text-text-2"
              />
            </div>
            <Command.List className="max-h-[min(360px,50dvh)] overflow-y-auto p-2">
              <Command.Empty className="px-3 py-8 text-center text-body text-text-2">
                Nothing matches. Try a section name such as Habits or Settings.
              </Command.Empty>
              <Command.Group
                heading="Go to"
                className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-meta [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-text-2"
              >
                {NAV_ITEMS.map((item) => {
                  const Icon = NAV_ICONS[item.id];
                  const shortcut = shortcutForNav(item.id);
                  return (
                    <Command.Item
                      key={item.id}
                      value={`${item.label} ${item.description}`}
                      onSelect={() => onNavigate(item.href)}
                      className="flex min-h-11 cursor-default items-center gap-3 rounded-control px-3 text-body text-text data-[selected=true]:bg-bg-2"
                    >
                      <Icon
                        aria-hidden
                        className="size-5 shrink-0 text-text-2"
                      />
                      <span className="flex-1">{item.label}</span>
                      {shortcut ? (
                        <span aria-hidden className="shrink-0">
                          <ShortcutKeys keys={shortcut.keys} />
                        </span>
                      ) : null}
                    </Command.Item>
                  );
                })}
              </Command.Group>
            </Command.List>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
