import { API, createSearchParams, type GApiResponse } from "@/shared";
import { queryOptions } from "@tanstack/react-query";
import type {
  AddLicensesRequest,
  Client,
  ClientDetail,
  ClientListItem,
  ClientMop,
  ClientProfile,
  CreateClientRequest,
  GetClientsParams,
  LicenseInfo,
  UpdateClientRequest,
} from "../types/client.types";

export const ClientsAPI = {
  createClient: (clientData: CreateClientRequest) =>
    API.post("clients", { json: clientData }).json<GApiResponse<Client>>(),

  getActiveClients: (params?: GetClientsParams) => {
    const searchParams = createSearchParams(params);
    return API.get("clients/active", { searchParams }).json<
      GApiResponse<ClientListItem[], false>
    >();
  },

  getExpiredClients: (params?: GetClientsParams) => {
    const searchParams = createSearchParams(params);
    return API.get("clients/expired", { searchParams }).json<
      GApiResponse<ClientListItem[], false>
    >();
  },

  getExpiringClients: (params?: GetClientsParams & { days?: number }) => {
    const searchParams = createSearchParams(params);
    return API.get("clients/expiring", { searchParams }).json<
      GApiResponse<ClientListItem[], false>
    >();
  },

  getClientLicenses: (id: number) =>
    API.get(`clients/${id}/licenses`).json<GApiResponse<LicenseInfo[]>>(),

  addClientLicenses: (id: number, licenseData: AddLicensesRequest) =>
    API.post(`clients/${id}/licenses`, { json: licenseData }).json<
      GApiResponse<LicenseInfo[]>
    >(),

  getClientById: (id: number) =>
    API.get(`clients/${id}`).json<GApiResponse<ClientDetail>>(),

  updateClient: (id: number, clientData: UpdateClientRequest) =>
    API.put(`clients/${id}`, { json: clientData }).json<GApiResponse<Client>>(),

  getClientProfile: () =>
    API.get("clients/profile").json<GApiResponse<ClientProfile>>(),

  getClientMopProfiles: (params?: GetClientsParams) => {
    const searchParams = createSearchParams(params);
    return API.get("clients/all-mops", { searchParams }).json<
      GApiResponse<ClientMop[], false>
    >();
  },

  blockMopProfile: (id: number) =>
    API.patch(`mop-profiles/${id}/block`).json<
      GApiResponse<{
        id: number;
        telegramUsername: string;
        role: string;
        hasAccess: boolean;
      }>
    >(),
};

export const clientsQueryOptions = {
  activeList: (params?: GetClientsParams) =>
    queryOptions({
      queryKey: ["clients", "active", params],
      queryFn: () => ClientsAPI.getActiveClients(params),
    }),

  expiredList: (params?: GetClientsParams) =>
    queryOptions({
      queryKey: ["clients", "expired", params],
      queryFn: () => ClientsAPI.getExpiredClients(params),
    }),

  expiringList: (params?: GetClientsParams & { days?: number }) =>
    queryOptions({
      queryKey: ["clients", "expiring", params],
      queryFn: () => ClientsAPI.getExpiringClients(params),
    }),

  licenses: (id: number) =>
    queryOptions({
      queryKey: ["clients", "licenses", id],
      queryFn: () => ClientsAPI.getClientLicenses(id),
    }),

  byId: (id: number) =>
    queryOptions({
      queryKey: ["clients", "detail", id],
      queryFn: () => ClientsAPI.getClientById(id),
    }),

  profile: () =>
    queryOptions({
      queryKey: ["clients", "profile"],
      queryFn: () => ClientsAPI.getClientProfile(),
    }),

  mopProfiles: (params?: GetClientsParams) =>
    queryOptions({
      queryKey: ["clients", "mop-profiles", params],
      queryFn: () => ClientsAPI.getClientMopProfiles(params),
    }),
};

export const clientsMutationOptions = {
  create: () => ({
    mutationFn: ClientsAPI.createClient,
  }),

  update: () => ({
    mutationFn: ({ id, data }: { id: number; data: UpdateClientRequest }) =>
      ClientsAPI.updateClient(id, data),
  }),

  addLicenses: () => ({
    mutationFn: ({ id, data }: { id: number; data: AddLicensesRequest }) =>
      ClientsAPI.addClientLicenses(id, data),
  }),

  blockMopProfile: () => ({
    mutationFn: ClientsAPI.blockMopProfile,
  }),
};

export type CreateClientMutation = ReturnType<
  typeof clientsMutationOptions.create
>;
