import webpush from "web-push";

export type PushSubscriptionData = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export type VapidConfig = {
  publicKey: string;
  privateKey: string;
  /** A mailto: or https: contact URL, required by the push services. */
  subject: string;
};

export type PushPayload = {
  title: string;
  body: string;
  /** Same-origin path opened when the notification is clicked. */
  url: string;
  tag?: string;
};

export type PushSender = (
  subscription: PushSubscriptionData,
  payload: PushPayload,
  vapid: VapidConfig,
) => Promise<{ statusCode: number }>;

/** Sends one message through the browser's push service using web-push. */
export const webPushSender: PushSender = async (
  subscription,
  payload,
  vapid,
) => {
  const result = await webpush.sendNotification(
    subscription,
    JSON.stringify(payload),
    {
      vapidDetails: {
        subject: vapid.subject,
        publicKey: vapid.publicKey,
        privateKey: vapid.privateKey,
      },
      TTL: 60,
      timeout: 10_000,
      urgency: "normal",
    },
  );
  return { statusCode: result.statusCode };
};

export type PushFailure = {
  /**
   * expired: the subscription is gone (HTTP 404 or 410) and must be deleted.
   * rejected: the push service refused the request (other 4xx).
   * failed: a network error, timeout or server error; safe to retry later.
   */
  kind: "expired" | "rejected" | "failed";
  statusCode?: number;
};

export function classifyPushError(error: unknown): PushFailure {
  const statusCode =
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
      ? error.statusCode
      : undefined;

  if (statusCode === 404 || statusCode === 410) {
    return { kind: "expired", statusCode };
  }
  if (statusCode !== undefined && statusCode >= 400 && statusCode < 500) {
    return { kind: "rejected", statusCode };
  }
  return statusCode === undefined
    ? { kind: "failed" }
    : { kind: "failed", statusCode };
}
