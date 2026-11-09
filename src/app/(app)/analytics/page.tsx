import type { Metadata } from "next";
import { SectionPage } from "@/components/shell/section-page";

export const metadata: Metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <SectionPage
      navId="analytics"
      emptyTitle="Nothing to chart yet"
      emptyDescription="After a few days of activity, trends and heatmaps appear here. Every chart comes with a table version."
    />
  );
}
