import type { Metadata } from "next";
import { SectionPage } from "@/components/shell/section-page";

export const metadata: Metadata = { title: "Goals" };

export default function GoalsPage() {
  return (
    <SectionPage
      navId="goals"
      emptyTitle="No goals yet"
      emptyDescription="A goal gathers the habits and tasks that move it forward and shows how far along you are."
    />
  );
}
