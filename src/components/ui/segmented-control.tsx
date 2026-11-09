"use client";

import type { ReactNode } from "react";
import { ToggleGroup } from "radix-ui";
import { cn } from "@/lib/cn";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

/**
 * Pick exactly one of a few options. Arrow keys move between them. Pressing
 * the selected one again does nothing, so a value is always chosen.
 */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onValueChange,
  className,
}: {
  /** Names the group for screen readers, for example "Theme". */
  label: string;
  options: readonly SegmentOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
}) {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      aria-label={label}
      onValueChange={(next) => {
        const match = options.find((option) => option.value === next);
        if (match) onValueChange(match.value);
      }}
      className={cn(
        "inline-flex rounded-control border border-control bg-bg-2 p-0.5",
        className,
      )}
    >
      {options.map((option) => (
        <ToggleGroup.Item
          key={option.value}
          value={option.value}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] px-3 text-secondary font-medium text-text-2 hover:text-text data-[state=on]:bg-card-elevated data-[state=on]:text-text data-[state=on]:[box-shadow:var(--edge-highlight)]"
        >
          {option.icon}
          {option.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
