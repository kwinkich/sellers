import { API, type GResponse } from "@/shared";
import type { AuthResponse } from "../types/auth.types";

export const AuthAPI = {
	authTelegram: () =>
		API.post("auth/telegram", {
			json: {
				// initData: WebApp.initData,
				initData:
					"user=%7B%22id%22%3A2282282%2C%22username%22%3A%22admin%22%7D&auth_date=1759690976&hash=ba1b3df7865299074ed2b1d760ee853923267ed7f6d720c4f8f2631a2f4ea402",
			},
		}).json<GResponse<AuthResponse>>(),

	refreshTelegram: () =>
		API.post("auth/refresh").json<GResponse<AuthResponse>>(),
};
