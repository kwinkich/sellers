import { API, type GResponse } from "@/shared";
// import WebApp from "@twa-dev/sdk";
import type { AuthResponse } from "../types/auth.types";

export const AuthAPI = {
	authTelegram: () =>
		API.post("auth/telegram", {
			json: {
				// initData: WebApp.initData,
        initData:
          "user=%7B%22id%22%3A434343%2C%22username%22%3A%22mop_moderator_1759858305562_y6k5x%22%7D&auth_date=1759858654&hash=3d6e431bdeaef2dee93e1bc71ba5d12ceaf727bfb53e473004b3b45fe196cc3f",
			},
		}).json<GResponse<AuthResponse>>(),

	refreshTelegram: () =>
		API.post("auth/refresh").json<GResponse<AuthResponse>>(),
};
