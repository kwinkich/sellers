import { AuthAPI, type AuthResponse } from "@/entities";
import { updateAuthToken } from "@/shared/lib/getAuthToken";
import { getTelegramInitData } from "@/shared/lib/telegram";
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

  const redirectByRole = (role: UserAppRole) => {
    // Only redirect if on root path
    if (window.location.pathname === "/") {
      const routes = {
        CLIENT: "/client/home",
        ADMIN: "/admin/home",
        MOP: "/mop/home",
      };
      const route = routes[role];
      if (route) {
        navigate(route, { replace: true });
      }
    }
  };

  useEffect(() => {
    const ok = refreshQ.data ?? authQ.data;
    if (ok?.data) {
      updateAuthToken(ok.data.accessToken);
      setUserData(ok.data.user);
      redirectByRole(ok.data.user.role as UserAppRole);
    }
  }, [refreshQ.data, authQ.data]);

  return {
    isLoading: refreshQ.isLoading || authQ.isLoading,
    isError: refreshQ.isError || authQ.isError,
    error: refreshQ.error || authQ.error,
    userData,
  };
};
