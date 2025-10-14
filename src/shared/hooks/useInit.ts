import { AuthAPI, type AuthResponse } from "@/entities";
import { updateAuthToken } from "@/shared/lib/getAuthToken";
import {
  getTelegramInitData,
  getTelegramStartParam,
} from "@/shared/lib/telegram";
import { parseStartParam } from "@/shared/lib/startParam";
import { useDeepLinkStore } from "@/shared/stores/deepLink.store";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export type UserAppRole = "CLIENT" | "ADMIN" | "MOP";

interface UseAppInitReturn {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  userData: AuthResponse["user"] | null;
}

export const useAppInit = (): UseAppInitReturn => {
  const navigate = useNavigate();
  const setPending = useDeepLinkStore((s) => s.setPending);
  const [userData, setUserData] = useState<AuthResponse["user"] | null>(null);

  const hasToken = !!localStorage.getItem("accessToken");

  const refreshQ = useQuery({
    queryKey: ["auth", "refresh"],
    queryFn: AuthAPI.refreshTelegram,
    enabled: hasToken,
    retry: false,
  });

  const authQ = useQuery({
    queryKey: ["auth", "telegram"],
    queryFn: AuthAPI.authTelegram,
    enabled: !hasToken && !!getTelegramInitData(),
    retry: false,
  });

  // 1) Считаем start_param один раз при инициализации
  useEffect(() => {
    const sp = getTelegramStartParam();
    const target = parseStartParam(sp);
    setPending(target.type !== "unknown" ? target : null);
  }, [setPending]);

  const redirectByRole = (role: UserAppRole) => {
    // Only redirect if on root path
    if (window.location.pathname === "/") {
      const routes = {
        CLIENT: "/client/home",
        ADMIN: "/admin/home",
        MOP: "/mop/home",
      } as const;
      const route = routes[role];
      if (route) {
        navigate(route, { replace: true });
      }
    }
  };

  useEffect(() => {
    const ok = refreshQ.data ?? authQ.data;
    if (!ok?.data) return;

    updateAuthToken(ok.data.accessToken);
    setUserData(ok.data.user);

    // 2) Если есть pending deep link — используем его при редиректе
    const pending = useDeepLinkStore.getState().pending;
    if (pending?.type === "practice") {
      // переходим на список практик: вкладка mine + якорь
      const scrollKey = `practice_${pending.id}`;
      navigate(`/practice?tab=mine&scrollTo=${encodeURIComponent(scrollKey)}`, {
        replace: true,
      });
      return;
    }

    // 3) fallback — старое поведение по роли
    redirectByRole(ok.data.user.role as UserAppRole);
  }, [refreshQ.data, authQ.data, navigate]);

  return {
    isLoading: refreshQ.isLoading || authQ.isLoading,
    isError: refreshQ.isError || authQ.isError,
    error: refreshQ.error || authQ.error,
    userData,
  };
};
