import type { ReactNode } from "react";
import { ArcRing } from "@/components/arc-ring/arc-ring";
import { cn } from "@/lib/cn";

/**
 * An empty list is an invitation, not an apology. It says what belongs here
 * and, when there is something to do about it, offers that action.
 * The faint empty ring is the same one used for arcs, so emptiness belongs to
 * the product rather than to a stock illustration.
 */
export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex flex-col items-center gap-5 rounded-card border border-border bg-card px-6 py-12 text-center [box-shadow:var(--edge-highlight)]",
        className,
      )}
    >
      <ArcRing decorative totalDays={30} size={72} />
      <div className="grid gap-1.5">
        <h2 className="text-subhead font-semibold">{title}</h2>
        <p className="max-w-[48ch] text-body text-text-2">{description}</p>
      </div>
      {action ? (
        <div className="flex flex-wrap justify-center gap-2">{action}</div>
      ) : null}
    </section>
  );
}
