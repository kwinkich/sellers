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

  // getMopProfiles: (p?: GetMopProfilesParams) => {
  // 	const params = createSearchParams(p);
  // 	return API.get("mop-profiles", { searchParams: params }).json<
  // 		GApiResponse<MopProfile, true>
  // 	>();
  // },

  // getMopProfileById: (id: number) =>
  // 	API.get(`mop-profiles/${id}`).json<GApiResponse<MopProfile>>(),

  // updateMopProfile: (
  // 	id: number,
  // 	profileData: Partial<CreateMopProfileRequest>
  // ) =>
  // 	API.patch(`mop-profiles/${id}`, { json: profileData }).json<
  // 		GApiResponse<MopProfile>
  // 	>(),

  deleteMopProfile: (id: number) =>
    API.delete(`mop-profiles/${id}`).json<GApiResponse<void>>(),

  getMopProfileInfo: () =>
    API.get("mop-profiles/profile/info").json<GApiResponse<MopProfileInfo>>(),

  getMopProfileSkills: (params?: GetMopProfileParams) => {
    const searchParams = createSearchParams(params);
    return API.get("mop-profiles/profile/skills", { searchParams }).json<
      GApiResponse<MopSkill[], false>
    >();
  },

  getMopProfilePractices: (params?: GetMopProfileParams) => {
    const searchParams = createSearchParams(params);
    return API.get("mop-profiles/profile/practices", { searchParams }).json<
      GApiResponse<MopPractice[], false>
    >();
  },

  getMopProfileInfoById: (id: number) =>
    API.get(`mop-profiles/${id}/info`).json<GApiResponse<MopProfileInfo>>(),

  getMopProfileSkillsById: (id: number, params?: GetMopProfileParams) => {
    const searchParams = createSearchParams(params);
    return API.get(`mop-profiles/${id}/skills`, { searchParams }).json<
      GApiResponse<MopSkill[], false>
    >();
  },

  getMopProfilePracticesById: (id: number, params?: GetMopProfileParams) => {
    const searchParams = createSearchParams(params);
    return API.get(`mop-profiles/${id}/practices`, { searchParams }).json<
      GApiResponse<MopPractice[], false>
    >();
  },
};

export const mopProfilesQueryOptions = {
  // list: (params?: GetMopProfilesParams) =>
  // 	queryOptions({
  // 		queryKey: ["mop-profiles", "list", params],
  // 		queryFn: () => MopProfilesAPI.getMopProfiles(params),
  // 	}),

  // byId: (id: number) =>
  // 	queryOptions({
  // 		queryKey: ["mop-profiles", "detail", id],
  // 		queryFn: () => MopProfilesAPI.getMopProfileById(id),
  // 	}),

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

  // update: () => ({
  // 	mutationFn: ({
  // 		id,
  // 		data,
  // 	}: {
  // 		id: number;
  // 		data: Partial<CreateMopProfileRequest>;
  // 	}) => MopProfilesAPI.updateMopProfile(id, data),
  // }),

  delete: () => ({
    mutationFn: MopProfilesAPI.deleteMopProfile,
  }),
};
