import { API, createSearchParams, type GApiResponse } from "@/shared";
import { queryOptions } from "@tanstack/react-query";
import type {
  Course,
  CreateCourseRequest,
  GetCoursesParams,
  UpdateCourseRequest,
} from "../types/course.types";

export const CoursesAPI = {
  createCourse: (courseData: CreateCourseRequest) => {
    return API.post("courses", { json: courseData }).json<
      GApiResponse<Course>
    >();
  },

  getCourses: (params?: GetCoursesParams) => {
    const searchParams = createSearchParams(params);
    return API.get("courses", { searchParams }).json<
      GApiResponse<Course[], true>
    >();
  },

  getCourseById: (id: number) => {
    return API.get(`courses/${id}`).json<GApiResponse<Course>>();
  },

  updateCourse: (id: number, courseData: UpdateCourseRequest) => {
    return API.put(`courses/${id}`, { json: courseData }).json<
      GApiResponse<Course>
    >();
  },

  deleteCourse: (id: number) => {
    return API.delete(`courses/${id}`).json<GApiResponse<void>>();
  },
};

export const coursesQueryOptions = {
  list: (params?: GetCoursesParams) =>
    queryOptions({
      queryKey: ["courses", "list", params],
      queryFn: () => CoursesAPI.getCourses(params),
    }),

  byId: (id: number) =>
    queryOptions({
      queryKey: ["courses", "detail", id],
      queryFn: () => CoursesAPI.getCourseById(id),
    }),
};

export const coursesMutationOptions = {
  create: () => ({
    mutationFn: CoursesAPI.createCourse,
  }),

  update: () => ({
    mutationFn: ({ id, data }: { id: number; data: UpdateCourseRequest }) =>
      CoursesAPI.updateCourse(id, data),
  }),

  delete: () => ({
    mutationFn: CoursesAPI.deleteCourse,
  }),
};
