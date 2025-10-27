import { create } from "zustand";

/**
 * UI Chrome Store - Centralized control for navbar visibility
 *
 * This store manages navbar visibility based on multiple reasons (keyboard, drawers, modals, etc.).
 * Any component can "acquire" a hide lock with a specific reason and "release" it when done.
 * The navbar will be hidden if ANY reason is active.
 *
 * Usage examples:
 * - Keyboard detection: automatically managed by useKeyboardChrome hook
 * - Drawer/Modal: hide("drawer") on open, show("drawer") on close
 * - Custom UI: hide("custom-reason") when needed, show("custom-reason") when done
 *
 * Built-in reasons: "keyboard", "picker", "modal", "drawer", "custom"
 * You can also use custom string reasons for specific components.
 */

type Reason = "keyboard" | "picker" | "modal" | "drawer" | "custom";

type State = {
  reasons: Set<Reason | string>;
  isNavHidden: boolean;
  hide: (reason: Reason | string) => void;
  show: (reason: Reason | string) => void;
  reset: () => void;
};

export const useUiChrome = create<State>((set) => ({
  reasons: new Set(),
  isNavHidden: false,
  hide: (reason) =>
    set((s) => {
      const next = new Set(s.reasons);
      next.add(reason);
      return { reasons: next, isNavHidden: next.size > 0 };
    }),
  show: (reason) =>
    set((s) => {
      const next = new Set(s.reasons);
      next.delete(reason);
      return { reasons: next, isNavHidden: next.size > 0 };
    }),
  reset: () => set({ reasons: new Set(), isNavHidden: false }),
}));
