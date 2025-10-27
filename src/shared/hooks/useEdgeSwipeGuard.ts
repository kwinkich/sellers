import { useEffect, useRef } from "react";

/**
 * Hook to prevent Telegram's "swipe down to close" gesture from interfering
 * with scroll areas. Guards against edge swipes that could trigger the host app's
 * close gesture when the user is at the top or bottom of a scrollable area.
 */
export function useEdgeSwipeGuard() {
  const startY = useRef(0);
  const elRef = useRef<HTMLElement | null>(null);

  const refCb = (el: HTMLElement | null) => {
    elRef.current = el;
  };

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const onStart = (e: TouchEvent) => {
      startY.current = e.touches[0].clientY;
    };

    const onMove = (e: TouchEvent) => {
      const y = e.touches[0].clientY;
      const dy = y - startY.current;

      const atTop = el.scrollTop <= 0;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;

      // Block downward drag at top, upward drag at bottom
      if ((atTop && dy > 0) || (atBottom && dy < 0)) {
        e.preventDefault();
      }
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });

    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
    };
  }, []);

  return refCb;
}
