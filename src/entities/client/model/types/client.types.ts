export interface Client {
	id: number;
	level: "LEVEL_3";
	inn: string;
	addedByAdminId: number;
	clientUserId: number;
	activatedAt: string;
	createdAt: string;
	updatedAt: string;
	adminUser: {
		id: number;
		telegramUsername: string;
		displayName: string;
		role: string;
	};
	clientUser: {
		id: number;
		telegramUsername: string;
		displayName: string;
		role: string;
	};
	licenseSlots: LicenseSlot[];
}

export interface LicenseSlot {
	id: number;
	clientId: number;
	status: "NOT_ACTIVE" | "ACTIVE" | "EXPIRED";
	assignedMopUserId: number;
	durationSeconds: number;
	createdAt: string;
	updatedAt: string;
}

export interface ClientListItem {
	id: number;
	companyName: string;
	level: "LEVEL_3";
	licensesTotal: number;
	licensesActive: number;
	licensesNotActive: number;
	licensesExpired: number;
	daysLeftNearest: number;
	tgUsername: string;
	tgLink: string;
	isExpiringSoon: boolean;
	isFullyExpired: boolean;
}

export interface ClientDetail {
	id: number;
	displayName: string;
	telegramUsername: string;
	level: "LEVEL_3";
	inn: string;
	numberOfLicenses: number;
	closestLicenseExpiresAt: string;
}

export interface ClientProfile {
	id: number;
	totalLicenses: number;
	activeLicenses: number;
	notActiveLicenses: number;
	closestExpirationDate: string;
}

export interface ClientMop {
	id: number;
	mopUserId: number;
	displayName: string;
	licenseSlotId: number;
	licenseExpiresAt: string;
	learningProgress: number;
	skillsProgress: number;
}

export interface LicenseInfo {
	id: number;
	status: "NOT_ACTIVE" | "ACTIVE" | "EXPIRED";
	durationSeconds: number;
	daysLeft: number;
}

export interface CreateClientRequest {
	level: "LEVEL_3";
	telegramUsername: string;
	companyName: string;
	inn: string;
	licenseCount: number;
	licenseExpiresAt: string;
}

export interface UpdateClientRequest {
	level: "LEVEL_3";
	telegramUsername: string;
	companyName: string;
	inn: string;
}

export interface AddLicensesRequest {
	licenseCount: number;
	licenseExpiresAt: string;
}

export interface GetClientsParams {
	offset?: number;
	limit?: number;
	days?: number;
}
