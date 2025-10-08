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

// === Base item used in some legacy places (kept for compatibility) ===
export interface ScaleItem {
	id: number;
	title: string;
	position: number;
	skillId: number;
}

// === New schema aligned with getEvalFormsSchema ===
export type FormBlockType = "TEXT" | "QA" | "SCALE_SKILL_SINGLE" | "SCALE_SKILL_MULTI";

export interface EvalScaleOption {
	id: number;
	label: string;
	value: number;
	ord: number;
	countsTowardsScore: boolean;
}

export interface EvalScale {
	id: number;
	options: EvalScaleOption[];
}

export interface EvalBlockItem {
	id: number;
	title: string;
	position: number;
	skillId?: number | null;
}

export interface EvaluationFormBlock {
	id: number;
	type: FormBlockType;
	title?: string | null;
	required: boolean;
	position: number;
	scale?: EvalScale | null;
	items: EvalBlockItem[];
}

export interface EvaluationForm {
	id: number;
	role: "SELLER" | "BUYER" | "MODERATOR";
	evaluatedUserId: number;
	title?: string | null;
	descr?: string | null;
	blocks: EvaluationFormBlock[];
}

export interface EvaluationAnswer {
	blockId: number;
	itemId?: number | null;
	selectedOptionId?: number | null;
	textAnswer?: string | null;
	targetSkillId?: number | null;
}

export interface EvaluationSubmission {
	evaluatedUserId: number;
	answers: EvaluationAnswer[];
}

export interface EvaluationBatchSubmission {
	submissions: {
		evaluatedUserId: number;
		answers: EvaluationAnswer[];
	}[];
}

export interface EvaluationSubmitResult {
	taskStatus: EvaluationStatus;
	submissionId: number;
}

export interface EvaluationBatchSubmitResult {
	results: Array<{
		evaluatedUserId: number;
		taskStatus: "SUBMITTED";
		submissionId: number;
	}>;
}

export interface GetEvaluationFormParams {
	evaluatedUserId: number;
}
