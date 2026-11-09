import type { Platform } from "./format";

/*
 * Turns key presses into shortcut matches. Pure: no DOM, no timers of its own.
 *
 * Two kinds of shortcut:
 *  - a chord such as ["Mod", "k"], pressed together. Works everywhere,
 *    including inside text fields, because it needs a modifier key.
 *  - a sequence such as ["g", "t"], pressed one after the other within a
 *    second. Ignored while the person is typing, so letters stay letters.
 */

export interface ShortcutDef {
  id: string;
  keys: readonly string[];
}

export interface KeyInput {
  key: string;
  metaKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  /** Where the key was pressed. Used to detect typing. */
  target: {
    tagName?: string;
    isContentEditable?: boolean;
    role?: string | null;
  } | null;
}

const TYPING_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);
const TYPING_ROLES = new Set([
  "textbox",
  "combobox",
  "searchbox",
  "spinbutton",
]);

export function isTypingTarget(target: KeyInput["target"]): boolean {
  if (!target) return false;
  if (target.isContentEditable) return true;
  if (target.tagName && TYPING_TAGS.has(target.tagName.toUpperCase())) {
    return true;
  }
  return Boolean(target.role && TYPING_ROLES.has(target.role));
}

function isChord(keys: readonly string[]): boolean {
  return keys[0] === "Mod";
}

function chordMatches(
  def: ShortcutDef,
  input: KeyInput,
  platform: Platform,
): boolean {
  const last = def.keys[def.keys.length - 1];
  if (!last || input.key.toLowerCase() !== last.toLowerCase()) return false;
  const modPressed = platform === "apple" ? input.metaKey : input.ctrlKey;
  const otherMod = platform === "apple" ? input.ctrlKey : input.metaKey;
  if (!modPressed || otherMod || input.altKey) return false;
  return def.keys.includes("Shift") === input.shiftKey;
}

export interface ShortcutMatcher {
  /** Returns the shortcut this key completes, or null. */
  handle(input: KeyInput, platform: Platform): ShortcutDef | null;
  /** True while the first key of a sequence is waiting for its second. */
  isPending(): boolean;
  reset(): void;
}

export function createShortcutMatcher(
  defs: readonly ShortcutDef[],
  options: { now?: () => number; sequenceTimeoutMs?: number } = {},
): ShortcutMatcher {
  const now = options.now ?? Date.now;
  const timeout = options.sequenceTimeoutMs ?? 1000;

  const chords = defs.filter((def) => isChord(def.keys));
  const sequences = defs.filter((def) => !isChord(def.keys));

  let pendingKey: string | null = null;
  let pendingAt = 0;

  const reset = () => {
    pendingKey = null;
    pendingAt = 0;
  };

  return {
    reset,
    isPending: () => pendingKey !== null && now() - pendingAt <= timeout,
    handle(input, platform) {
      // Holding a modifier alone is not a key press we care about.
      if (["Meta", "Control", "Alt", "Shift"].includes(input.key)) return null;

      for (const def of chords) {
        if (chordMatches(def, input, platform)) {
          reset();
          return def;
        }
      }

      const hasModifier = input.metaKey || input.ctrlKey || input.altKey;
      if (hasModifier || isTypingTarget(input.target)) {
        reset();
        return null;
      }

      const key = input.key.length === 1 ? input.key.toLowerCase() : input.key;

      if (pendingKey !== null && now() - pendingAt <= timeout) {
        const first = pendingKey;
        reset();
        const completed = sequences.find(
          (def) =>
            def.keys.length === 2 &&
            def.keys[0] === first &&
            def.keys[1] === key,
        );
        if (completed) return completed;
        // Not a match: fall through so this key can start a new sequence or
        // trigger a single-key shortcut.
      } else {
        reset();
      }

      const single = sequences.find(
        (def) => def.keys.length === 1 && def.keys[0] === input.key,
      );
      if (single) return single;

      if (
        sequences.some((def) => def.keys.length === 2 && def.keys[0] === key)
      ) {
        pendingKey = key;
        pendingAt = now();
      }
      return null;
    },
  };
}
