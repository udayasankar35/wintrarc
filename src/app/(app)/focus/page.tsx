import type { Metadata } from "next";
import { SectionPage } from "@/components/shell/section-page";

export const metadata: Metadata = { title: "Focus" };

export default function FocusPage() {
  return (
    <SectionPage
      navId="focus"
      emptyTitle="No sessions yet"
      emptyDescription="Timed sessions for deep work are logged here, with how long you stayed with each one."
    />
  );
}
