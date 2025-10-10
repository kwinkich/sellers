import { API, createSearchParams, type GApiResponse } from "@/shared";
import { queryOptions } from "@tanstack/react-query";
import type {
  Admin,
  AdminProfile,
  CreateAdminRequest,
  GetAdminsParams,
} from "../types/admin.types";

export const AdminsAPI = {
  createAdmin: (adminData: CreateAdminRequest) =>
    API.post("admins", { json: adminData }).json<GApiResponse<Admin>>(),

  getAdmins: (p?: GetAdminsParams) => {
    const params = createSearchParams(p);
    return API.get("admins", { searchParams: params }).json<
      GApiResponse<Admin, true>
    >();
  },

  getAdminProfile: () =>
    API.get("admins/profile").json<GApiResponse<AdminProfile>>(),

  blockAdmin: (id: number) =>
    API.post(`admins/${id}/block`, {}).json<GApiResponse<Admin>>(),
};

export const adminsQueryOptions = {
  list: (params?: GetAdminsParams) =>
    queryOptions({
      queryKey: ["admins", "list", params],
      queryFn: () => AdminsAPI.getAdmins(params),
    }),

  profile: () =>
    queryOptions({
      queryKey: ["admins", "profile"],
      queryFn: () => AdminsAPI.getAdminProfile(),
    }),
};

export const adminsMutationOptions = {
  create: () => ({
    mutationFn: AdminsAPI.createAdmin,
  }),

  block: () => ({
    mutationFn: AdminsAPI.blockAdmin,
  }),
};
