import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthAPI, type AuthResponse } from "@/entities";
import { updateAuthToken } from "@/shared/lib/getAuthToken";
import { getTelegramInitData } from "@/shared/lib/telegram";

export type UserAppRole = "CLIENT" | "ADMIN" | "MOP";

interface UseAppInitReturn {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  userData: AuthResponse["user"] | null;
}

export const useAppInit = (): UseAppInitReturn => {
  const navigate = useNavigate();
  const loc = useLocation();

  const { data, error, isLoading } = useQuery({
    queryKey: ["auth", "bootstrap"],
    retry: 0,
    staleTime: Infinity,
    queryFn: async () => {
      // 1) Try refresh first (ALWAYS)
      try {
        const r = await AuthAPI.refreshTelegram();
        updateAuthToken(r.data.accessToken);
        return r;
      } catch (e) {
        // 2) Fallback to Telegram auth (only if we have initData)
        const initData = getTelegramInitData();
        if (!initData) throw e; // not in Telegram & no DEV initData
        const r = await AuthAPI.authTelegram();
        updateAuthToken(r.data.accessToken);
        return r;
      }
    },
  });

  useEffect(() => {
    const user = data?.data?.user;
    if (!user) return;
    const target = routeByRole(user.role as UserAppRole);
    if (shouldRedirect(loc.pathname, target)) {
      navigate(target, { replace: true });
    }
  }, [data, loc.pathname, navigate]);

  return {
    isLoading,
    isError: !!error,
    error: error as Error | null,
    userData: data?.data?.user ?? null,
  };
};

function routeByRole(role: UserAppRole) {
  return role === "CLIENT"
    ? "/client/home"
    : role === "ADMIN"
    ? "/admin/home"
    : "/mop/home";
}

function shouldRedirect(current: string, target: string) {
  // Редиректим с корня
  if (current === "/") {
    return true;
  }

  // НЕ редиректим с общих разделов (practice, evaluation)
  if (current.startsWith("/practice") || current.startsWith("/evaluation")) {
    return false;
  }

  // Извлекаем базовый путь (например, "/admin" из "/admin/home")
  const targetBase = target.split("/")[1];
  const currentBase = current.split("/")[1];

  // Если пользователь на другой ветке - редиректим
  if (currentBase && currentBase !== targetBase) {
    return true;
  }

  // Если уже на нужной ветке — не дёргаем
  if (current.startsWith(target)) {
    return false;
  }

  return false;
}
