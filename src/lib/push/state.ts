export type PushPermission = "default" | "granted" | "denied";

export type PushEnvironment = {
  hasServiceWorker: boolean;
  hasPushManager: boolean;
  hasNotification: boolean;
  isIOS: boolean;
  /** True when running as an installed app (Home Screen, desktop PWA). */
  isStandalone: boolean;
  permission: PushPermission;
  /** True only when the browser reports a registered push subscription. */
  hasSubscription: boolean;
};

export type PushState =
  | "unsupported"
  | "needs_install"
  | "permission_denied"
  | "ready_to_ask"
  | "granted_no_subscription"
  | "active";

/**
 * Decides what the app may honestly say about push on this device.
 * "active" requires a real subscription: permission alone is never enough.
 */
export function getPushState(env: PushEnvironment): PushState {
  // iOS exposes push only to installed apps, and Safari hides PushManager
  // otherwise, so check installation before checking support.
  if (env.isIOS && !env.isStandalone) return "needs_install";
  if (!env.hasServiceWorker || !env.hasPushManager || !env.hasNotification) {
    return "unsupported";
  }
  if (env.permission === "denied") return "permission_denied";
  if (env.permission === "default") return "ready_to_ask";
  return env.hasSubscription ? "active" : "granted_no_subscription";
}

export type PushStateCopy = {
  title: string;
  detail: string;
  /** Whether the "Enable notifications" action should be offered. */
  canEnable: boolean;
};

const COPY: Record<PushState, PushStateCopy> = {
  unsupported: {
    title: "Push is not supported here",
    detail:
      "This browser cannot receive web push. Reminders will appear in the in-app notification centre instead.",
    canEnable: false,
  },
  needs_install: {
    title: "Install to the Home Screen first",
    detail:
      "On iPhone and iPad, notifications work only in the installed app. Tap Share, choose Add to Home Screen, then open WINTRARC from your Home Screen.",
    canEnable: false,
  },
  permission_denied: {
    title: "Notifications are blocked",
    detail:
      "Notifications are blocked for this site. WINTRARC will not ask again. You can allow them in your browser or system settings.",
    canEnable: false,
  },
  ready_to_ask: {
    title: "Notifications are off",
    detail:
      "Turn them on to receive reminders. Your browser will ask for permission.",
    canEnable: true,
  },
  granted_no_subscription: {
    title: "Allowed, but this device is not subscribed",
    detail:
      "Permission is granted. Subscribe this device to start receiving notifications.",
    canEnable: true,
  },
  active: {
    title: "This device is subscribed",
    detail:
      "The browser holds a push subscription for this device. Send a test to confirm that delivery works.",
    canEnable: false,
  },
};

export function describePushState(state: PushState): PushStateCopy {
  return COPY[state];
}

/**
 * iPadOS 13 and later report a desktop Safari user agent, so touch support on
 * a "MacIntel" platform is the reliable signal for an iPad.
 */
export function detectIOS(
  userAgent: string,
  platform: string,
  maxTouchPoints: number,
): boolean {
  if (/iPhone|iPad|iPod/.test(userAgent)) return true;
  return platform === "MacIntel" && maxTouchPoints > 1;
}
