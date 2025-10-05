import { API, type GResponse } from "@/shared";
import type { AuthResponse } from "../types/auth.types";

export const AuthAPI = {
	authTelegram: () =>
		API.post("auth/telegram", {
			json: {
				// initData: WebApp.initData,
				initData:
					"user=%7B%22id%22%3A845165899%2C%22username%22%3A%22kwinkich_dev%22%7D&auth_date=1759593429&hash=3a3d90155b9a5ab7cea688c0c2dc8c6be2995769d1a3405f0f3bfc84083e688d",
			},
		}).json<GResponse<AuthResponse>>(),

	refreshTelegram: () =>
		API.post("auth/refresh").json<GResponse<AuthResponse>>(),
};
