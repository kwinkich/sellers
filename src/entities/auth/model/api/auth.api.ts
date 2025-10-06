import { API, type GResponse } from "@/shared";
// import WebApp from "@twa-dev/sdk";
import type { AuthResponse } from "../types/auth.types";

export const AuthAPI = {
	authTelegram: () =>
		API.post("auth/telegram", {
			json: {
				// initData: WebApp.initData,
        initData:
          "user=%7B%22id%22%3A243251%2C%22username%22%3A%22mop3tg%22%7D&auth_date=1759671472&hash=d924b629895de0a94250d316610171e8f16c2ac8ef6ab5c11fb9826742cefcfa",
			},
		}).json<GResponse<AuthResponse>>(),

	refreshTelegram: () =>
		API.post("auth/refresh").json<GResponse<AuthResponse>>(),
};
