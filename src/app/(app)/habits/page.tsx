import type { Metadata } from "next";
import { SectionPage } from "@/components/shell/section-page";

export const metadata: Metadata = { title: "Habits" };

export default function HabitsPage() {
  return (
    <SectionPage
      navId="habits"
      emptyTitle="No habits yet"
      emptyDescription="Habits are the small things you repeat. Once you add one, it appears here with its streak and how consistent you have been."
    />
  );
}
