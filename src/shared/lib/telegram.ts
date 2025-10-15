import WebApp from "@twa-dev/sdk";

// Type declaration for Telegram WebApp API
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        openLink: (url: string) => void;
      };
    };
  }
}

/**
 * Возвращает сырую initData.
 * В Telegram-клиенте — берём из SDK.
 * В DEV в браузере — только из .env (VITE_DEV_TG_INIT_DATA).
 */
export function getTelegramInitData(): string {
  const real = WebApp.initData;
  if (real && real.length > 0) return real;

  return (import.meta.env.VITE_DEV_TG_INIT_DATA as string | undefined) || "";
}

// Если нужен start_param — только из SDK (без URL-фолбэков)
export function getTelegramStartParam(): string | null {
  return WebApp?.initDataUnsafe?.start_param || null;
}

/**
 * Opens a URL using Telegram WebApp API if available, otherwise falls back to regular browser behavior
 * @param url - The URL to open
 */
export function openExternalUrl(url: string): void {
  try {
    // Validate URL
    if (!url || typeof url !== "string") {
      console.error("Invalid URL provided to openExternalUrl:", url);
      return;
    }

    // Check if we're in Telegram WebApp environment
    if (window.Telegram?.WebApp?.openLink) {
      // Use Telegram WebApp API to open in external browser
      window.Telegram.WebApp.openLink(url);
    } else {
      // Fallback to regular browser behavior - open in new tab
      window.open(url, "_blank", "noopener,noreferrer");
    }
  } catch (error) {
    console.error("Error in openExternalUrl:", error);
    // Fallback: try to open URL anyway
    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (fallbackError) {
      console.error("Fallback open failed:", fallbackError);
    }
  }
}
