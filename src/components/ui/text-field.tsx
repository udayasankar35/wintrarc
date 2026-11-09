"use client";

import { useId, type ComponentProps } from "react";
import { cn } from "@/lib/cn";

export interface TextFieldProps extends Omit<ComponentProps<"input">, "size"> {
  /** Always visible. A placeholder is only ever a format hint. */
  label: string;
  /** Help that stays visible, such as the expected format. */
  hint?: string;
  /** Says what went wrong and how to fix it. Replaces the hint while set. */
  error?: string;
}

export const fieldControlClasses =
  "min-h-11 w-full rounded-control border border-control bg-bg px-3 text-body text-text placeholder:text-text-2 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-error";

/** A labelled text input. The label, hint and error are wired to the input for screen readers. */
export function TextField({
  label,
  hint,
  error,
  id,
  className,
  required,
  ...props
}: TextFieldProps) {
  const generated = useId();
  const inputId = id ?? generated;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className={cn("grid gap-1.5", className)}>
      <label htmlFor={inputId} className="text-secondary font-medium text-text">
        {label}
        {required ? <span className="sr-only"> (required)</span> : null}
      </label>
      <input
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={fieldControlClasses}
        {...props}
      />
      <p
        id={error ? errorId : hintId}
        aria-live="polite"
        className={cn(
          "min-h-[1.05rem] text-meta",
          error ? "text-error" : "text-text-2",
          !error && !hint && "sr-only",
        )}
      >
        {error ?? hint}
      </p>
    </div>
  );
}
