"use client";

import { useSyncExternalStore } from "react";
import { detectPlatform, type Platform } from "./format";

const subscribe = () => () => {};

/**
 * "apple" or "other". The server and the first client render both say
 * "other", so hydration always matches; Apple devices switch right after.
 */
export function usePlatform(): Platform {
  return useSyncExternalStore(
    subscribe,
    () => detectPlatform(navigator),
    () => "other",
  );
}
