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
    by,
    order,
  }: {
    page?: number;
    limit?: number;
    by?: "display_order" | "id" | "name";
    order?: "asc" | "desc";
  } = {}) => {
    const searchParams: Record<string, string> = {
      page: String(page),
      limit: String(limit),
    };
    if (by) searchParams.by = by;
    if (order) searchParams.order = order;

    return API.get("skills", {
      searchParams,
    }).json<GApiResponse<Skill, true>>();
  },

  getSkillsPaged: (
    {
      page,
      limit,
      code,
      name,
      id,
      by,
      order,
    }: {
      page: number;
      limit: number;
      code?: string;
      name?: string;
      id?: number | number[];
      by?: "display_order" | "id" | "name";
      order?: "asc" | "desc";
    } = { page: 1, limit: 30 }
  ) => {
    const sp = new URLSearchParams();
    sp.set("page", String(page));
    sp.set("limit", String(limit));
    if (code) sp.set("code", code);
    if (name) sp.set("name", name);
    if (typeof id === "number") {
      sp.append("id", String(id));
    } else if (Array.isArray(id)) {
      for (const v of id) sp.append("id", String(v));
    }
    if (by) sp.set("by", by);
    if (order) sp.set("order", order);

    return API.get("skills", {
      searchParams: sp,
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
  list: ({
    page = 1,
    limit = 30,
    by,
    order,
  }: {
    page?: number;
    limit?: number;
    by?: "display_order" | "id" | "name";
    order?: "asc" | "desc";
  } = {}) =>
    queryOptions({
      queryKey: ["skills", "list", { page, limit, by, order }],
      queryFn: () => SkillsAPI.getSkills({ page, limit, by, order }),
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
