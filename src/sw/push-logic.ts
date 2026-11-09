/*
 * Pure helpers for the service worker's push handling. They live apart from
 * sw.ts so unit tests can run them without a worker scope.
 */

export const DEFAULT_PUSH_TITLE = "Wintrarc";
export const NOTIFICATION_ICON = "/icon-192.png";

/** Only same-origin addresses are allowed as click targets. */
export function safeTarget(value: unknown, origin: string): string {
  const home = new URL("/", origin).href;
  if (typeof value !== "string" || value.length === 0) return home;
  try {
    const url = new URL(value, origin);
    if (url.origin === new URL(origin).origin) return url.href;
  } catch {
    // fall through to the home page
  }
  return home;
}

export type PushPayloadSource = {
  json(): unknown;
  text(): string;
};

export type NotificationPlan = {
  title: string;
  options: {
    body: string;
    tag: string | undefined;
    icon: string;
    badge: string;
    data: { url: string };
  };
};

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

/**
 * Turns whatever the push service delivered into a notification. Browsers
 * require every push to show something, so a malformed or empty payload
 * still produces a plain notification instead of throwing.
 */
export function planNotification(
  source: PushPayloadSource | null,
  origin: string,
): NotificationPlan {
  let data: Record<string, unknown> = {};
  if (source) {
    try {
      data = asRecord(source.json());
    } catch {
      try {
        data = { body: source.text() };
      } catch {
        data = {};
      }
    }
  }

  return {
    title:
      typeof data.title === "string" && data.title.length > 0
        ? data.title
        : DEFAULT_PUSH_TITLE,
    options: {
      body: typeof data.body === "string" ? data.body : "",
      tag: typeof data.tag === "string" ? data.tag : undefined,
      icon: NOTIFICATION_ICON,
      badge: NOTIFICATION_ICON,
      data: { url: safeTarget(data.url, origin) },
    },
  };
}
