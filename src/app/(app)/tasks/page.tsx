import type { Metadata } from "next";
import { SectionPage } from "@/components/shell/section-page";

export const metadata: Metadata = { title: "Tasks" };

export default function TasksPage() {
  return (
    <SectionPage
      navId="tasks"
      emptyTitle="No tasks yet"
      emptyDescription="Tasks are one-off things to finish. They list here by due date, so what is next is always at the top."
    />
  );
}
