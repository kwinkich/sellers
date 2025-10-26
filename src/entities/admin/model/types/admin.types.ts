export interface Admin {
  id: number;
  telegramUsername: string;
  displayName: string;
  role: "ADMIN";
  createdAt: string;
  updatedAt: string;
}

export interface AdminProfile {
  id: number;
  telegramUsername: string;
  role: "ADMIN";
  activeClientsTotal: number;
  scheduledPracticesTotal: number;
  casesTotal: number;
  scenariosTotal: number;
}

export interface CreateAdminRequest {
  telegramUsername: string;
}

export interface GetAdminsParams {
  page?: number;
  limit?: number;
  by?: "telegramUsername" | "createdAt";
  order?: "asc" | "desc";
  telegramUsername?: string | string[];
}

// Zoom-related types
export interface ZoomStatus {
  connected: boolean;
  expiresAt: string | null;
}

export interface ZoomCreateMeetingParams {
  topic?: string;
  start_time: string;
  duration?: number;
  timezone?: string;
}

export interface ZoomMeeting {
  id: string;
  join_url: string;
  start_url: string;
  topic: string;
  start_time: string;
  duration: number;
  timezone: string;
  created_at: string;
}

export interface ZoomTokenInfo {
  expires_in: number;
  scope: string;
}

export interface ZoomCreateMeetingResponse {
  meeting: ZoomMeeting;
  token_info: ZoomTokenInfo;
}

export interface ZoomConnectResponse {
  authUrl: string;
}
