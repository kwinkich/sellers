export interface Course {
  id: number;
  title: string;
  shortDesc: string | null;
  accessScope: "ALL" | "CLIENTS_LIST";
  clientIds?: number[];
  isIntro: boolean;
  modulesCount: number;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseRequest {
  title: string;
  shortDesc: string;
  accessScope: "ALL" | "CLIENTS_LIST";
  clientIds: number[];
}

export interface UpdateCourseRequest {
  title?: string;
  shortDesc?: string;
  accessScope?: "ALL" | "CLIENTS_LIST";
  clientIds?: number[];
}

export interface GetCoursesParams {
  limit?: number;
  page?: number;
}
