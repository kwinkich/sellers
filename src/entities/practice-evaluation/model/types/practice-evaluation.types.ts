export type EvaluationStatus = "PENDING" | "SUBMITTED" | "EXPIRED";

export interface EvaluatedUser {
	id: number;
	name: string;
	role: "SELLER" | "BUYER" | "MODERATOR";
}

export interface EvaluationTask {
	evaluatedUser: EvaluatedUser;
	status: EvaluationStatus;
	deadlineAt: string;
	submissionId: number;
}

export interface ScaleItem {
	id: number;
	title: string;
	position: number;
	skillId: number;
}

export interface EvaluationFormBlock {
	blockId: number;
	type: string;
	title: string;
	helpText: string;
	required: boolean;
	position: number;
	skillId: number;
	scaleId: number;
	scaleItems: ScaleItem[];
}

export interface EvaluationForm {
	formId: number;
	role: "SELLER" | "BUYER" | "MODERATOR";
	title: string;
	descr: string;
	blocks: EvaluationFormBlock[];
}

export interface EvaluationAnswer {
	blockId: number;
	scaleItemId?: number;
	selectedOptionId?: number;
	textAnswer?: string;
}

export interface EvaluationSubmission {
	evaluatedUserId: number;
	answers: EvaluationAnswer[];
}

export interface EvaluationSubmitResult {
	taskStatus: EvaluationStatus;
	submissionId: number;
}

export interface GetEvaluationFormParams {
	evaluatedUserId: number;
}
