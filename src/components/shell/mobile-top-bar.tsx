"use client";

import { Search } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { Brand } from "./brand";
import { useShortcutUi } from "./shortcuts-provider";

/** The phone header: the brand on the left, search on the right. Solid, not translucent. */
export function MobileTopBar() {
  const { openPalette } = useShortcutUi();
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-bg px-4 md:hidden">
      <Brand />
      <IconButton
        label="Jump to a section"
        icon={Search}
        shortcut={["Mod", "k"]}
        tooltipSide="bottom"
        onClick={openPalette}
        className="-mr-2"
      />
    </header>
  );
}
