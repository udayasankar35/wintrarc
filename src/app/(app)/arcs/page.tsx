import type { Metadata } from "next";
import { SectionPage } from "@/components/shell/section-page";

export const metadata: Metadata = { title: "Arcs" };

export default function ArcsPage() {
  return (
    <SectionPage
      navId="arcs"
      emptyTitle="No arc yet"
      emptyDescription="An arc is a season of 30, 60 or 90 days with a theme, linked goals and a look back at the end."
    />
  );
}
