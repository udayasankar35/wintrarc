"use client";

import { useId, type ComponentProps } from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/cn";

export interface CheckboxProps extends Omit<
  ComponentProps<typeof CheckboxPrimitive.Root>,
  "children"
> {
  label: string;
  description?: string;
}

/**
 * A checkbox on a row at least 44px tall, so the label is part of the tap
 * target. Checked is shown by an inverted fill and a tick, not by colour.
 */
export function Checkbox({
  label,
  description,
  id,
  className,
  ...props
}: CheckboxProps) {
  const generated = useId();
  const checkboxId = id ?? generated;
  const descriptionId = `${checkboxId}-description`;

  return (
    <div className={cn("flex min-h-11 items-center gap-3", className)}>
      <CheckboxPrimitive.Root
        id={checkboxId}
        aria-describedby={description ? descriptionId : undefined}
        className="grid size-6 shrink-0 place-items-center rounded-control border border-control bg-bg text-bg data-[state=checked]:border-text data-[state=checked]:bg-text data-[state=indeterminate]:border-text data-[state=indeterminate]:bg-text disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
      >
        <CheckboxPrimitive.Indicator className="animate-check-pop">
          {props.checked === "indeterminate" ? (
            <Minus aria-hidden className="size-4" strokeWidth={3} />
          ) : (
            <Check aria-hidden className="size-4" strokeWidth={3} />
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <div className="grid">
        <label
          htmlFor={checkboxId}
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
    </div>
  );
}
