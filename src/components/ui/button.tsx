import type { ComponentProps } from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";

/*
 * One gold per screen region: only the primary variant uses it. Hover changes
 * colour instantly (colour is never animated); press feedback is a small
 * scale, which is a transform.
 */
export const buttonVariants = cva(
  [
    "inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-control font-medium",
    "transition-transform duration-(--dur-fast) ease-(--ease) active:scale-[0.98]",
    "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        primary: "bg-accent text-on-accent hover:bg-accent-2",
        secondary:
          "border border-border bg-card-elevated text-text hover:border-control",
        ghost: "text-text hover:bg-card-elevated",
        danger: "border border-error text-error hover:bg-error/10",
      },
      size: {
        sm: "min-h-9 px-3 text-secondary",
        md: "min-h-11 px-4 text-body",
        lg: "min-h-12 px-6 text-body",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

export interface ButtonProps
  extends ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  /** Render the child element (for example a link) with button styling. */
  asChild?: boolean;
  /** Shows a spinner and blocks repeat presses. Keep the label the same. */
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  type,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (asChild) {
    return (
      <Slot.Root className={classes} {...props}>
        {children}
      </Slot.Root>
    );
  }

  return (
    <button
      type={type ?? "button"}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <LoaderCircle aria-hidden className="size-4 animate-spin" />
      ) : null}
      {children}
    </button>
  );
}
