export interface ContentBlock {
	orderIndex: number;
	type: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "FILE";
	textContent: string;
	storageObjectId: number; // Для отправки на сервер
	storageObject?: {
		// Для получения с сервера (опционально)
		id: number;
		provider: "MINIO";
		bucket: string;
		objectKey: string;
		contentType: string;
		sizeBytes: number;
		etag: string;
		publicUrl: string;
		visibility: "PUBLIC" | "PRIVATE";
		createdAt: string;
	} | null;
}

export interface CreateContentBlockRequest {
	orderIndex: number;
	type: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "FILE";
	textContent: string;
	storageObjectId: number; // Только ID при создании
}

export interface UpdateContentBlockRequest {
	orderIndex?: number;
	type?: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "FILE";
	textContent?: string;
	storageObjectId?: number; // Только ID при обновлении
}

export interface CreateLessonRequest {
	title: string;
	moduleId: number;
	quizId: number;
	orderIndex: number;
	shortDesc: string;
	contentBlocks: {
		orderIndex: number;
		type: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "FILE";
		textContent: string;
		storageObjectId: number; // Только ID при создании
	}[];
}

export interface UpdateLessonRequest {
	title?: string;
	moduleId?: number;
	quizId?: number;
	orderIndex?: number;
	shortDesc?: string;
	contentBlocks?: {
		orderIndex: number;
		type: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "FILE";
		textContent: string;
		storageObjectId: number; // Только ID при обновлении
	}[];
}

export interface Lesson {
	id: number;
	moduleId: number;
	quizId: number;
	title: string;
	shortDesc: string;
	orderIndex: number;
	completed: boolean;
	contentBlocks: ContentBlock[];
}

export interface GetLessonsParams {
	limit?: number;
	page?: number;
	moduleId?: number;
}
