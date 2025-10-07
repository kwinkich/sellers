export interface AuthResponse {
	accessToken: string;
	expiresIn: number;
	user: {
		sub: number;
		role: string;
		username: string;
		displayName: string;
	};
}
