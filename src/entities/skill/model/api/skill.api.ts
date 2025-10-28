import { API, type GApiResponse } from "@/shared";
import { queryOptions } from "@tanstack/react-query";
import type {
  CreateSkillRequest,
  Skill,
  UpdateSkillRequest,
  GetAllSkillsParams,
} from "../types/skill.types";

export const SkillsAPI = {
  createSkill: (skillData: CreateSkillRequest) =>
    API.post("skills", { json: skillData }).json<GApiResponse<Skill>>(),

  // Unpaginated list is removed in favor of consistent paginated schema
  getSkills: ({
    page = 1,
    limit = 30,
  }: { page?: number; limit?: number } = {}) =>
    API.get("skills", {
      searchParams: {
        page: String(page),
        limit: String(limit),
      },
    }).json<GApiResponse<Skill, true>>(),

  getSkillsPaged: (
    {
      page,
      limit,
      code,
      name,
      id,
    }: {
      page: number;
      limit: number;
      code?: string;
      name?: string;
      id?: number | number[];
    } = { page: 1, limit: 30 }
  ) => {
    const searchParams: Record<string, string> = {
      page: String(page),
      limit: String(limit),
    };

    if (code) searchParams.code = code;
    if (name) searchParams.name = name;
    if (id) {
      if (Array.isArray(id)) {
        searchParams.id = id.join(",");
      } else {
        searchParams.id = String(id);
      }
    }

    return API.get("skills", {
      searchParams,
    }).json<GApiResponse<Skill, true>>();
  },

  getSkillById: (id: number) =>
    API.get(`skills/${id}`).json<GApiResponse<Skill>>(),

  updateSkill: (id: number, skillData: UpdateSkillRequest) =>
    API.put(`skills/${id}`, { json: skillData }).json<GApiResponse<Skill>>(),

  deleteSkill: (id: number) =>
    API.delete(`skills/${id}`).json<GApiResponse<void>>(),

  getSkillsByCodes: (codes: string[]) => {
    const codesString = codes.join(",");
    return API.get(`skills/by-codes`, {
      searchParams: { codes: codesString },
    }).json<GApiResponse<Skill>>();
  },

  getAllSkills: (params?: GetAllSkillsParams) => {
    const searchParams: Record<string, string> = {};

    if (params?.by) searchParams.by = params.by;
    if (params?.order) searchParams.order = params.order;

    return API.get("skills/all", {
      searchParams,
    }).json<GApiResponse<Skill[]>>();
  },
};

export const skillsQueryOptions = {
  list: ({ page = 1, limit = 30 }: { page?: number; limit?: number } = {}) =>
    queryOptions({
      queryKey: ["skills", "list", { page, limit }],
      queryFn: () => SkillsAPI.getSkills({ page, limit }),
    }),

  infinite: ({ limit = 50 }: { limit?: number } = {}) =>
    queryOptions({
      queryKey: ["skills", "list", { limit }],
      // placeholder to guide useInfiniteQuery; the actual queryFn will be provided in component
      queryFn: () => SkillsAPI.getSkillsPaged({ page: 1, limit }),
    }),

  byId: (id: number) =>
    queryOptions({
      queryKey: ["skills", "detail", id],
      queryFn: () => SkillsAPI.getSkillById(id),
    }),

  all: (params?: GetAllSkillsParams) =>
    queryOptions({
      queryKey: ["skills", "all", params],
      queryFn: () => SkillsAPI.getAllSkills(params),
    }),
};

export const skillsMutationOptions = {
  create: () => ({
    mutationFn: SkillsAPI.createSkill,
  }),

  update: () => ({
    mutationFn: ({ id, data }: { id: number; data: UpdateSkillRequest }) =>
      SkillsAPI.updateSkill(id, data),
  }),

  delete: () => ({
    mutationFn: SkillsAPI.deleteSkill,
  }),
};
