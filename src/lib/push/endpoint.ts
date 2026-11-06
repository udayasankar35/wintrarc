/**
 * Hosts of the real browser push services. A server that sends to any URL a
 * client supplies can be abused as an HTTP relay, so subscriptions are only
 * accepted when their endpoint belongs to one of these services.
 *
 * - fcm.googleapis.com: Chrome, Edge and other Chromium browsers, Android
 * - push.services.mozilla.com: Firefox (updates.push.services.mozilla.com)
 * - notify.windows.com: Windows Notification Service
 * - push.apple.com: Safari and installed iOS web apps (web.push.apple.com)
 */
const ALLOWED_HOSTS = [
  "fcm.googleapis.com",
  "push.services.mozilla.com",
  "notify.windows.com",
  "push.apple.com",
] as const;

export function isAllowedPushEndpoint(endpoint: string): boolean {
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    return false;
  }

  if (url.protocol !== "https:") return false;
  if (url.username !== "" || url.password !== "") return false;
  if (url.port !== "" && url.port !== "443") return false;

  const host = url.hostname.toLowerCase();
  return ALLOWED_HOSTS.some(
    (allowed) => host === allowed || host.endsWith(`.${allowed}`),
  );
}
