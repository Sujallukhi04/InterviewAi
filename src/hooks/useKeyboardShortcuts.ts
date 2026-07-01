import { useEffect, useRef } from "react";

type ShortcutMap = {
  [key: string]: (e: KeyboardEvent) => void;
};

export function useKeyboardShortcuts(
  shortcuts: ShortcutMap,
  enabled: boolean = true
) {
  const shortcutsRef = useRef(shortcuts);

  // Keep shortcutsRef updated with the latest callbacks
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent) => {
      // Don't fire if user is typing in an input or navigating a button
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLButtonElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }
      const shortcut = shortcutsRef.current[e.key];
      if (shortcut) {
        e.preventDefault();
        shortcut(e);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled]);
}
