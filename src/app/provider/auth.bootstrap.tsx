import { AuthAPI } from "@/entities";
import { getAuthToken, updateAuthToken } from "@/shared";
import { useEffect, useRef } from "react";

export const AuthBootstrap = () => {
	const ranRef = useRef(false);

	useEffect(() => {
		if (ranRef.current) return;
		ranRef.current = true;

		const token = getAuthToken();
		if (!token) {
			void AuthAPI.authTelegram()
				.then((res) => {
					updateAuthToken(res.data.accessToken);
				})
				.catch(() => {
					// silently ignore bootstrap auth errors; downstream requests can surface errors
				});
		}
	}, []);

	return null;
};
