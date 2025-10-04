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
