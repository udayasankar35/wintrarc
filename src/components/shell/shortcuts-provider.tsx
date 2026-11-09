"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { NAV_ITEMS } from "@/lib/navigation";
import {
  OPEN_PALETTE_ID,
  SHORTCUTS,
  SHOW_SHORTCUTS_ID,
  navIdFor,
} from "@/lib/shortcuts/definitions";
import { createShortcutMatcher } from "@/lib/shortcuts/matcher";
import { usePlatform } from "@/lib/shortcuts/use-platform";
import { CommandPalette } from "./command-palette";
import { ShortcutHelp } from "./shortcut-help";

interface ShortcutUi {
  openPalette: () => void;
  openHelp: () => void;
}

const ShortcutUiContext = createContext<ShortcutUi | null>(null);

/** Lets any button open the palette or the shortcut list. */
export function useShortcutUi(): ShortcutUi {
  const value = useContext(ShortcutUiContext);
  if (!value) throw new Error("useShortcutUi needs <ShortcutsProvider>.");
  return value;
}

/** Listens for shortcuts on the whole window and owns the palette and help dialogs. */
export function ShortcutsProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const platform = usePlatform();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [matcher] = useState(() => createShortcutMatcher(SHORTCUTS));

  // These two dialogs open from a key press or a button without a Radix
  // trigger, so remember where focus was and put it back when they close.
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const rememberFocus = useCallback(() => {
    const active = document.activeElement;
    if (!(active instanceof HTMLElement) || active === document.body) return;
    // Switching from one dialog to the other keeps the original spot.
    if (active.closest('[role="dialog"]')) return;
    returnFocusRef.current = active;
  }, []);
  const restoreFocus = useCallback((event: Event) => {
    event.preventDefault();
    returnFocusRef.current?.focus({ preventScroll: true });
    returnFocusRef.current = null;
  }, []);

  const openPalette = useCallback(() => {
    rememberFocus();
    setHelpOpen(false);
    setPaletteOpen(true);
  }, [rememberFocus]);
  const openHelp = useCallback(() => {
    rememberFocus();
    setPaletteOpen(false);
    setHelpOpen(true);
  }, [rememberFocus]);

  const goTo = useCallback(
    (href: string) => {
      // Moving to another page: Next.js places focus there, so do not pull it back.
      returnFocusRef.current = null;
      setPaletteOpen(false);
      setHelpOpen(false);
      router.push(href);
    },
    [router],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const element = event.target instanceof HTMLElement ? event.target : null;
      const match = matcher.handle(
        {
          key: event.key,
          metaKey: event.metaKey,
          ctrlKey: event.ctrlKey,
          altKey: event.altKey,
          shiftKey: event.shiftKey,
          target: element
            ? {
                tagName: element.tagName,
                isContentEditable: element.isContentEditable,
                role: element.getAttribute("role"),
              }
            : null,
        },
        platform,
      );
      if (!match) return;
      event.preventDefault();

      if (match.id === OPEN_PALETTE_ID) {
        rememberFocus();
        setPaletteOpen((open) => !open);
        setHelpOpen(false);
      } else if (match.id === SHOW_SHORTCUTS_ID) {
        openHelp();
      } else {
        const navId = navIdFor(match.id);
        const item = NAV_ITEMS.find((candidate) => candidate.id === navId);
        if (item) goTo(item.href);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [matcher, platform, goTo, openHelp, rememberFocus]);

  const value = useMemo(
    () => ({ openPalette, openHelp }),
    [openPalette, openHelp],
  );

  return (
    <ShortcutUiContext.Provider value={value}>
      {children}
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onNavigate={goTo}
        onCloseAutoFocus={restoreFocus}
      />
      <ShortcutHelp
        open={helpOpen}
        onOpenChange={setHelpOpen}
        onCloseAutoFocus={restoreFocus}
      />
    </ShortcutUiContext.Provider>
  );
}
