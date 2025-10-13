import { API, createSearchParams, type GApiResponse } from "@/shared";
import { queryOptions } from "@tanstack/react-query";
import type {
  CreateMopProfileRequest,
  GetMopProfileParams,
  MopPractice,
  MopProfile,
  MopProfileInfo,
  MopSkill,
} from "../types/mop.types";

export const MopProfilesAPI = {
  createMopProfile: (profileData: CreateMopProfileRequest) =>
    API.post("mop-profiles", { json: profileData }).json<
      GApiResponse<MopProfile>
    >(),

  blockMopProfile: (id: number) =>
    API.post(`mop-profiles/${id}/block`, {}).json<
      GApiResponse<{
        id: number;
        telegramUsername: string;
        role: string;
        hasAccess: boolean;
      }>
    >(),

  getMopProfileInfo: () =>
    API.get("mop-profiles/profile/info").json<GApiResponse<MopProfileInfo>>(),

  getMopProfileSkills: (params?: GetMopProfileParams) => {
    const searchParams = createSearchParams(params);
    return API.get("mop-profiles/profile/skills", { searchParams }).json<
      GApiResponse<MopSkill, true>
    >();
  },

  getMopProfilePractices: (params?: GetMopProfileParams) => {
    const searchParams = createSearchParams(params);
    return API.get("mop-profiles/profile/practices", { searchParams }).json<
      GApiResponse<MopPractice, true>
    >();
  },

  getMopProfileInfoById: (id: number) =>
    API.get(`mop-profiles/${id}/info`).json<GApiResponse<MopProfileInfo>>(),

  getMopProfileSkillsById: (id: number, params?: GetMopProfileParams) => {
    const searchParams = createSearchParams(params);
    return API.get(`mop-profiles/${id}/skills`, { searchParams }).json<
      GApiResponse<MopSkill, true>
    >();
  },

  getMopProfilePracticesById: (id: number, params?: GetMopProfileParams) => {
    const searchParams = createSearchParams(params);
    return API.get(`mop-profiles/${id}/practices`, { searchParams }).json<
      GApiResponse<MopPractice, true>
    >();
  },
};

export const mopProfilesQueryOptions = {
  profileInfo: () =>
    queryOptions({
      queryKey: ["mop-profiles", "profile", "info"],
      queryFn: () => MopProfilesAPI.getMopProfileInfo(),
    }),

  profileSkills: (params?: GetMopProfileParams) =>
    queryOptions({
      queryKey: ["mop-profiles", "profile", "skills", params],
      queryFn: () => MopProfilesAPI.getMopProfileSkills(params),
    }),

  profilePractices: (params?: GetMopProfileParams) =>
    queryOptions({
      queryKey: ["mop-profiles", "profile", "practices", params],
      queryFn: () => MopProfilesAPI.getMopProfilePractices(params),
    }),

  profileInfoById: (id: number) =>
    queryOptions({
      queryKey: ["mop-profiles", "profile", "info", id],
      queryFn: () => MopProfilesAPI.getMopProfileInfoById(id),
    }),

  profileSkillsById: (id: number, params?: GetMopProfileParams) =>
    queryOptions({
      queryKey: ["mop-profiles", "profile", "skills", id, params],
      queryFn: () => MopProfilesAPI.getMopProfileSkillsById(id, params),
    }),

  profilePracticesById: (id: number, params?: GetMopProfileParams) =>
    queryOptions({
      queryKey: ["mop-profiles", "profile", "practices", id, params],
      queryFn: () => MopProfilesAPI.getMopProfilePracticesById(id, params),
    }),
};

export const mopProfilesMutationOptions = {
  create: () => ({
    mutationFn: MopProfilesAPI.createMopProfile,
  }),

  block: () => ({
    mutationFn: MopProfilesAPI.blockMopProfile,
  }),
};
