import { AuthAPI, type AuthResponse } from "@/entities";
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
				setUserData(data.data.user);
				redirectByRole(data.data.user.role as UserAppRole);
			}
		},
		onError: (error) => {
			console.error("Auth error:", error);
		},
	});

	const redirectByRole = (role: UserAppRole) => {
		const routes = {
			CLIENT: "/client/home",
			ADMIN: "/admin/home",
			MOP: "/mop/home",
		};

		const route = routes[role];
		if (route) {
			navigate(route);
		}
	};

	const refreshMutation = useMutation({
		mutationFn: AuthAPI.refreshTelegram,
		onSuccess: (data) => {
			if (data.data) {
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
