import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthAPI, type AuthResponse } from "@/entities";
import { updateAuthToken, clearAllTokens } from "@/shared/lib/getAuthToken";

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
  const hasToken = !!localStorage.getItem("accessToken");

  const refreshQ = useQuery({
    queryKey: ["auth", "refresh"],
    queryFn: AuthAPI.refreshTelegram,
    enabled: hasToken,
    retry: 0,
    staleTime: Infinity,
  });

  const authQ = useQuery({
    queryKey: ["auth", "telegram"],
    queryFn: AuthAPI.authTelegram,
    enabled: !hasToken, // в браузере без Telegram упадёт сразу — и это ок
    retry: 0,
    staleTime: Infinity,
  });

  const data = refreshQ.data ?? authQ.data;
  // Ошибка только если auth тоже упал (refresh может упасть, если кука недоступна)
  const error = (authQ.error as Error) ?? null;
  const isLoading = refreshQ.isLoading || authQ.isLoading;

  // Fallback: если refresh упал с 401, попробовать включить authTelegram
  useEffect(() => {
    if (refreshQ.error && !authQ.isFetched && !authQ.data) {
      console.log("🔄 useAppInit: Refresh упал, пробуем auth");
      // Очищаем старые токены перед попыткой новой авторизации
      clearAllTokens();
      authQ.refetch();
    }
  }, [refreshQ.error, authQ.isFetched, authQ.data, authQ]);

  // Сброс битого токена только если auth тоже упал
  useEffect(() => {
    if (refreshQ.error && authQ.error) {
      console.log("🧹 useAppInit: Очищаем токены при ошибке авторизации");
      clearAllTokens();
    }
  }, [refreshQ.error, authQ.error]);

  // побочный эффект — один раз, когда есть данные
  useEffect(() => {
    if (!data?.data) return;
    const { accessToken, user } = data.data;
    updateAuthToken(accessToken);

    // Редиректим ТОЛЬКО если мы на корне, либо если текущий путь явно конфликтует с ролью
    const target = routeByRole(user.role as UserAppRole);
    if (shouldRedirect(loc.pathname, target)) {
      navigate(target, { replace: true });
    }
  }, [data, navigate, loc.pathname]);

  return {
    isLoading,
    isError: !!error,
    error,
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
