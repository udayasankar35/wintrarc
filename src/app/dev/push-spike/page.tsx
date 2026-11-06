import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { PushSpike } from "./push-spike";

export const metadata = {
  title: "Push spike",
  robots: { index: false, follow: false },
};

async function SpikeGate() {
  // Read the flag per request so the page follows the deployment's env.
  await connection();
  if (process.env.ENABLE_PUSH_SPIKE !== "true") notFound();
  return (
    <PushSpike
      vapidPublicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""}
    />
  );
}

export default function PushSpikePage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <Suspense fallback={<p className="text-text-2">Loading…</p>}>
        <SpikeGate />
      </Suspense>
    </main>
  );
}
