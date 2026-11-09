"use client";

import { usePathname } from "next/navigation";
import {
  MORE_HREF,
  NAV_ITEMS,
  TAB_BAR_IDS,
  isActive,
  isMoreActive,
} from "@/lib/navigation";
import { MORE_ICON, NAV_ICONS } from "./nav-icons";
import { NavLink } from "./nav-link";

/** The phone navigation: four sections and More, with room for a thumb and the home indicator. */
export function TabBar() {
  const pathname = usePathname();
  const tabs = TAB_BAR_IDS.flatMap((id) => {
    const item = NAV_ITEMS.find((candidate) => candidate.id === id);
    return item ? [item] : [];
  });

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg-2 pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="flex">
        {tabs.map((item) => (
          <li key={item.id} className="flex flex-1">
            <NavLink
              href={item.href}
              label={item.label}
              icon={NAV_ICONS[item.id]}
              active={isActive(item, pathname)}
              variant="tab"
            />
          </li>
        ))}
        <li className="flex flex-1">
          <NavLink
            href={MORE_HREF}
            label="More"
            icon={MORE_ICON}
            active={isMoreActive(pathname)}
            variant="tab"
          />
        </li>
      </ul>
    </nav>
  );
}
