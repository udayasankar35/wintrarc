"use client";

import { useId, type ComponentProps } from "react";
import { Switch as SwitchPrimitive } from "radix-ui";
import { cn } from "@/lib/cn";

export interface SwitchProps extends Omit<
  ComponentProps<typeof SwitchPrimitive.Root>,
  "children"
> {
  label: string;
  description?: string;
}

/** An on/off setting that applies immediately. Use a checkbox when a form needs a Save step. */
export function Switch({
  label,
  description,
  id,
  className,
  ...props
}: SwitchProps) {
  const generated = useId();
  const switchId = id ?? generated;
  const descriptionId = `${switchId}-description`;

  return (
    <div
      className={cn(
        "flex min-h-11 items-center justify-between gap-4",
        className,
      )}
    >
      <div className="grid">
        <label
          htmlFor={switchId}
          className="cursor-pointer text-body text-text"
        >
          {label}
        </label>
        {description ? (
          <p id={descriptionId} className="text-secondary text-text-2">
            {description}
          </p>
        ) : null}
      </div>
      <SwitchPrimitive.Root
        id={switchId}
        aria-describedby={description ? descriptionId : undefined}
        className="relative h-7 w-12 shrink-0 rounded-full border border-control bg-bg data-[state=checked]:border-text data-[state=checked]:bg-text disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
      >
        <SwitchPrimitive.Thumb className="block size-5 translate-x-1 rounded-full bg-control transition-transform duration-(--dur-fast) ease-(--ease) data-[state=checked]:translate-x-[22px] data-[state=checked]:bg-bg" />
      </SwitchPrimitive.Root>
    </div>
  );
}
