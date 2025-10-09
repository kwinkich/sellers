import WebApp from "@twa-dev/sdk";

/**
 * Возвращает сырую initData.
 * В Telegram-клиенте — берём из SDK.
 * В DEV в браузере — только из .env (VITE_DEV_TG_INIT_DATA).
 */
export function getTelegramInitData(): string {
  const real = WebApp?.initData;
  if (real && real.length > 0) return real;

  return (import.meta.env.VITE_DEV_TG_INIT_DATA as string | undefined) || "";
}

// Если нужен start_param — только из SDK (без URL-фолбэков)
export function getTelegramStartParam(): string | null {
  return WebApp?.initDataUnsafe?.start_param ?? null;
}
