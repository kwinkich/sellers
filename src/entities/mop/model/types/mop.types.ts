import type { ClientLevels } from "@/entities/client";

export interface MopProfile {
  id: number;
  mopUserId: number;
  clientId: number;
  currentSlotId: number;
  repScore: number;
  level: ClientLevels;
  createdAt: string;
  updatedAt: string;
  clientUser: {
    id: number;
    telegramUsername: string;
    displayName: string;
    role: string;
  };
  mopUser: {
    id: number;
    telegramUsername: string;
    displayName: string;
    role: string;
  };
  currentSlot: {
    id: number;
    clientId: number;
    status: "NOT_ACTIVE" | "ACTIVE" | "EXPIRED";
    assignedMopUserId: number;
    durationSeconds: number;
    createdAt: string;
    updatedAt: string;
  };
  [key: string]: any;
}

export interface CreateMopProfileRequest {
  currentSlotId: number;
  name: string;
  telegramUsername: string;
  repScore: number;
  level: ClientLevels;
}

export interface GetMopProfilesParams {
  page?: number;
  limit?: number;
  by?: "userId" | "clientId" | "createdAt";
  order?: "asc" | "desc";
  userId?: number | number[];
  clientId?: number | number[];
  currentSlotId?: number | number[];
}

export interface MopProfileInfo {
  id: number;
  displayName: string;
  repScore: number;
  companyName: string;
  currentSlotId: number;
  currentSlotStatus: "NOT_ACTIVE" | "ACTIVE" | "EXPIRED";
  currentSlotExpiresAt: string;
  learningProgress?: number;
}

export interface MopSkill {
  id: number;
  name: string;
  status: "HALF" | "FULL" | "NONE";
}

export interface MopPractice {
  id: number;
  practiceType: string;
  title: string;
  startAt: string;
  endAt: string;
  status: string;
  role: "SELLER" | "BUYER" | "OBSERVER";
  repChanged: boolean;
  repDelta: number;
}

export interface GetMopProfileParams {
  page?: number;
  limit?: number;
}
