export interface Skill {
  id: number;
  name: string;
  code: string | null;
}

export interface CreateSkillRequest {
  name: string;
  code?: string | null;
}

export interface UpdateSkillRequest {
  name?: string;
  code?: string | null;
}

export interface GetAllSkillsParams {
  by?: "display_order" | "id" | "name";
  order?: "asc" | "desc";
}
