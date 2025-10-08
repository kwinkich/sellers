import type { AuthUserRole } from "../types/user.types";

export const getAuthToken = (): string => {
	const token = localStorage.getItem("authToken");
	if (token) return token;

	return "";
};

export const updateAuthToken = (t: string): boolean => {
	if (!t) return false;


	localStorage.setItem("authToken", t);

	return true;
};

// Function to decode JWT token and extract user ID
export const getUserIdFromToken = (): number | null => {
	try {
		const token = getAuthToken();
		if (!token) return null;

		// Decode JWT token (simple base64 decode for payload)
		const payload = JSON.parse(atob(token.split('.')[1]));
		return payload.userId || payload.id || payload.sub || null;
	} catch (error) {
		console.error("Error decoding JWT token:", error);
		return null;
	}
};

export const getUserRoleFromToken = (): AuthUserRole | null => {
	try {
		const token = getAuthToken();
		if (!token) return null;

		// Decode JWT token (simple base64 decode for payload)
		const payload = JSON.parse(atob(token.split('.')[1]));
		const r = payload.role as string | undefined;
		if (r === "ADMIN" || r === "CLIENT" || r === "MOP") return r;
		return null;
	} catch (error) {
		console.error("Error decoding JWT token:", error);
		return null;
	}
};
