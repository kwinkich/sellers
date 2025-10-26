export interface Skill {
  id: number;
  name: string;
  code: string;
}

export interface CreateSkillRequest {
  name: string;
}

export interface UpdateSkillRequest {
  name?: string;
}
