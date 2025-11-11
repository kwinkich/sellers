export type PracticeRole = "SELLER" | "BUYER" | "MODERATOR";
export type PracticeType = "WITH_CASE" | "WITHOUT_CASE" | "MINI";
export type PracticeParticipantRole = PracticeRole | "OBSERVER";
export type PracticeStatus =
  | "CREATED"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "FINISHED"
  | "CANCELLED";

export interface SkillPractices {
  id: number;
  name: string;
  code: string;
}

export interface CaseInfo {
  id: number;
  title: string;
}

export interface Practice {
  id: number;
  title: string;
  scenarioId: number;
  scenarioVersion: number;
  caseId: number | null;
  practiceType: PracticeType;
  createdByUserId: number;
  createdByRole: string;
  startAt: string;
  status: PracticeStatus;
  zoomLink: string;
  autoCancelAt: string;
  sellerUserId: number | null;
  buyerUserId: number | null;
  moderatorUserId: number | null;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface PracticeCard {
  id: number;
  practiceType: PracticeType;
  title: string;
  description: string | null;
  scenarioId: number;
  scenarioVersion: number;
  skills: SkillPractices[];
  participantsCount: number;
  startAt: string;
  endAt: string;
  status: PracticeStatus;
  freeRoles: PracticeRole[];
  myRole: PracticeParticipantRole | null;
  zoomLink: string | null;
  case: CaseInfo | null;
  resultsAvailable: boolean;
  recordingObjectId?: number | null;
  recordingUrl: string | null;
  finishedAt?: string | null;
}

export interface CreatePracticeRequest {
  scenarioId: number;
  practiceType: PracticeType;
  caseId?: number | null;
  skillIds: number[];
  startAt: string;
  initialRole?: PracticeRole;
  zoomLink?: string;
}

export interface JoinPracticeRequest {
  as: PracticeParticipantRole;
}

export interface SwitchRoleRequest {
  to: PracticeParticipantRole;
}

export interface PracticeFinishResult {
  practiceId: number;
  status: string;
}

export interface EvalAnswer {
  blockId: number;
  itemId?: number | null;
  selectedOptionId?: number | null;
  textAnswer?: string | null;
}

export interface SubmitEvalRequest {
  evaluatedUserId: number;
  answers: EvalAnswer[];
}

export interface SubmitEvalResult {
  taskStatus: "SUBMITTED";
  submissionId: number;
}

// Query params
export interface GetPracticesParams {
  limit?: number;
  page?: number;
  by?: "id" | "startAt" | "status" | "createdAt" | "updatedAt" | "finishedAt";
  order?: "asc" | "desc";
  id?: number | number[];
  title?: string;
  scenarioId?: number | number[];
  caseId?: number | number[];
  status?: string | string[];
  practiceType?: PracticeType | PracticeType[];
  createdByUserId?: number | number[];
  sellerUserId?: number | number[];
  buyerUserId?: number | number[];
  moderatorUserId?: number | number[];
}

export interface GetPracticeCardsParams {
  limit?: number;
  page?: number;
  by?: "startAt" | "createdAt" | "id" | "finishedAt";
  order?: "asc" | "desc";
}

export interface GetMyPracticesParams {
  limit?: number;
  page?: number;
  by?: "startAt" | "createdAt" | "id" | "finishedAt";
  order?: "asc" | "desc";
}

export interface GetPastPracticesParams {
  limit?: number;
  page?: number;
  by?: "startAt" | "createdAt" | "id" | "finishedAt";
  order?: "asc" | "desc";
}

export interface GetEvalFormParams {
  evaluatedUserId: number;
}

export interface RecordingPresignRequest {
  filename: string;
  contentType: string;
}

export interface RecordingPresignResponse {
  url: string;
  key: string;
  publicUrl: string;
  expiresAt: string;
}
