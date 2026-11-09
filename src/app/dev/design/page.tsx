import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Gallery } from "./gallery";

export const metadata = {
  title: "Design gallery",
  robots: { index: false, follow: false },
};

async function GalleryGate() {
  // Read the flag per request so the page follows the deployment's env.
  await connection();
  if (process.env.ENABLE_DESIGN_GALLERY !== "true") notFound();
  return <Gallery />;
}

export default function DesignGalleryPage() {
  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto w-full max-w-[1100px] px-4 py-10 outline-none md:px-8"
    >
      <Suspense
        fallback={
          <div
            role="status"
            aria-label="Loading gallery"
            className="grid gap-3"
          >
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-40 w-full" />
          </div>
        }
      >
        <GalleryGate />
      </Suspense>
    </main>
  );
}
