import type { ReactNode } from "react";
import { NAV_ITEMS, type NavId } from "@/lib/navigation";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

/**
 * A section's page: its title and one-line purpose from the navigation list,
 * and an honest empty state. No sample data: a page shows what exists, and
 * nothing exists yet.
 */
export function SectionPage({
  navId,
  emptyTitle,
  emptyDescription,
  description,
  children,
}: {
  navId: NavId;
  emptyTitle: string;
  emptyDescription: string;
  /** Overrides the one-line purpose from the navigation list. */
  description?: ReactNode;
  children?: ReactNode;
}) {
  const item = NAV_ITEMS.find((candidate) => candidate.id === navId);
  if (!item) throw new Error(`Unknown section: ${navId}`);
  return (
    <>
      <PageHeader
        title={item.label}
        description={description ?? item.description}
      />
      {children}
      <EmptyState title={emptyTitle} description={emptyDescription} />
    </>
  );
}
