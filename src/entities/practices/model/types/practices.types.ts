export type PracticeRole = "SELLER" | "BUYER" | "MODERATOR";
export type PracticeStatus =
	| "CREATED"
	| "SCHEDULED"
	| "IN_PROGRESS"
	| "FINISHED"
	| "CANCELLED";

export interface SkillPractices {
	id: number;
	name: string;
	code: string;
}

export interface CaseInfo {
	id: number;
	title: string;
}

export interface Practice {
	id: number;
	title: string;
	scenarioId: number;
	scenarioVersion: number;
	caseId: number;
	practiceType: string;
	createdByUserId: number;
	createdByRole: string;
	startAt: string;
	status: PracticeStatus;
	zoomLink: string;
	autoCancelAt: string;
	sellerUserId: number;
	buyerUserId: number;
	moderatorUserId: number;
	createdAt: string;
	updatedAt: string;
	[key: string]: any;
}

export interface PracticeCard {
	id: number;
	practiceType: string;
	title: string;
	description: string;
	skills: SkillPractices[];
	participantsCount: number;
	startAt: string;
	endAt: string;
	status: PracticeStatus;
	freeRoles: PracticeRole[];
	myRole: PracticeRole;
	zoomLink: string;
	case: CaseInfo;
	resultsAvailable: boolean;
	recordingUrl: string;
}

export interface CreatePracticeRequest {
	scenarioId: number;
	caseId: number;
	skillIds: number[];
	startAt: string;
	initialRole: PracticeRole;
	zoomLink: string;
}

export interface ClaimRoleRequest {
	role: PracticeRole;
}

export interface PracticeFinishResult {
	practiceId: number;
	status: PracticeStatus;
}

export interface GetPracticesParams {
	limit?: number;
	page?: number;
	by?: "id" | "startAt" | "status" | "createdAt" | "updatedAt";
	order?: "asc" | "desc";
	id?: number | number[];
	title?: string;
	scenarioId?: number | number[];
	caseId?: number | number[];
	status?: string | string[];
	practiceType?: string | string[];
	createdByUserId?: number | number[];
	sellerUserId?: number | number[];
	buyerUserId?: number | number[];
	moderatorUserId?: number | number[];
}

export interface GetPracticeCardsParams {
	limit?: number;
	page?: number;
	by?: "id" | "startAt" | "createdAt";
	order?: "asc" | "desc";
	status?: string | string[];
	from?: string;
	to?: string;
}

export interface GetMyPracticesParams {
	limit?: number;
	page?: number;
}

export interface GetPastPracticesParams {
	limit?: number;
	page?: number;
}
