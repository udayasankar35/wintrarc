import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * A figure with a quiet label. The number is a ledger numeral: mono and
 * tabular, so a column of stats lines up.
 */
export function Stat({
  value,
  label,
  unit,
  size = "md",
  hint,
  className,
}: {
  value: ReactNode;
  label: string;
  /** For example "days" or "%". Smaller and quieter than the number. */
  unit?: string;
  size?: "md" | "lg";
  /** Context that makes the number readable, such as "of 30 planned". */
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-0.5", className)}>
      <p className="flex items-baseline gap-1.5">
        <span
          className={cn(
            "numeral font-semibold text-text",
            size === "lg" ? "text-display" : "text-title",
          )}
        >
          {value}
        </span>
        {unit ? <span className="text-body text-text-2">{unit}</span> : null}
      </p>
      <p className="text-secondary text-text-2">{label}</p>
      {hint ? <p className="text-meta text-text-2">{hint}</p> : null}
    </div>
  );
}
