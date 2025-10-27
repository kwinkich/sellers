import { useEffect, useRef } from "react";
import { useUiChrome } from "@/shared";

const KB_THRESHOLD = 120; // px
const HYSTERESIS_MS = 120; // smoothen rapid toggles

function isEditable(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return (
    el.isContentEditable ||
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT"
  );
}

export function useKeyboardChrome() {
  const hide = useUiChrome((s) => s.hide);
  const show = useUiChrome((s) => s.show);
  const reasons = useUiChrome((s) => s.reasons); // optional, if you want to inspect
  const lastSetRef = useRef<"shown" | "hidden">("hidden");
  const editingRef = useRef(false);
  const baselineRef = useRef<number>(0);
  const debounceRef = useRef<number>(0);

  useEffect(() => {
    const vv = (window as any).visualViewport as VisualViewport | undefined;
    const getH = () => vv?.height ?? window.innerHeight;

    // Initialize baseline with the largest seen height
    baselineRef.current = getH();

    const setHidden = (hidden: boolean) => {
      cancelAnimationFrame(debounceRef.current);
      debounceRef.current = requestAnimationFrame(() => {
        if (hidden && lastSetRef.current !== "shown") {
          hide("keyboard");
          lastSetRef.current = "shown";
        } else if (!hidden && lastSetRef.current !== "hidden") {
          show("keyboard");
          lastSetRef.current = "hidden";
        }
      });
    };

    let raf = 0;
    let timer: number | undefined;

    const recompute = () => {
      // update baseline as the max we have ever seen this session
      const h = getH();
      if (h > baselineRef.current) baselineRef.current = h;

      const delta = baselineRef.current - h;
      const visibleByDelta = delta > KB_THRESHOLD;
      const visible = visibleByDelta || editingRef.current;

      // simple hysteresis
      clearTimeout(timer);
      timer = window.setTimeout(() => setHidden(!!visible), HYSTERESIS_MS);
    };

    const onVV = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(recompute);
    };

    const onFocusIn = (e: FocusEvent) => {
      editingRef.current = isEditable(e.target);
      recompute();
    };
    const onFocusOut = () => {
      editingRef.current = false;
      recompute();
    };

    // Telegram viewport updates (fires on keyboard/open/close)
    const onTgViewport = () => {
      // Prefer TG values if present
      try {
        const WebApp = (window as any).Telegram?.WebApp;
        const vh = WebApp?.viewportHeight as number | undefined;
        if (vh) {
          if (vh > baselineRef.current) baselineRef.current = vh;
        }
      } catch {}
      recompute();
    };

    // App lifecycle — fix "stuck hidden after Back"
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        // App lost focus — clear editing + unhide navbar
        editingRef.current = false;
        show("keyboard");
        lastSetRef.current = "hidden";
      } else {
        // Re-baseline on resume
        baselineRef.current = getH();
        recompute();
      }
    };

    const onPageShow = () => {
      baselineRef.current = getH();
      editingRef.current = false;
      show("keyboard");
      lastSetRef.current = "hidden";
      recompute();
    };

    vv?.addEventListener("resize", onVV);
    vv?.addEventListener("scroll", onVV);
    window.addEventListener("resize", onVV);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onPageShow);

    // Telegram event
    try {
      const WebApp = (window as any).Telegram?.WebApp;
      WebApp?.onEvent?.("viewportChanged", onTgViewport);
    } catch {}

    // initial compute
    recompute();

    return () => {
      vv?.removeEventListener("resize", onVV);
      vv?.removeEventListener("scroll", onVV);
      window.removeEventListener("resize", onVV);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
      try {
        const WebApp = (window as any).Telegram?.WebApp;
        WebApp?.offEvent?.("viewportChanged", onTgViewport);
      } catch {}
      cancelAnimationFrame(raf);
      cancelAnimationFrame(debounceRef.current);
      if (timer) clearTimeout(timer);
    };
  }, [hide, show, reasons]);
}
