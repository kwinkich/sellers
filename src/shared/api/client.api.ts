import ky from "ky";
import {
  getAuthToken,
  updateAuthToken,
  clearAllTokens,
} from "../lib/getAuthToken";
import { getTelegramInitData } from "../lib/telegram";
import { handleUnauthorized } from "../lib/unauthorizedInterceptor";
import { getFullApiUrl, getApiPrefixForPath } from "../lib/api-config";
import type { GResponse } from "@/shared";
import type { AuthResponse } from "@/entities";

let refreshing: Promise<GResponse<AuthResponse>> | null = null;
let refreshAttempts = 0;

async function apiLogout() {
  try {
    await base.post("auth/logout");
  } catch {}
  localStorage.removeItem("accessToken"); // server clears the cookie
}

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

function isAuthPath(url: string) {
  const u = new URL(url);
  return /\/auth\/(refresh|telegram|logout)$/.test(u.pathname);
}

async function handle401(request: Request, options: any, response: Response) {
  if (response.ok) return;
  if (response.status !== 401) {
    let data: any;
    try {
      data = await response.clone().json();
    } catch {
      data = { message: response.statusText };
    }
    throw data;
  }

  // Don't intercept auth endpoints and don't retry twice
  if ((options as any).__retrying || isAuthPath(request.url)) {
    return response; // let caller handle the 401
  }

  try {
    await doRefreshSafe();
  } catch {
    try {
      await doAuth();
    } catch {
      // final fallback: logout and bubble error
      await apiLogout();
      throw new Error("Unauthorized");
    }
  }

  // Retry original request once with fresh access token
  const t = getAuthToken();
  const newOpts: any = {
    ...options,
    method: request.method,
    body: options.body,
    headers: new Headers(options.headers || {}),
    __retrying: true,
  };
  if (t) (newOpts.headers as Headers).set("Authorization", `Bearer ${t}`);

  const retryUrl = new URL(request.url);
  const path = retryUrl.pathname + retryUrl.search;
  const apiPrefix = getApiPrefixForPath();
  const cleanPath = path.replace(new RegExp(`^${apiPrefix}`), "");
  const finalPath = cleanPath.startsWith("/") ? cleanPath.slice(1) : cleanPath;

  return base(finalPath, newOpts);
}

const base = ky.create({
  prefixUrl: getFullApiUrl(),
  credentials: "include",
  retry: 0,
  timeout: 10000, // <<— таймаут на любой запрос, чтобы не висло вечно
});

async function doRefresh(): Promise<GResponse<AuthResponse>> {
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

      const json = await res.json<GResponse<AuthResponse>>();
      console.log("✅ KY: Refresh успешен", json.data);
      updateAuthToken(json.data.accessToken);
      return json;
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
    prefixUrl: getFullApiUrl(),
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

export { doRefresh };
