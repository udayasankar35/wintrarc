"use client";

import { SerwistProvider } from "@serwist/turbopack/react";
import type { ReactNode } from "react";
import { ShortcutsProvider } from "@/components/shell/shortcuts-provider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

/**
 * Everything the whole app shares: the service worker, tooltips, keyboard
 * shortcuts and toasts.
 *
 * The worker is off during `next dev` so a stale copy never hides a change.
 * Page caching and reload-on-reconnect are off on purpose: pages hold
 * personal data and always come from the network (see src/sw/sw.ts).
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <SerwistProvider
      swUrl="/serwist/sw.js"
      disable={process.env.NODE_ENV === "development"}
      cacheOnNavigation={false}
      reloadOnOnline={false}
      options={{ updateViaCache: "none" }}
    >
      <TooltipProvider>
        <ShortcutsProvider>{children}</ShortcutsProvider>
        <Toaster />
      </TooltipProvider>
    </SerwistProvider>
  );
}
