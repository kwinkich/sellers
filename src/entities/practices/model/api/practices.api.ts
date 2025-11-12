import {
  API,
  SILENT_API,
  createSearchParams,
  type GApiResponse,
} from "@/shared";
import { queryOptions } from "@tanstack/react-query";
import type {
  CreatePracticeRequest,
  GetMyPracticesParams,
  GetPastPracticesParams,
  GetPracticeCardsParams,
  GetPracticesParams,
  JoinPracticeRequest,
  Practice,
  PracticeCard,
  PracticeFinishResult,
  SwitchRoleRequest,
  RecordingPresignRequest,
  RecordingPresignResponse,
} from "../types/practices.types";
import type { ScenarioForm } from "@/entities/scenarios/model/types/scenarios.types";

export const PracticesAPI = {
  createPractice: (practiceData: CreatePracticeRequest) =>
    API.post("practices", { json: practiceData }).json<
      GApiResponse<Practice>
    >(),

  getPractices: (params?: GetPracticesParams) => {
    const searchParams = createSearchParams(params);
    return API.get("practices", { searchParams }).json<
      GApiResponse<Practice, true>
    >();
  },

  getPracticeCards: (params?: GetPracticeCardsParams) => {
    const searchParams = createSearchParams(params);
    return API.get("practices/cards", { searchParams }).json<
      GApiResponse<PracticeCard, true>
    >();
  },

  getMyPractices: (params?: GetMyPracticesParams) => {
    const searchParams = createSearchParams(params);
    return API.get("practices/mine", { searchParams }).json<
      GApiResponse<PracticeCard, true>
    >();
  },

  getPastPractices: (params?: GetPastPracticesParams) => {
    const searchParams = createSearchParams(params);
    return API.get("practices/past", { searchParams }).json<
      GApiResponse<PracticeCard, true>
    >();
  },

  getPracticeById: (id: number) =>
    API.get(`practices/${id}`).json<GApiResponse<PracticeCard>>(),

  getCurrentPractice: () =>
    SILENT_API.get("practices/current").json<GApiResponse<PracticeCard>>(),

  getCurrentPracticeState: () =>
    SILENT_API.get("practices/current/state").json<
      GApiResponse<{
        practice: PracticeCard | null;
        state:
          | "OPEN_IN_PROGRESS_MODAL"
          | "OPEN_EVAL_MODAL"
          | "OPEN_VIDEO_MODAL"
          | null;
        isModalOpen: boolean;
      }>
    >(),

  joinPractice: (id: number, data: JoinPracticeRequest) =>
    API.post(`practices/${id}/join`, { json: data }).json<
      GApiResponse<PracticeCard>
    >(),

  finishPractice: (id: number) =>
    API.post(`practices/${id}/finish`).json<
      GApiResponse<PracticeFinishResult>
    >(),

  switchRole: (id: number, data: SwitchRoleRequest) =>
    API.patch(`practices/${id}/switch-role`, { json: data }).json<
      GApiResponse<PracticeCard>
    >(),

  getRecordingPresignUrl: (id: number, data: RecordingPresignRequest) =>
    API.post(`practices/${id}/recording/presign`, { json: data }).json<
      GApiResponse<RecordingPresignResponse>
    >(),

  finalizeRecording: (
    id: number,
    body: { key: string; contentType?: string }
  ) =>
    API.post(`practices/${id}/recording/finalize`, { json: body }).json<
      GApiResponse<Practice>
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

  current: () =>
    queryOptions({
      queryKey: ["practices", "current"],
      queryFn: () => PracticesAPI.getCurrentPractice(),
    }),

  currentState: () =>
    queryOptions({
      queryKey: ["practices", "current", "state"],
      queryFn: () => PracticesAPI.getCurrentPracticeState(),
    }),
};

export const practicesMutationOptions = {
  create: () => ({
    mutationFn: PracticesAPI.createPractice,
  }),

  join: () => ({
    mutationFn: ({ id, data }: { id: number; data: JoinPracticeRequest }) =>
      PracticesAPI.joinPractice(id, data),
  }),

  finish: () => ({
    mutationFn: PracticesAPI.finishPractice,
  }),

  switchRole: () => ({
    mutationFn: ({ id, data }: { id: number; data: SwitchRoleRequest }) =>
      PracticesAPI.switchRole(id, data),
  }),
};
