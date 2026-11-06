/* WINTRARC service worker.
 *
 * Stage 0 scope: receive web push and open the right page on click.
 * Stage 1 adds offline caching. Plain JavaScript on purpose: it runs in a
 * worker scope and is served as-is from /sw.js.
 */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

/** Only same-origin paths are allowed as click targets. */
function safeTarget(value) {
  if (typeof value !== "string") return new URL("/", self.location.origin).href;
  try {
    const url = new URL(value, self.location.origin);
    if (url.origin === self.location.origin) return url.href;
  } catch {
    // fall through to the home page
  }
  return new URL("/", self.location.origin).href;
}

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }

  const title = typeof data.title === "string" ? data.title : "WINTRARC";
  const options = {
    body: typeof data.body === "string" ? data.body : "",
    tag: typeof data.tag === "string" ? data.tag : undefined,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: safeTarget(data.url) },
  };

  // Browsers require every push to show a notification (userVisibleOnly).
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = safeTarget(
    event.notification.data && event.notification.data.url,
  );

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of windows) {
        if (client.url === target && "focus" in client) return client.focus();
      }
      const first = windows[0];
      if (first && "navigate" in first) {
        await first.focus();
        return first.navigate(target);
      }
      return self.clients.openWindow(target);
    })(),
  );
});
