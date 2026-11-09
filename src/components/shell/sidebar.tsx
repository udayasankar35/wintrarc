"use client";

import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { NAV_ITEMS, isActive } from "@/lib/navigation";
import { ariaKeyShortcuts } from "@/lib/shortcuts/format";
import { usePlatform } from "@/lib/shortcuts/use-platform";
import { Kbd } from "@/components/ui/kbd";
import { Brand } from "./brand";
import { InstallPrompt } from "./install-prompt";
import { NAV_ICONS } from "./nav-icons";
import { NavLink } from "./nav-link";
import { useShortcutUi } from "./shortcuts-provider";

/** The full navigation list. Used by the desktop sidebar and the tablet drawer. */
export function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main">
      <ul className="grid gap-1">
        {NAV_ITEMS.map((item) => (
          <li key={item.id}>
            <NavLink
              href={item.href}
              label={item.label}
              icon={NAV_ICONS[item.id]}
              active={isActive(item, pathname)}
              variant="full"
              onNavigate={onNavigate}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function JumpButton({ className }: { className?: string }) {
  const { openPalette } = useShortcutUi();
  const platform = usePlatform();
  return (
    <button
      type="button"
      onClick={openPalette}
      aria-keyshortcuts={ariaKeyShortcuts(["Mod", "k"], platform)}
      className={
        className ??
        "flex min-h-11 w-full items-center gap-3 rounded-control border border-border bg-bg px-3 text-body text-text-2 hover:border-control"
      }
    >
      <Search aria-hidden className="size-4 shrink-0" />
      <span className="flex-1 text-left">Jump to</span>
      <Kbd keys={["Mod", "k"]} />
    </button>
  );
}

/** Persistent navigation from 1024px up. */
export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col gap-6 border-r border-border bg-bg-2 px-4 py-5 lg:flex">
      <Brand className="px-1" />
      <JumpButton />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <NavList />
      </div>
      <InstallPrompt className="w-full" />
    </aside>
  );
}
