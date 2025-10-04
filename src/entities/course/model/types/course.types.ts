export interface Course {
	id: number;
	title: string;
	shortDesc: string;
	accessScope: "ALL" | "SELECTED";
	isIntro: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CreateCourseRequest {
	title: string;
	shortDesc: string;
	accessScope: "ALL" | "SELECTED";
	isIntro: boolean;
	clientIds: number[];
}

export interface UpdateCourseRequest {
	title?: string;
	shortDesc?: string;
	accessScope?: "ALL" | "SELECTED";
	isIntro?: boolean;
	clientIds?: number[];
}

export interface GetCoursesParams {
	limit?: number;
	page?: number;
}
