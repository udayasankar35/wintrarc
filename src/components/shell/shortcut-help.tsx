"use client";

import { SHORTCUTS } from "@/lib/shortcuts/definitions";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ShortcutKeys } from "./shortcut-keys";

/** Every shortcut grouped by purpose. Shared with the Settings page. */
export function ShortcutList() {
  const groups = ["General", "Go to"] as const;
  return (
    <div className="grid gap-6">
      {groups.map((group) => (
        <section key={group} aria-labelledby={`shortcuts-${group}`}>
          <h3
            id={`shortcuts-${group}`}
            className="mb-2 text-secondary font-medium text-text-2"
          >
            {group}
          </h3>
          <dl className="divide-y divide-border rounded-card border border-border">
            {SHORTCUTS.filter((s) => s.group === group).map((s) => (
              <div
                key={s.id}
                className="flex min-h-11 items-center justify-between gap-4 px-4 py-2"
              >
                <dt className="text-body">{s.label}</dt>
                <dd>
                  <ShortcutKeys keys={s.keys} />
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

export function ShortcutHelp({
  open,
  onOpenChange,
  onCloseAutoFocus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus?: (event: Event) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Keyboard shortcuts"
        description="Letters work when you are not typing in a field."
        className="max-w-lg"
        onCloseAutoFocus={onCloseAutoFocus}
      >
        <ShortcutList />
      </DialogContent>
    </Dialog>
  );
}
