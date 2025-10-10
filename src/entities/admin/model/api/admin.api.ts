import { API, createSearchParams, type GApiResponse } from "@/shared";
import { queryOptions } from "@tanstack/react-query";
import type {
  Admin,
  AdminProfile,
  CreateAdminRequest,
  GetAdminsParams,
  ZoomStatus,
  ZoomCreateMeetingParams,
  ZoomMeeting,
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

  // Zoom integration endpoints
  zoomConnect: () =>
    API.get("admins/zoom/connect"),

  zoomCreateMeeting: (params: ZoomCreateMeetingParams) => {
    const searchParams = createSearchParams(params);
    return API.get("admins/zoom/create-meeting", { searchParams }).json<GApiResponse<ZoomMeeting>>();
  },

  zoomCallback: (code: string, state: string) => {
    const searchParams = createSearchParams({ code, state });
    return API.get("admins/zoom/callback", { searchParams }).json<GApiResponse<{ success: boolean }>>();
  },

  zoomDisconnect: () =>
    API.post("admins/zoom/disconnect", {}).json<GApiResponse<{ success: boolean }>>(),

  zoomStatus: () =>
    API.get("admins/zoom/status").json<GApiResponse<ZoomStatus>>(),
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

  zoomStatus: () =>
    queryOptions({
      queryKey: ["admins", "zoom", "status"],
      queryFn: () => AdminsAPI.zoomStatus(),
    }),
};

export const adminsMutationOptions = {
  create: () => ({
    mutationFn: AdminsAPI.createAdmin,
  }),

  block: () => ({
    mutationFn: AdminsAPI.blockAdmin,
  }),

  zoomCreateMeeting: () => ({
    mutationFn: AdminsAPI.zoomCreateMeeting,
  }),

  zoomDisconnect: () => ({
    mutationFn: AdminsAPI.zoomDisconnect,
  }),
};
