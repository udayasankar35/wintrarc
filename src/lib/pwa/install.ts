/*
 * Install guidance. Pure, so every device case can be tested.
 *
 * Chrome, Edge and Android browsers hand the page a prompt it can trigger
 * from a button. iPhone and iPad never do: the person must use Share, Add to
 * Home Screen. Other browsers have an install item in their own menu.
 */

export interface InstallEnvironment {
  /** Already running as an installed app (standalone display mode). */
  isStandalone: boolean;
  /** The browser gave us a prompt we can trigger. */
  hasPrompt: boolean;
  isIOS: boolean;
  serviceWorkerSupported: boolean;
}

export type InstallKind =
  "installed" | "can_prompt" | "ios_manual" | "browser_menu" | "unsupported";

export function getInstallKind(env: InstallEnvironment): InstallKind {
  if (env.isStandalone) return "installed";
  if (env.hasPrompt) return "can_prompt";
  if (env.isIOS) return "ios_manual";
  if (!env.serviceWorkerSupported) return "unsupported";
  return "browser_menu";
}

export interface InstallCopy {
  title: string;
  body: string;
  steps: readonly string[];
  /** Present only when a button can install right now. */
  actionLabel?: string;
}

export function describeInstall(kind: InstallKind): InstallCopy {
  switch (kind) {
    case "installed":
      return {
        title: "Installed on this device",
        body: "Wintrarc opens in its own window from your apps. Nothing more to do here.",
        steps: [],
      };
    case "can_prompt":
      return {
        title: "Install Wintrarc",
        body: "Add it to this device. It gets its own icon and opens in its own window, and reminders work the way they do in any app.",
        steps: [],
        actionLabel: "Install app",
      };
    case "ios_manual":
      return {
        title: "Install on your iPhone or iPad",
        body: "Apple only allows notifications from an installed app, so install first.",
        steps: [
          "Tap the Share button in the browser toolbar.",
          "Scroll down and choose Add to Home Screen.",
          "Open Wintrarc from your Home Screen.",
        ],
      };
    case "browser_menu":
      return {
        title: "Install from your browser menu",
        body: "This browser has its own install option.",
        steps: [
          "Open the browser menu.",
          "Choose Install app, Add to Home Screen or Add to Dock.",
          "Open Wintrarc from your apps.",
        ],
      };
    case "unsupported":
      return {
        title: "This browser can't install apps",
        body: "Use a recent version of Chrome, Edge, Safari or Firefox to install Wintrarc.",
        steps: [],
      };
  }
}
