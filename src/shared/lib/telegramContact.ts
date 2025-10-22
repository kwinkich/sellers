import WebApp from "@twa-dev/sdk";

/**
 * Нормализует Telegram URL в различные форматы
 * @param raw Сырая ссылка (может быть @username, https://t.me/username, tg://resolve?domain=username)
 * @returns Объект с https и tg версиями ссылки
 */
function normalizeTgUrl(raw?: string | null): { https?: string; tg?: string } {
  if (!raw) return {};
  let s = raw.trim();

  // если прислали '@user' — переводим в t.me/user
  if (s.startsWith("@")) s = `https://t.me/${s.slice(1)}`;

  try {
    const u = new URL(s, "https://t.me"); // базой считаем t.me
    if (u.hostname === "telegram.me") u.hostname = "t.me";

    // username из пути
    const username = u.pathname.replace(/^\/+/, "");
    if (username) {
      return {
        https: `https://t.me/${username}`,
        tg: `tg://resolve?domain=${username}`,
      };
    }
  } catch {}
  return {};
}

/**
 * Универсальный открыватель Telegram контактов для всех платформ
 * Пробует несколько способов в порядке приоритета:
 * 1. WebApp.openTelegramLink() (нативный для TWA)
 * 2. WebApp.openLink() (часто спасает десктоп-клиенты)
 * 3. window.open() (последняя соломинка)
 *
 * @param raw Сырая ссылка на Telegram контакт
 */
export function openTelegramContact(raw?: string | null) {
  const { https, tg } = normalizeTgUrl(raw);
  const platform = WebApp?.platform; // 'ios' | 'android' | 'tdesktop' | 'macos' | ...
  const canOTL = Boolean((WebApp as any)?.openTelegramLink);
  const canOL = Boolean((WebApp as any)?.openLink);

  console.log("🔗 Opening Telegram contact:", {
    raw,
    https,
    tg,
    platform,
    canOTL,
    canOL,
  });

  // 1) Предпочтительно: openTelegramLink (t.me или tg://)
  if (canOTL) {
    const url =
      platform === "macos" || platform === "tdesktop"
        ? tg ?? https
        : https ?? tg;
    if (url) {
      console.log("📱 Trying openTelegramLink with:", url);
      try {
        WebApp.openTelegramLink(url);
        return;
      } catch (error) {
        console.warn("openTelegramLink failed:", error);
      }
    }
  }

  // 2) Фолбэк через openLink (для десктопа часто открывает как надо)
  if (canOL && (https || tg)) {
    // На десктопе попробуем tg://, иначе https://
    const url =
      platform === "macos" || platform === "tdesktop"
        ? tg ?? https
        : https ?? tg;
    if (url) {
      console.log("🔗 Trying openLink with:", url);
      try {
        WebApp.openLink(url, { try_instant_view: false });
        return;
      } catch (error) {
        console.warn("openLink failed:", error);
      }
    }
  }

  // 3) Последний шанс — внешний браузер
  if (https) {
    console.log("🌐 Fallback to window.open with:", https);
    window.open(https, "_blank", "noopener");
  } else {
    console.error("❌ No valid Telegram URL found");
  }
}
