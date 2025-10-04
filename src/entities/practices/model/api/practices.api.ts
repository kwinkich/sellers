import { API, createSearchParams, type GApiResponse } from "@/shared";
import { queryOptions } from "@tanstack/react-query";
import type {
	ClaimRoleRequest,
	CreatePracticeRequest,
	GetMyPracticesParams,
	GetPastPracticesParams,
	GetPracticeCardsParams,
	GetPracticesParams,
	Practice,
	PracticeCard,
	PracticeFinishResult,
} from "../types/practices.types";

export const PracticesAPI = {
	createPractice: (practiceData: CreatePracticeRequest) =>
		API.post("practices", { json: practiceData }).json<
			GApiResponse<Practice>
		>(),

	getPractices: (params?: GetPracticesParams) => {
		const searchParams = createSearchParams(params);
		return API.get("practices", { searchParams }).json<
			GApiResponse<Practice[], false>
		>();
	},

	getPracticeCards: (params?: GetPracticeCardsParams) => {
		const searchParams = createSearchParams(params);
		return API.get("practices/cards", { searchParams }).json<
			GApiResponse<PracticeCard[], false>
		>();
	},

	getMyPractices: (params?: GetMyPracticesParams) => {
		const searchParams = createSearchParams(params);
		return API.get("practices/mine", { searchParams }).json<
			GApiResponse<PracticeCard[], false>
		>();
	},

	getPastPractices: (params?: GetPastPracticesParams) => {
		const searchParams = createSearchParams(params);
		return API.get("practices/past", { searchParams }).json<
			GApiResponse<PracticeCard[], false>
		>();
	},

	getPracticeById: (id: number) =>
		API.get(`practices/${id}`).json<GApiResponse<PracticeCard>>(),

	claimRole: (id: number, roleData: ClaimRoleRequest) =>
		API.post(`practices/${id}/claim-role`, { json: roleData }).json<
			GApiResponse<PracticeCard>
		>(),

	finishPractice: (id: number) =>
		API.post(`practices/${id}/finish`).json<
			GApiResponse<PracticeFinishResult>
		>(),
};

export const practicesQueryOptions = {
	list: (params?: GetPracticesParams) =>
		queryOptions({
			queryKey: ["practices", "list", params],
			queryFn: () => PracticesAPI.getPractices(params),
		}),

	cards: (params?: GetPracticeCardsParams) =>
		queryOptions({
			queryKey: ["practices", "cards", params],
			queryFn: () => PracticesAPI.getPracticeCards(params),
		}),

	mine: (params?: GetMyPracticesParams) =>
		queryOptions({
			queryKey: ["practices", "mine", params],
			queryFn: () => PracticesAPI.getMyPractices(params),
		}),

	past: (params?: GetPastPracticesParams) =>
		queryOptions({
			queryKey: ["practices", "past", params],
			queryFn: () => PracticesAPI.getPastPractices(params),
		}),

	byId: (id: number) =>
		queryOptions({
			queryKey: ["practices", "detail", id],
			queryFn: () => PracticesAPI.getPracticeById(id),
		}),
};

export const practicesMutationOptions = {
	create: () => ({
		mutationFn: PracticesAPI.createPractice,
	}),

	claimRole: () => ({
		mutationFn: ({ id, data }: { id: number; data: ClaimRoleRequest }) =>
			PracticesAPI.claimRole(id, data),
	}),

	finish: () => ({
		mutationFn: PracticesAPI.finishPractice,
	}),
};
