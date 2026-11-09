"use client";

import { useSyncExternalStore } from "react";
import { detectIOS } from "@/lib/push/state";
import {
  getInstallKind,
  type InstallEnvironment,
  type InstallKind,
} from "./install";

/*
 * Chrome and Edge fire `beforeinstallprompt` once, and only a page that is
 * still listening can use it. This module listens from the moment it loads,
 * keeps the event, and lets a button trigger it later.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installedThisSession = false;
const listeners = new Set<() => void>();

function emit() {
  snapshot = computeKind();
  for (const listener of listeners) listener();
}

function isStandalone(): boolean {
  try {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    );
  } catch {
    return false;
  }
}

function readEnvironment(): InstallEnvironment {
  return {
    isStandalone: installedThisSession || isStandalone(),
    hasPrompt: deferredPrompt !== null,
    isIOS: detectIOS(
      navigator.userAgent,
      navigator.platform,
      navigator.maxTouchPoints,
    ),
    serviceWorkerSupported: "serviceWorker" in navigator,
  };
}

function computeKind(): InstallKind {
  return getInstallKind(readEnvironment());
}

let snapshot: InstallKind | null = null;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    installedThisSession = true;
    emit();
  });
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  let query: MediaQueryList | null = null;
  try {
    query = window.matchMedia("(display-mode: standalone)");
    query.addEventListener("change", emit);
  } catch {
    query = null;
  }
  return () => {
    listeners.delete(onChange);
    query?.removeEventListener("change", emit);
  };
}

function getSnapshot(): InstallKind {
  snapshot ??= computeKind();
  return snapshot;
}

/** What the install UI should show on this device right now. */
export function useInstallKind(): InstallKind {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => "browser_menu" satisfies InstallKind,
  );
}

/**
 * Shows the browser's install prompt. It can only be used once per page load,
 * so the saved prompt is cleared whatever the person answers.
 */
export async function promptInstall(): Promise<
  "accepted" | "dismissed" | "unavailable"
> {
  const prompt = deferredPrompt;
  if (!prompt) return "unavailable";
  deferredPrompt = null;
  emit();
  await prompt.prompt();
  const { outcome } = await prompt.userChoice;
  return outcome;
}
