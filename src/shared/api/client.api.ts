import ky, { HTTPError } from "ky";
import {
  getAuthToken,
  updateAuthToken,
  clearAllTokens,
} from "../lib/getAuthToken";
import { getTelegramInitData } from "../lib/telegram";
import { handleUnauthorized } from "../lib/unauthorizedInterceptor";

// — глобальный «замок» refresh
let refreshing: Promise<void> | null = null;
let refreshAttempts = 0;

function forceLogout() {
  console.log("🧹 API: Принудительный logout - очищаем все токены");
  clearAllTokens();
  handleUnauthorized();
}

// Общие функции для API клиентов
function attachToken(req: Request) {
  const t = getAuthToken();
  if (t) req.headers.set("Authorization", `Bearer ${t}`);
}

async function handle401(request: Request, options: any, response: Response) {
  // 1) успех — ничего не делаем
  if (response.ok) return;

  // 2) ошибки НЕ 401 — вытащим тело и выбросим
  if (response.status !== 401) {
    let data: any;
    try {
      data = await response.clone().json();
    } catch {
      data = { message: response.statusText };
    }
    throw data;
  }

  // 3) 401 — не ретраим для самих auth эндпоинтов и если уже делали ретрай
  const requestUrl = new URL(request.url);
  const isAuth = /\/auth\/(refresh|telegram)$/.test(requestUrl.pathname);
  if (isAuth || (request as any).__retried401 || (options as any).__retrying) {
    console.log(
      "🚫 KY: Пропускаем обработку 401 - уже обработан или auth endpoint"
    );
    throw new HTTPError(response, request, options);
  }
  (request as any).__retried401 = true;

  // 4) пробуем обновиться
  console.log("🔄 KY: Обрабатываем 401, пробуем refresh");
  try {
    await doRefreshSafe();
    console.log("✅ KY: Refresh успешен, ретраим запрос");
  } catch (e) {
    console.log("❌ KY: Refresh не удался, пробуем auth");
    if (
      e instanceof HTTPError ||
      (e instanceof Error && /Unauthorized/i.test(e.message))
    ) {
      try {
        await doAuth();
        console.log("✅ KY: Auth успешен, ретраим запрос");
      } catch {
        console.log("❌ KY: Auth не удался, принудительный logout");
        forceLogout();
      }
    } else {
      throw e; // не сбивать refresh при сетевых ошибках
    }
  }

  // 5) ретрай исходного запроса с новым access
  const t = getAuthToken();
  const newOpts: any = {
    ...options,
    method: request.method,
    body: options.body,
    headers: new Headers(options.headers || {}),
    __retrying: true,
  };
  if (t) (newOpts.headers as Headers).set("Authorization", `Bearer ${t}`);

  // ВАЖНО: вернуть именно Response, без .json()
  // Используем base клиент для ретрая, чтобы избежать рекурсии
  const retryUrl = new URL(request.url);
  const path = retryUrl.pathname + retryUrl.search;

  // Убираем API префикс из пути, так как prefixUrl уже содержит его
  const apiPrefix = import.meta.env.VITE_API_PREFIX || "/api/v1";
  const cleanPath = path.replace(new RegExp(`^${apiPrefix}`), "");
  // Убираем ведущий слэш, если он есть
  const finalPath = cleanPath.startsWith("/") ? cleanPath.slice(1) : cleanPath;

  return base(finalPath, newOpts);
}

const base = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL,
  credentials: "include",
  retry: 0,
  timeout: 10000, // <<— таймаут на любой запрос, чтобы не висло вечно
});

async function doRefresh() {
  if (!refreshing) {
    refreshing = (async () => {
      console.log("🔄 KY: Выполняем refresh");
      const res = await base.post("auth/refresh");

      // Контроль 401/403 - выбрасываем ошибку для корректной обработки
      if (res.status === 401 || res.status === 403) {
        throw new Error(`Unauthorized: ${res.status}`);
      }

      if (!res.ok) {
        throw new Error(`Refresh failed with status ${res.status}`);
      }

      const json = await res.json<{ data: { accessToken: string } }>();
      console.log("✅ KY: Refresh успешен", json.data);
      updateAuthToken(json.data.accessToken);
    })().finally(() => (refreshing = null));
  }
  return refreshing;
}

async function doRefreshSafe() {
  if (refreshAttempts > 3) {
    console.log("🚨 KY: Превышен лимит попыток refresh, принудительный logout");
    return forceLogout();
  }

  try {
    await doRefresh();
    refreshAttempts = 0; // сброс при успехе
  } catch (e) {
    refreshAttempts++;
    throw e;
  }
}

async function doAuth() {
  const initData = getTelegramInitData();
  if (!initData) throw new Error("No initData to re-auth");
  console.log("🔄 KY: Выполняем auth с initData");
  const res = await base.post("auth/telegram", { json: { initData } });
  if (!res.ok) {
    throw new Error(`Auth failed with status ${res.status}`);
  }
  const json = await res.json<{ data: { accessToken: string } }>();
  console.log("✅ KY: Auth успешен", json.data);
  updateAuthToken(json.data.accessToken);
}

// Фабрика для создания API клиентов
function createAPI() {
  return ky.create({
    prefixUrl: import.meta.env.VITE_API_URL,
    credentials: "include",
    retry: 0,
    timeout: 10000,
    hooks: {
      beforeRequest: [attachToken],
      afterResponse: [handle401],
    },
  });
}

export const API = createAPI();

export const SILENT_API = createAPI();
export const FILE_API = createAPI();
