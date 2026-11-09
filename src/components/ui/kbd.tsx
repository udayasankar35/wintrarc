"use client";

import { formatKey } from "@/lib/shortcuts/format";
import { usePlatform } from "@/lib/shortcuts/use-platform";
import { cn } from "@/lib/cn";

/** Key caps for a shortcut, such as Ctrl K or ⌘ K. */
export function Kbd({
  keys,
  className,
}: {
  keys: readonly string[];
  className?: string;
}) {
  const platform = usePlatform();
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {keys.map((key, index) => (
        <kbd
          key={`${key}-${index}`}
          className="inline-flex h-6 min-w-6 items-center justify-center rounded-control border border-border bg-bg-2 px-1.5 text-meta font-medium text-text-2"
        >
          {formatKey(key, platform)}
        </kbd>
      ))}
    </span>
  );
}
