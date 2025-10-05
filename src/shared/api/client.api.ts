import ky, { type KyRequest, type Options } from "ky";
import { getAuthToken } from "../lib/getAuthToken";

const CONFIG: Options = {
	hooks: {
		beforeRequest: [
			(request): KyRequest => {
					const accessToken = getAuthToken();
					if (accessToken) {
						request.headers.set("Authorization", `Bearer ${accessToken}`);
					}
				return request;
			},
		],
		afterResponse: [
			async (_request, _options, response): Promise<void> => {
				if (response.status >= 400) {
					throw await response.json();
				}
				return response.json();
			},
		],
	},
};

export const API = ky.extend({
	prefixUrl: import.meta.env.VITE_API_URL,
	...CONFIG,
});
