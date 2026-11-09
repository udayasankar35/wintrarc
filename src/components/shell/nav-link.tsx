"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Tooltip } from "@/components/ui/tooltip";

export type NavLinkVariant = "full" | "rail" | "tab";

/*
 * One link, three shapes. The current page is marked three ways: the
 * aria-current attribute, a gold marker and a stronger label, so colour is
 * never the only signal. Gold appears on the current item only.
 */
export function NavLink({
  href,
  label,
  icon: Icon,
  active,
  variant,
  shortcut,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  variant: NavLinkVariant;
  /** Shown in the rail tooltip. */
  shortcut?: readonly string[];
  onNavigate?: () => void;
}) {
  const marker =
    "before:absolute before:rounded-full before:bg-accent-graphic before:content-['']";

  if (variant === "tab") {
    return (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        onClick={onNavigate}
        className={cn(
          "relative flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-meta",
          active ? "font-semibold text-text" : "font-medium text-text-2",
          active && cn(marker, "before:inset-x-5 before:top-0 before:h-0.5"),
        )}
      >
        <Icon
          aria-hidden
          className={cn("size-5", active && "text-accent-text")}
        />
        {label}
      </Link>
    );
  }

  if (variant === "rail") {
    return (
      <Tooltip label={label} shortcut={shortcut} side="right">
        <Link
          href={href}
          aria-label={label}
          aria-current={active ? "page" : undefined}
          onClick={onNavigate}
          className={cn(
            "relative grid size-12 place-items-center rounded-control",
            active
              ? "bg-card-elevated text-accent-text"
              : "text-text-2 hover:bg-card hover:text-text",
            active &&
              cn(marker, "before:inset-y-2.5 before:-left-3 before:w-0.5"),
          )}
        >
          <Icon aria-hidden className="size-5" />
        </Link>
      </Tooltip>
    );
  }

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        "relative flex min-h-11 items-center gap-3 rounded-control px-3 text-body",
        active
          ? "bg-card-elevated font-medium text-text"
          : "text-text-2 hover:bg-card hover:text-text",
        active && cn(marker, "before:inset-y-2.5 before:left-0 before:w-0.5"),
      )}
    >
      <Icon
        aria-hidden
        className={cn("size-5 shrink-0", active && "text-accent-text")}
      />
      {label}
    </Link>
  );
}
