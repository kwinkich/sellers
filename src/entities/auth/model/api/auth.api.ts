import { API, type GResponse } from "@/shared";
// import WebApp from "@twa-dev/sdk";
import type { AuthResponse } from "../types/auth.types";

export const AuthAPI = {
	authTelegram: () =>
		API.post("auth/telegram", {
			json: {
				// initData: WebApp.initData,
        initData:
          "user=%7B%22id%22%3A243251%2C%22username%22%3A%22mop3tg%22%7D&auth_date=1759731227&hash=8f95d26a7c8a25f9131630abd55bde385db463aa237bfc21b90d6b22d370dc0a",
			},
		}).json<GResponse<AuthResponse>>(),

	refreshTelegram: () =>
		API.post("auth/refresh").json<GResponse<AuthResponse>>(),
};
