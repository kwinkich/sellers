export interface Skill {
  id: number;
  name: string;
  code: string;
}

export interface CreateSkillRequest {
  name: string;
  code?: string | null;
}

export interface UpdateSkillRequest {
  name?: string;
  code?: string | null;
}
