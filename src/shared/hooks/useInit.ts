import { AuthAPI, type AuthResponse } from "@/entities";
import { updateAuthToken } from "@/shared/lib/getAuthToken";
import { getTelegramInitData } from "@/shared/lib/telegram";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export type UserAppRole = "CLIENT" | "ADMIN" | "MOP";

interface UseAppInitReturn {
	isLoading: boolean;
	isError: boolean;
	error: Error | null;
	userData: AuthResponse["user"] | null;
}

export const useAppInit = (): UseAppInitReturn => {
	const [userData, setUserData] = useState<AuthResponse["user"] | null>(null);

	const hasToken = !!localStorage.getItem("accessToken");
	const navigate = useNavigate();
	const loc = useLocation();

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
	const { data } = useQuery({
		queryKey: ["auth", "bootstrap"],
		retry: 0,
		staleTime: Infinity,
		queryFn: async () => {
			const initData = getTelegramInitData();
			const inTelegram = !!initData;
			const preferTgFirst = inTelegram || import.meta.env.DEV;

			if (preferTgFirst) {
				try {
					const r = await AuthAPI.authTelegram();
					updateAuthToken(r.data.accessToken);
					return r;
				} catch (e) {
					// fall back to refresh if Telegram auth not possible
				}
			}

			try {
				const r = await AuthAPI.refreshTelegram();
				updateAuthToken(r.data.accessToken);
				return r;
			} catch (e) {
				if (inTelegram) {
					const r = await AuthAPI.authTelegram();
					updateAuthToken(r.data.accessToken);
					return r;
				}
				throw e;
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
		isLoading: refreshQ.isLoading || authQ.isLoading,
		isError: refreshQ.isError || authQ.isError,
		error: refreshQ.error || authQ.error,
		userData,
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
