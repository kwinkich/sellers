export const getAuthToken = (): string => {
	const token = localStorage.getItem("authToken");
	if (token) return token;

	return "";
};

export const updateAuthToken = (t: string): boolean => {
	if (!t) return false;

	console.log("updateAuthToken", t);

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