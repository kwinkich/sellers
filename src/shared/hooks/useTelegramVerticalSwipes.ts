import { useEffect } from "react";
import WebApp from "@twa-dev/sdk";

/**
 * Hook to control Telegram's vertical swipe gestures (swipe down to close).
 * Use this on screens where the swipe-to-close gesture would be harmful,
 * such as forms, drawers, or evaluation screens.
 */
export function useTelegramVerticalSwipes(disable: boolean = true) {
  useEffect(() => {
    if (!WebApp) return;

    try {
      if (disable) {
        // Disable vertical swipes to prevent accidental app close
        WebApp.disableVerticalSwipes?.();
      } else {
        // Re-enable vertical swipes
        WebApp.enableVerticalSwipes?.();
      }
    } catch (error) {
      // Silently handle cases where the methods don't exist
      console.debug("Telegram vertical swipe control not available:", error);
    }

    return () => {
      try {
        // Always re-enable on cleanup to avoid breaking other screens
        WebApp.enableVerticalSwipes?.();
      } catch (error) {
        console.debug("Telegram vertical swipe cleanup failed:", error);
      }
    };
  }, [disable]);
}
