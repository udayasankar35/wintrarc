import type { Metadata } from "next";
import { LocalDate } from "@/components/shell/local-date";
import { SectionPage } from "@/components/shell/section-page";

export const metadata: Metadata = { title: "Today" };

export default function TodayPage() {
  return (
    <SectionPage
      navId="today"
      description={<LocalDate />}
      emptyTitle="Nothing planned yet"
      emptyDescription="Your habits and tasks for the day will line up here, with the ring for your current arc at the top."
    />
  );
}
