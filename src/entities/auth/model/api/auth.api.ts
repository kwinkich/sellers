import { API, type GResponse } from "@/shared";
import WebApp from "@twa-dev/sdk";
import type { AuthResponse } from "../types/auth.types";

export const AuthAPI = {
	authTelegram: () =>
		API.post("auth/telegram", {
			json: {
				initData: WebApp.initData,
			},
		}).json<GResponse<AuthResponse>>(),

	refreshTelegram: () =>
		API.post("auth/refresh").json<GResponse<AuthResponse>>(),
};
