import { AuthAPI, type AuthResponse } from "@/entities";
import { doRefresh } from "@/shared/api/client.api";
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

  // Check if we have an access token - try refresh on boot if present
  const accessToken = localStorage.getItem("accessToken");
  const hasAccess = !!accessToken;
  const canTryRefresh = hasAccess; // try refresh once on boot

  const refreshQ = useQuery({
    queryKey: ["auth", "refresh"],
    queryFn: doRefresh, // Use shared single-flight refresh function
    enabled: canTryRefresh,
    retry: false,
  });

  const authQ = useQuery({
    queryKey: ["auth", "telegram"],
    queryFn: AuthAPI.authTelegram,
    enabled: !canTryRefresh && !!getTelegramInitData(),
    retry: false,
  });

  // 1) Считаем start_param один раз при инициализации
  useEffect(() => {
    const sp = getTelegramStartParam();
    const target = parseStartParam(sp);
    setPending(target.type !== "unknown" ? target : null);
  }, [setPending]);

  const redirectByRole = (role: UserAppRole) => {
    const currentPath = window.location.pathname;
    const routes = {
      CLIENT: "/client/home",
      ADMIN: "/admin/home",
      MOP: "/mop/home",
    } as const;
    const targetRoute = routes[role];

    // Check if user is already on a valid route for their role
    const isOnValidRoute =
      currentPath.startsWith(`/${role.toLowerCase()}`) ||
      currentPath.startsWith("/practice") ||
      currentPath.startsWith("/evaluation");

    // Only redirect if not on root path and not on a valid route for their role
    if (currentPath !== "/" && !isOnValidRoute && targetRoute) {
      navigate(targetRoute, { replace: true });
    } else if (currentPath === "/" && targetRoute) {
      navigate(targetRoute, { replace: true });
    }
  };

  // Handle successful auth/refresh
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
      const tab = ok.data.user.role === "CLIENT" ? "all" : "mine";
      navigate(
        `/practice?tab=${tab}&scrollTo=${encodeURIComponent(scrollKey)}`,
        {
          replace: true,
        }
      );
      return;
    }

    // 3) fallback — старое поведение по роли
    redirectByRole(ok.data.user.role as UserAppRole);
  }, [refreshQ.data, authQ.data, navigate]);

  // Handle refresh failure - fallback to Telegram auth
  useEffect(() => {
    if (refreshQ.isError && getTelegramInitData()) {
      console.log("🔄 Refresh failed, attempting Telegram auth fallback");
      (async () => {
        try {
          const ok = await AuthAPI.authTelegram();
          updateAuthToken(ok.data.accessToken);
          setUserData(ok.data.user);

          // Handle deep link or redirect by role
          const pending = useDeepLinkStore.getState().pending;
          if (pending?.type === "practice") {
            const scrollKey = `practice_${pending.id}`;
            const tab = ok.data.user.role === "CLIENT" ? "all" : "mine";
            navigate(
              `/practice?tab=${tab}&scrollTo=${encodeURIComponent(scrollKey)}`,
              { replace: true }
            );
            return;
          }

          redirectByRole(ok.data.user.role as UserAppRole);
        } catch (error) {
          console.error("Telegram auth fallback failed:", error);
          // Will render BlockedPage as before
        }
      })();
    }
  }, [refreshQ.isError, navigate]);

  return {
    isLoading: refreshQ.isLoading || authQ.isLoading,
    isError: refreshQ.isError || authQ.isError,
    error: refreshQ.error || authQ.error,
    userData,
  };
};
