"use client";

import { useId } from "react";
import { Select as SelectPrimitive } from "radix-ui";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { fieldControlClasses } from "./text-field";

export interface SelectOption {
  /** Must not be an empty string. */
  value: string;
  label: string;
}

export interface SelectFieldProps {
  label: string;
  options: readonly SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
}

/** A labelled select. The list opens in a portal and works with arrow keys and typing. */
export function SelectField({
  label,
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Choose one",
  hint,
  disabled,
  className,
}: SelectFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;

  return (
    <div className={cn("grid gap-1.5", className)}>
      <label htmlFor={id} className="text-secondary font-medium text-text">
        {label}
      </label>
      <SelectPrimitive.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectPrimitive.Trigger
          id={id}
          aria-describedby={hint ? hintId : undefined}
          className={cn(
            fieldControlClasses,
            "inline-flex items-center justify-between gap-2 text-left data-[placeholder]:text-text-2",
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDown aria-hidden className="size-4 text-text-2" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={6}
            collisionPadding={8}
            className="z-[55] max-h-[min(320px,var(--radix-select-content-available-height))] w-(--radix-select-trigger-width) overflow-hidden rounded-card border border-border bg-card-elevated shadow-soft data-[state=closed]:animate-pop-out data-[state=open]:animate-pop-in"
          >
            <SelectPrimitive.Viewport className="p-1">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  className="relative flex min-h-11 cursor-default select-none items-center rounded-control py-2 pr-9 pl-3 text-body text-text outline-none data-[highlighted]:bg-bg-2 data-[state=checked]:font-medium"
                >
                  <SelectPrimitive.ItemText>
                    {option.label}
                  </SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator className="absolute right-3">
                    <Check aria-hidden className="size-4" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {hint ? (
        <p id={hintId} className="text-meta text-text-2">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
