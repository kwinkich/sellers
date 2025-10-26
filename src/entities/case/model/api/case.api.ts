import { API, createSearchParams, type GApiResponse } from "@/shared";
import { queryOptions } from "@tanstack/react-query";
import type {
  Case,
  CaseListItem,
  CaseOption,
  CreateCaseRequest,
  GetCaseOptionsParams,
  GetCasesParams,
  UpdateCaseRequest,
} from "../types/case.types";

export const CasesAPI = {
  createCase: (caseData: CreateCaseRequest) =>
    API.post("cases", { json: caseData }).json<GApiResponse<Case>>(),

  getCases: (params?: GetCasesParams) => {
    const searchParams = createSearchParams(params);
    return API.get("cases", { searchParams }).json<
      GApiResponse<CaseListItem[], false>
    >();
  },

  getCaseOptions: (params?: GetCaseOptionsParams) => {
    const searchParams = createSearchParams(params);
    return API.get("cases/options", { searchParams }).json<
      GApiResponse<CaseOption[]>
    >();
  },

  getCaseById: (id: number) =>
    API.get(`cases/${id}`).json<GApiResponse<Case>>(),

  getCaseByIdIncludeDeleted: (id: number) =>
    API.get(`cases/${id}/historical`).json<GApiResponse<Case>>(),

  updateCase: (id: number, caseData: UpdateCaseRequest) =>
    API.patch(`cases/${id}`, { json: caseData }).json<GApiResponse<Case>>(),

  deleteCase: (id: number) =>
    API.delete(`cases/${id}`).json<GApiResponse<void>>(),
};

export const casesQueryOptions = {
  list: (params?: GetCasesParams) =>
    queryOptions({
      queryKey: ["cases", "list", params],
      queryFn: () => CasesAPI.getCases(params),
    }),

  options: (params?: GetCaseOptionsParams) =>
    queryOptions({
      queryKey: ["cases", "options", params],
      queryFn: () => CasesAPI.getCaseOptions(params),
    }),

  byId: (id: number) =>
    queryOptions({
      queryKey: ["cases", "detail", id],
      queryFn: () => CasesAPI.getCaseById(id),
    }),

  byIdIncludeDeleted: (id: number) =>
    queryOptions({
      queryKey: ["cases", "detail", "historical", id],
      queryFn: () => CasesAPI.getCaseByIdIncludeDeleted(id),
    }),
};

export const casesMutationOptions = {
  create: () => ({
    mutationFn: CasesAPI.createCase,
  }),

  update: () => ({
    mutationFn: ({ id, data }: { id: number; data: UpdateCaseRequest }) =>
      CasesAPI.updateCase(id, data),
  }),

  delete: () => ({
    mutationFn: CasesAPI.deleteCase,
  }),
};
