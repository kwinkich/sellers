import { useEffect, useRef, useState } from "react";

const KB_THRESHOLD = 120; // px

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

export function useKeyboardVisibility() {
  const [isVisible, setIsVisible] = useState(false);
  const editingRef = useRef(false);
  const baselineRef = useRef<number>(0);

  useEffect(() => {
    const vv = (window as any).visualViewport as VisualViewport | undefined;

    const getH = () => vv?.height ?? window.innerHeight;

    // Initialize baseline to the largest observed height
    const initH = getH();
    baselineRef.current = initH;

    const recompute = () => {
      const h = getH();
      // Keep baseline as the MAX we've seen (accounts for toolbar show/hide/orientation)
      if (h > baselineRef.current) baselineRef.current = h;

      const delta = baselineRef.current - h; // how much shorter the viewport is now
      const visibleByDelta = delta > KB_THRESHOLD;
      const visible = visibleByDelta || editingRef.current; // OR together for webviews that don't change height
      setIsVisible(!!visible);
    };

    // --- event wires ---
    let raf = 0;
    const onVV = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(recompute);
    };
    const onResize = onVV;

    const onFocusIn = (e: FocusEvent) => {
      editingRef.current = isEditable(e.target);
      recompute();
    };
    const onFocusOut = () => {
      editingRef.current = false;
      recompute();
    };

    // visualViewport if present
    vv?.addEventListener("resize", onVV);
    vv?.addEventListener("scroll", onVV);

    // Fallbacks/additional signals
    window.addEventListener("resize", onResize);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);

    // First compute
    recompute();

    return () => {
      vv?.removeEventListener("resize", onVV);
      vv?.removeEventListener("scroll", onVV);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      cancelAnimationFrame(raf);
    };
  }, []);

  return { isKeyboardVisible: isVisible };
}
