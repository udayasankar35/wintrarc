import type { Metadata } from "next";
import { SectionPage } from "@/components/shell/section-page";

export const metadata: Metadata = { title: "Insights" };

export default function InsightsPage() {
  return (
    <SectionPage
      navId="insights"
      emptyTitle="No insights yet"
      emptyDescription="Patterns worth a closer look show up here once there are a few weeks of data to read."
    />
  );
}
