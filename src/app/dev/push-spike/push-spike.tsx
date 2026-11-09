"use client";

import { useCallback, useEffect, useState } from "react";
import {
  describePushState,
  detectIOS,
  getPushState,
  type PushEnvironment,
  type PushState,
} from "@/lib/push/state";
import { urlBase64ToUint8Array } from "@/lib/push/vapid-client";

type Subscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

type Snapshot = { state: PushState; subscription: Subscription | null };

type TestResponse = {
  ok?: boolean;
  statusCode?: number;
  kind?: string;
  error?: string;
};

function toSubscription(sub: PushSubscription): Subscription | null {
  const json = sub.toJSON();
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;
  if (!json.endpoint || !p256dh || !auth) return null;
  return { endpoint: json.endpoint, keys: { p256dh, auth } };
}

function readEnvironment(): Omit<PushEnvironment, "hasSubscription"> {
  const hasNotification = "Notification" in window;
  const iosStandalone =
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return {
    hasServiceWorker: "serviceWorker" in navigator,
    hasPushManager: "PushManager" in window,
    hasNotification,
    isIOS: detectIOS(
      navigator.userAgent,
      navigator.platform,
      navigator.maxTouchPoints,
    ),
    isStandalone:
      window.matchMedia("(display-mode: standalone)").matches || iosStandalone,
    permission: hasNotification ? Notification.permission : "default",
  };
}

/**
 * The app registers its own worker on every page. If this tool is opened where
 * that has not happened yet (such as during `next dev`, which leaves the
 * worker off), register it here so push can still be tested.
 */
async function getRegistration(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration("/");
  if (existing) return existing;
  return navigator.serviceWorker.register("/serwist/sw.js", {
    scope: "/",
    type: "module",
    updateViaCache: "none",
  });
}

