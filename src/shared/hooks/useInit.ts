import { AuthAPI, type AuthResponse } from "@/entities";
import { updateAuthToken } from "@/shared/lib/getAuthToken";
import { useMutation } from "@tanstack/react-query";
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

  const authMutation = useMutation({
    mutationFn: AuthAPI.authTelegram,
    onSuccess: (data) => {
      if (data.data) {
        // persist access token on initial auth
        updateAuthToken(data.data.accessToken);
        setUserData(data.data.user);
        redirectByRole(data.data.user.role as UserAppRole);
      }
    },
    onError: (error) => {
      console.error("Auth error:", error);
    },
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

  const refreshMutation = useMutation({
    mutationFn: AuthAPI.refreshTelegram,
    onSuccess: (data) => {
      if (data.data) {
        // persist refreshed access token
        updateAuthToken(data.data.accessToken);
        setUserData(data.data.user);
        redirectByRole(data.data.user.role as UserAppRole);
      } else {
        authMutation.mutate();
      }
    },
    onError: () => {
      authMutation.mutate();
    },
  });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      refreshMutation.mutate();
    } else {
      authMutation.mutate();
    }
  }, []);

  return {
    isLoading: authMutation.isPending || refreshMutation.isPending,
    isError: authMutation.isError || refreshMutation.isError,
    error: authMutation.error || refreshMutation.error,
    userData,
  };
};
