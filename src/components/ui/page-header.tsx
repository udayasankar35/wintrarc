import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** The title block at the top of every page: one h1, one calm sentence, optional actions. */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "mb-8 flex flex-wrap items-start justify-between gap-4",
        className,
      )}
    >
      <div className="grid max-w-[60ch] gap-2">
        <h1 className="text-title font-semibold">{title}</h1>
        {description ? (
          <p className="text-body text-text-2">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