async function takeSnapshot(): Promise<Snapshot> {
  const env = readEnvironment();
  const canInspect =
    env.hasServiceWorker &&
    env.hasPushManager &&
    (!env.isIOS || env.isStandalone);

  let subscription: Subscription | null = null;
  if (canInspect) {
    const registration = await getRegistration();
    const existing = await registration.pushManager.getSubscription();
    subscription = existing ? toSubscription(existing) : null;
  }

  return {
    state: getPushState({ ...env, hasSubscription: subscription !== null }),
    subscription,
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "unknown error";
}

function describeTestResult(status: number, body: TestResponse | null): string {
  if (status === 200) {
    return `The push service accepted the message (HTTP ${body?.statusCode ?? "2xx"}). Now check whether a notification actually appeared on this device.`;
  }
  if (status === 410) {
    return "The subscription has expired. Unsubscribe, then enable notifications again.";
  }
  if (status === 401) return "The token is wrong.";
  if (status === 429) return "Too many tests. Wait a minute and try again.";
  if (status === 404) {
    return "The test route is switched off. Set ENABLE_PUSH_SPIKE=true and redeploy.";
  }
  return `The test failed (${body?.error ?? body?.kind ?? `HTTP ${status}`}).`;
}

export function PushSpike({ vapidPublicKey }: { vapidPublicKey: string }) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const addLog = useCallback((line: string) => {
    const stamp = new Date().toLocaleTimeString();
    setLog((previous) => [`${stamp}  ${line}`, ...previous].slice(0, 12));
  }, []);

  // Used after the user acts (subscribe, unsubscribe). Event handlers may set
  // state freely, unlike effect bodies.
  const refresh = useCallback(async () => {
    try {
      setSnapshot(await takeSnapshot());
    } catch (error) {
      addLog(`Could not inspect this device: ${errorMessage(error)}`);
    }
  }, [addLog]);

  // Initial inspection: state is set from the promise callbacks, and the
  // cleanup stops a late result from updating an unmounted component.
  useEffect(() => {
    let cancelled = false;
    takeSnapshot()
      .then((result) => {
        if (!cancelled) setSnapshot(result);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          addLog(`Could not inspect this device: ${errorMessage(error)}`);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [addLog]);

  async function enable() {
    if (!vapidPublicKey) {
      addLog(
        "NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set, so subscribing is impossible.",
      );
      return;
    }
    setBusy(true);
    try {
      // Only ever ask while permission is still undecided.
      if (Notification.permission === "default") {
        const result = await Notification.requestPermission();
        addLog(`Permission: ${result}`);
        if (result !== "granted") return;
      }
      const registration = await navigator.serviceWorker.ready;
      await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      addLog("Subscribed this device.");
    } catch (error) {
      addLog(`Could not subscribe: ${errorMessage(error)}`);
    } finally {
      setBusy(false);
      await refresh();
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      await existing?.unsubscribe();
      addLog("Unsubscribed this device.");
    } catch (error) {
      addLog(`Could not unsubscribe: ${errorMessage(error)}`);
    } finally {
      setBusy(false);
      await refresh();
    }
  }

  async function sendTest() {
    if (!snapshot?.subscription) return;
    setBusy(true);
    try {
      const response = await fetch("/api/dev/push-test", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-spike-token": token },
        body: JSON.stringify({ subscription: snapshot.subscription }),
      });
      const body = (await response
        .json()
        .catch(() => null)) as TestResponse | null;
      addLog(describeTestResult(response.status, body));
    } catch (error) {
      addLog(`The request failed: ${errorMessage(error)}`);
    } finally {
      setBusy(false);
    }
  }

  const copy = snapshot ? describePushState(snapshot.state) : null;
  const endpointHost = snapshot?.subscription
    ? new URL(snapshot.subscription.endpoint).hostname
    : null;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="font-mono text-meta uppercase tracking-widest text-text-2">
          Developer tool · Stage 0
        </p>
        <h1 className="text-title font-semibold tracking-tight">Push spike</h1>
        <p className="text-secondary text-text-2">
          Proves that this device can subscribe and receive a real push. Turn
          this page off by removing ENABLE_PUSH_SPIKE after testing.
        </p>
      </header>

      <section
        aria-labelledby="status-heading"
        className="rounded-card border border-border bg-card p-5"
      >
        <h2
          id="status-heading"
          className="text-secondary font-medium text-text-2"
        >
          This device
        </h2>
        {copy ? (
          <div className="mt-2 flex flex-col gap-1">
            <p className="text-subhead font-medium">{copy.title}</p>
            <p className="text-secondary text-text-2">{copy.detail}</p>
            {endpointHost ? (
              <p className="mt-2 font-mono text-meta text-text-2">
                Push service: {endpointHost}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-2 text-secondary text-text-2">
            Checking this device…
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          {copy?.canEnable ? (
            <button
              type="button"
              onClick={() => void enable()}
              disabled={busy}
              className="min-h-11 rounded-control bg-accent px-4 text-secondary font-medium text-bg disabled:opacity-50"
            >
              Enable notifications
            </button>
          ) : null}
          {snapshot?.subscription ? (
            <button
              type="button"
              onClick={() => void disable()}
              disabled={busy}
              className="min-h-11 rounded-control border border-border px-4 text-secondary disabled:opacity-50"
            >
              Unsubscribe this device
            </button>
          ) : null}
        </div>
      </section>

      {snapshot?.subscription ? (
        <section
          aria-labelledby="test-heading"
          className="rounded-card border border-border bg-card p-5"
        >
          <h2
            id="test-heading"
            className="text-secondary font-medium text-text-2"
          >
            Send a test
          </h2>
          <div className="mt-3 flex flex-col gap-2">
            <label htmlFor="spike-token" className="text-secondary">
              Spike token
            </label>
            <input
              id="spike-token"
              type="password"
              autoComplete="off"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              className="min-h-11 rounded-control border border-border bg-bg px-3 text-secondary"
            />
            <p className="text-meta text-text-2">
              The value of PUSH_SPIKE_TOKEN from your environment.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void sendTest()}
            disabled={busy || token.length === 0}
            className="mt-4 min-h-11 rounded-control bg-accent px-4 text-secondary font-medium text-bg disabled:opacity-50"
          >
            Send test push
          </button>
        </section>
      ) : null}

      <section aria-labelledby="log-heading">
        <h2 id="log-heading" className="text-secondary font-medium text-text-2">
          Log
        </h2>
        <ul
          role="log"
          aria-live="polite"
          className="mt-2 flex flex-col gap-1 font-mono text-meta text-text-2"
        >
          {log.length === 0 ? <li>Nothing yet.</li> : null}
          {log.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
