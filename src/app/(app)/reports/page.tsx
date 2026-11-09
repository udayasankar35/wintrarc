import type { Metadata } from "next";
import { SectionPage } from "@/components/shell/section-page";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  return (
    <SectionPage
      navId="reports"
      emptyTitle="No reports yet"
      emptyDescription="Export your progress as PDF, CSV or Excel once there is something to export."
    />
  );
}
