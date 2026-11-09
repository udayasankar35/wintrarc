import type { Metadata } from "next";
import { ArcRing } from "@/components/arc-ring/arc-ring";
import { RetryButton } from "./retry-button";

export const metadata: Metadata = {
  title: "Offline",
  robots: { index: false },
};

/**
 * Shown by the service worker when a page is requested with no connection.
 * It is stored on the device at install time, so it never needs the network.
 */
export default function OfflinePage() {
  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto grid min-h-dvh max-w-md place-items-center px-6 py-12 outline-none"
    >
      <div className="grid justify-items-center gap-6 text-center">
        <ArcRing decorative totalDays={30} size={96} />
        <div className="grid gap-2">
          <h1 className="text-title font-semibold">You are offline</h1>
          <p className="text-body text-text-2">
            Wintrarc cannot reach the network right now. Check your connection,
            then try again.
          </p>
        </div>
        <RetryButton />
      </div>
    </main>
  );
}
