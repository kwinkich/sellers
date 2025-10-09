import ky, { type KyRequest, type Options } from "ky";
import { getAuthToken } from "../lib/getAuthToken";
import { showApiError } from "../lib/alert.service";

const CONFIG: Options = {
  retry: 0,
  hooks: {
    beforeRequest: [
      (request): KyRequest => {
        const accessToken = getAuthToken();
        if (accessToken) {
          request.headers.set("Authorization", `Bearer ${accessToken}`);
        }
        return request;
      },
    ],
    afterResponse: [
      async (_request, _options, response): Promise<void> => {
        if (!response.ok) {
          let data: any;
          try {
            data = await response.clone().json();
          } catch {
            data = { message: response.statusText };
          }
          // Push a global alert, then throw for callers that rely on promise rejection
          showApiError({
            status: response.status,
            message: data?.error?.message ?? data?.message,
            error: data?.error ?? data,
          });
          throw data;
        }
      },
    ],
  },
};

export const API = ky.extend({
  prefixUrl: import.meta.env.VITE_API_URL,
  credentials: "include",
  ...CONFIG,
});

export const SILENT_API = ky.extend({
  prefixUrl: import.meta.env.VITE_API_URL,
  credentials: "include",
  retry: 0,
  hooks: {
    beforeRequest: [
      (request): KyRequest => {
        const accessToken = getAuthToken();
        if (accessToken) {
          request.headers.set("Authorization", `Bearer ${accessToken}`);
        }
        return request;
      },
    ],
    afterResponse: [
      async (_request, _options, response): Promise<void> => {
        if (!response.ok) {
          let data: any;
          try {
            data = await response.clone().json();
          } catch {
            data = { message: response.statusText };
          }
          throw data;
        }
      },
    ],
  },
});

export const FILE_API = ky.extend({
  prefixUrl: import.meta.env.VITE_API_URL,
  credentials: "include",
  retry: 0,
  hooks: {
    beforeRequest: [
      (request): KyRequest => {
        const accessToken = getAuthToken();
        if (accessToken) {
          request.headers.set("Authorization", `Bearer ${accessToken}`);
        }
        return request;
      },
    ],
    afterResponse: [
      async (_request, _options, response): Promise<Response> => {
        if (!response.ok) {
          let data: any;
          try {
            data = await response.clone().json();
          } catch {
            data = { message: response.statusText };
          }
          showApiError({
            status: response.status,
            message: data?.error?.message ?? data?.message,
            error: data?.error ?? data,
          });
          throw data;
        }
        return response;
      },
    ],
  },
});
