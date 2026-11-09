"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

function formatToday(): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

/**
 * Today's date in the device's own time zone. The server cannot know it, so
 * the server renders an empty line of the same height and the date fills in
 * on the device. This is the same local date that streaks will count by.
 */
export function LocalDate() {
  const text = useSyncExternalStore(subscribe, formatToday, () => "");
  return <span className="inline-block min-h-[1.55em]">{text}</span>;
}
