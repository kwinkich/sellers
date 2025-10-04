export interface ContentBlock {
	orderIndex: number;
	type: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "FILE";
	textContent: string;
	storageObjectId: number;
}

export interface Lesson {
	id: number;
	moduleId: number;
	quizId: number;
	title: string;
	shortDesc: string;
	orderIndex: number;
	contentBlocks: ContentBlock[];
}

export interface CreateLessonRequest {
	title: string;
	moduleId: number;
	quizId: number;
	orderIndex: number;
	shortDesc: string;
	contentBlocks: ContentBlock[];
}

export interface UpdateLessonRequest {
	title?: string;
	moduleId?: number;
	quizId?: number;
	orderIndex?: number;
	shortDesc?: string;
	contentBlocks?: ContentBlock[];
}

export interface GetLessonsParams {
	limit?: number;
	page?: number;
	moduleId?: number;
}
