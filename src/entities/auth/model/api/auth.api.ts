import { API, type GResponse } from "@/shared";
// import WebApp from "@twa-dev/sdk";
import type { AuthResponse } from "../types/auth.types";

export const AuthAPI = {
	authTelegram: () =>
		API.post("auth/telegram", {
			json: {
				// initData: WebApp.initData,
        initData:
          "user=%7B%22id%22%3A525252%2C%22username%22%3A%22adminuser%22%7D&auth_date=1759863575&hash=eb7c997439b399605c005447372ec9398b05b92bae3e2457624f1331bcd86e62",
			},
		}).json<GResponse<AuthResponse>>(),

	refreshTelegram: () =>
		API.post("auth/refresh").json<GResponse<AuthResponse>>(),
};
