export interface Module {
	id: number;
	courseId: number;
	title: string;
	shortDesc: string;
	testVariant: "NONE" | "QUIZ";
	lessonsCount: number;
	quizId: number;
	completedLessons: number;
	progressPercent: number;
	quizQuestionsCount: number;
	unlockRule: "ALL" | "LEVEL_3" | "LEVEL_4" | "AFTER_PREV_MODULE";
	orderIndex: number;
	createdAt: string;
	updatedAt: string;
}

export interface CreateModuleRequest {
	title: string;
	courseId: number;
	shortDesc: string;
	testVariant: "NONE" | "QUIZ";
	quizId: number;
	unlockRule: "ALL" | "LEVEL_3" | "LEVEL_4" | "AFTER_PREV_MODULE";
	orderIndex: number;
}

export interface UpdateModuleRequest {
	courseId?: number;
	title?: string;
	shortDesc?: string;
	testVariant?: "NONE" | "QUIZ";
	quizId?: number;
	unlockRule: "ALL" | "LEVEL_3" | "LEVEL_4" | "AFTER_PREV_MODULE";
	orderIndex?: number;
}

export interface GetModulesParams {
	limit?: number;
	page?: number;
	courseId?: number;
}
