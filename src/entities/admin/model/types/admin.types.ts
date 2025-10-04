export interface Admin {
	id: number;
	telegramUsername: string;
	displayName: string;
	role: "ADMIN";
	createdAt: string;
	updatedAt: string;
}

export interface AdminProfile {
	id: number;
	telegramUsername: string;
	role: "ADMIN";
	activeClientsTotal: number;
	scheduledPracticesTotal: number;
}

export interface CreateAdminRequest {
	telegramUsername: string;
}

export interface GetAdminsParams {
	limit?: number;
	cursor?: string;
	dir?: "next" | "prev";
	withCount?: boolean;
	by?: "telegramUsername" | "createdAt";
	order?: "asc" | "desc";
	telegramUsername?: string | string[];
}
