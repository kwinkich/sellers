export interface Module {
	id: number;
	courseId: number;
	title: string;
	shortDesc: string;
	testVariant: "NONE" | "QUIZ" | "PRACTICE";
	quizId: number;
	unlockRule: "ALL" | "PREVIOUS" | "TEST";
	orderIndex: number;
	createdAt: string;
	updatedAt: string;
}

export interface CreateModuleRequest {
	title: string;
	courseId: number;
	shortDesc: string;
	testVariant: "NONE" | "QUIZ" | "PRACTICE";
	quizId: number;
	unlockRule: "ALL" | "PREVIOUS" | "TEST";
	orderIndex: number;
}

export interface UpdateModuleRequest {
	courseId?: number;
	title?: string;
	shortDesc?: string;
	testVariant?: "NONE" | "QUIZ" | "PRACTICE";
	quizId?: number;
	unlockRule?: "ALL" | "PREVIOUS" | "TEST";
	orderIndex?: number;
}

export interface GetModulesParams {
	limit?: number;
	page?: number;
	courseId?: number;
}
