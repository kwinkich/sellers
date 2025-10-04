import ky, { type KyRequest, type Options } from "ky";

const CONFIG: Options = {
	hooks: {
		beforeRequest: [
			(request): KyRequest => {
				// const access_token = getAuthToken();
				// if (access_token) {
				request.headers.set(
					"Authorization",
					`Bearer 2f1c4a8e9d0b7c6e5f3a2d1c9b8e7a6d5c4b3a29181726354433221100ffeedd`
				);
				// }
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
