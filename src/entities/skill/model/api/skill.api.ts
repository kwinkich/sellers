import { API, type GApiResponse } from "@/shared";
import { queryOptions } from "@tanstack/react-query";
import type {
  CreateSkillRequest,
  Skill,
  UpdateSkillRequest,
} from "../types/skill.types";

export const SkillsAPI = {
  createSkill: (skillData: CreateSkillRequest) =>
    API.post("skills", { json: skillData }).json<GApiResponse<Skill>>(),

  getSkills: () => API.get("skills").json<GApiResponse<Skill[]>>(),

  getSkillsPaged: ({ page, limit }: { page: number; limit: number }) =>
    API.get("skills", {
      searchParams: { page: String(page), limit: String(limit) },
    }).json<GApiResponse<Skill[], true>>(),

  getSkillById: (id: number) =>
    API.get(`skills/${id}`).json<GApiResponse<Skill>>(),

  updateSkill: (id: number, skillData: UpdateSkillRequest) =>
    API.put(`skills/${id}`, { json: skillData }).json<GApiResponse<Skill>>(),

  deleteSkill: (id: number) =>
    API.delete(`skills/${id}`).json<GApiResponse<void>>(),
};

export const skillsQueryOptions = {
  list: () =>
    queryOptions({
      queryKey: ["skills", "list"],
      queryFn: () => SkillsAPI.getSkills(),
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
