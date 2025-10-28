import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      // Scroll window to top
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });

      // Scroll all possible scroll containers
      const scrollContainers = [
        // Main layout scroll container
        document.querySelector("[data-scroll-container]"),
        // Page-specific scroll containers (like create-case page)
        document.querySelector(".overflow-y-auto"),
        // Any other common scroll container selectors
        document.querySelector(".overflow-auto"),
        document.querySelector("[style*='overflow-y: auto']"),
        document.querySelector("[style*='overflow: auto']"),
      ].filter(Boolean) as HTMLElement[];

      scrollContainers.forEach((container) => {
        if (container) {
          container.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }
      });

      // Handle Telegram WebApp if available
      try {
        const WebApp = (window as any).Telegram?.WebApp;
        if (WebApp?.scrollToTop) {
          WebApp.scrollToTop();
        }
      } catch (error) {
        // Ignore Telegram WebApp errors
      }
    });
  }, [pathname]);

  return null;
}
