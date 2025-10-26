import { API, createSearchParams, type GApiResponse } from "@/shared";
import { queryOptions } from "@tanstack/react-query";
import type {
  CreateLessonRequest,
  GetLessonsParams,
  Lesson,
  UpdateLessonRequest,
} from "../types/lesson.types";

export const LessonsAPI = {
  createLesson: (lessonData: CreateLessonRequest) => {
    return API.post("lessons", { json: lessonData }).json<
      GApiResponse<Lesson>
    >();
  },

  getLessons: (params?: GetLessonsParams) => {
    const searchParams = createSearchParams(params);
    return API.get("lessons", { searchParams }).json<
      GApiResponse<Lesson[], true>
    >();
  },

  getLessonsByModule: (moduleId: number, params?: GetLessonsParams) => {
    const searchParams = createSearchParams(params);
    return API.get(`lessons/by-module/${moduleId}`, { searchParams }).json<
      GApiResponse<Lesson[], true>
    >();
  },

  getLessonById: (id: number) => {
    return API.get(`lessons/${id}`).json<GApiResponse<Lesson>>();
  },

  updateLesson: (id: number, lessonData: UpdateLessonRequest) => {
    return API.put(`lessons/${id}`, { json: lessonData }).json<
      GApiResponse<Lesson>
    >();
  },

  deleteLesson: (id: number) => {
    return API.delete(`lessons/${id}`).json<GApiResponse<void>>();
  },
};

export const lessonsQueryOptions = {
  list: (params?: GetLessonsParams) =>
    queryOptions({
      queryKey: ["lessons", "list", params],
      queryFn: () => LessonsAPI.getLessons(params),
    }),

  byModule: (moduleId: number, params?: GetLessonsParams) =>
    queryOptions({
      queryKey: ["lessons", "by-module", moduleId, params],
      queryFn: () => LessonsAPI.getLessonsByModule(moduleId, params),
    }),

  byId: (id: number) =>
    queryOptions({
      queryKey: ["lessons", "detail", id],
      queryFn: () => LessonsAPI.getLessonById(id),
    }),
};

export const lessonsMutationOptions = {
  create: () => ({
    mutationFn: LessonsAPI.createLesson,
  }),

  update: () => ({
    mutationFn: ({ id, data }: { id: number; data: UpdateLessonRequest }) =>
      LessonsAPI.updateLesson(id, data),
  }),

  delete: () => ({
    mutationFn: LessonsAPI.deleteLesson,
  }),
};
