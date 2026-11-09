"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { PanelLeft, Search } from "lucide-react";
import { NAV_ITEMS, isActive } from "@/lib/navigation";
import { shortcutForNav } from "@/lib/shortcuts/definitions";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { IconButton } from "@/components/ui/icon-button";
import { Brand } from "./brand";
import { InstallPrompt } from "./install-prompt";
import { NAV_ICONS } from "./nav-icons";
import { NavLink } from "./nav-link";
import { useShortcutUi } from "./shortcuts-provider";
import { NavList } from "./sidebar";

/**
 * Icon rail for tablets (768 to 1023px). The button at the bottom expands it
 * into the full list with labels, as a panel over the page, so the layout
 * itself never has to animate its width.
 */
export function Rail() {
  const pathname = usePathname();
  const { openPalette } = useShortcutUi();
  const [expanded, setExpanded] = useState(false);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[72px] flex-col items-center gap-4 border-r border-border bg-bg-2 py-5 md:flex lg:hidden">
      <Brand showName={false} />
      <IconButton
        label="Jump to a section"
        icon={Search}
        shortcut={["Mod", "k"]}
        tooltipSide="right"
        onClick={openPalette}
      />
      <nav aria-label="Main" className="min-h-0 flex-1 overflow-y-auto px-3">
        <ul className="grid gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <NavLink
                href={item.href}
                label={item.label}
                icon={NAV_ICONS[item.id]}
                active={isActive(item, pathname)}
                variant="rail"
                shortcut={shortcutForNav(item.id)?.keys}
              />
            </li>
          ))}
        </ul>
      </nav>
      <Drawer open={expanded} onOpenChange={setExpanded}>
        <DrawerTrigger asChild>
          <IconButton
            label="Show section names"
            icon={PanelLeft}
            tooltipSide="right"
          />
        </DrawerTrigger>
        <DrawerContent side="left" title="Sections">
          <div className="grid gap-6">
            <NavList onNavigate={() => setExpanded(false)} />
            <InstallPrompt className="w-full" />
          </div>
        </DrawerContent>
      </Drawer>
    </aside>
  );
}
