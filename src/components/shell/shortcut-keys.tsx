"use client";

import { Kbd } from "@/components/ui/kbd";

/** A chord shows its keys together. A sequence shows the first key, "then", and the second. */
export function ShortcutKeys({ keys }: { keys: readonly string[] }) {
  const isChord = keys[0] === "Mod";
  if (isChord || keys.length === 1) return <Kbd keys={keys} />;
  return (
    <span className="inline-flex items-center gap-1.5">
      <Kbd keys={[keys[0] ?? ""]} />
      <span className="text-meta text-text-2">then</span>
      <Kbd keys={keys.slice(1)} />
    </span>
  );
}
