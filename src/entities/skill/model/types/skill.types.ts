export interface Skill {
	id: number;
	name: string;
}

export interface CreateSkillRequest {
	name: string;
}

export interface UpdateSkillRequest {
	name?: string;
}
