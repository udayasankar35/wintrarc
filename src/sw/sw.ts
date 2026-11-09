/// <reference lib="webworker" />
import {
  CacheFirst,
  ExpirationPlugin,
  NetworkOnly,
  Serwist,
  type PrecacheEntry,
  type RuntimeCaching,
  type SerwistGlobalConfig,
} from "serwist";
import { planNotification, safeTarget } from "./push-logic";

/*
 * Wintrarc service worker. It does three jobs and nothing else:
 *
 * 1. Precaches the app's static files (scripts, styles, fonts, icons) and the
 *    /offline page, so the installed app opens even with no connection.
 * 2. Shows /offline when a page cannot be fetched.
 * 3. Receives web push and opens the right page when a notification is tapped.
 *
 * It never caches pages, API responses or anything personal. Page HTML and
 * data will hold a person's habits and tasks, so they always come from the
 * network and the server's own access rules.
 */

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const runtimeCaching: RuntimeCaching[] = [
  {
    // Hashed build files never change under the same name, so a stored copy
    // is always correct. This covers lazily loaded chunks the precache list
    // did not name.
    matcher: ({ sameOrigin, url }) =>
      sameOrigin && url.pathname.startsWith("/_next/static/"),
    handler: new CacheFirst({
      cacheName: "next-static",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 96,
          maxAgeSeconds: 30 * 24 * 60 * 60,
          maxAgeFrom: "last-used",
        }),
      ],
    }),
  },
  {
    // Pages go to the network every time. The route exists so a failed page
    // load reaches the offline fallback below.
    matcher: ({ request }) => request.mode === "navigate",
    handler: new NetworkOnly(),
  },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  precacheOptions: { cleanupOutdatedCaches: true },
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching,
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
});

serwist.addEventListeners();

self.addEventListener("push", (event) => {
  const plan = planNotification(event.data ?? null, self.location.origin);
  // Browsers require every push to show a notification.
  event.waitUntil(self.registration.showNotification(plan.title, plan.options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data as { url?: unknown } | null;
  const target = safeTarget(data?.url, self.location.origin);

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of windows) {
        if (client.url === target && "focus" in client) {
          await client.focus();
          return;
        }
      }
      const first = windows[0];
      if (first && "navigate" in first) {
        await first.focus();
        await first.navigate(target);
        return;
      }
      await self.clients.openWindow(target);
    })(),
  );
});
