export type FormRole = "SELLER" | "BUYER" | "MODERATOR";
export type BlockType = "TEXT" | "QA" | "SCALE_SKILL_SINGLE" | "SCALE_SKILL_MULTI";

export interface ScenarioListItem {
	id: number;
	title: string;
    version: number;
	createdAt: string;
	updatedAt: string;
}

export interface ScenarioForm {
	id: number;
	role: FormRole;
	title: string;
	descr: string;
	blocksCount?: number;
	blocks?: FormBlock[];
}

export interface Scenario {
	id: number;
	title: string;
	version: number;
	createdAt: string;
	updatedAt: string;
	createdByUserId: number;
	forms: ScenarioForm[];
}

export interface FormBlockItem {
	id?: number;
	title: string;
	position: number;
	skillId: number;
}

export interface ScaleOption {
	ord: number;
	label: string;
	value: number;
	countsTowardsScore: boolean;
}

export interface Scale {
	options: ScaleOption[];
}

export interface FormBlock {
	id?: number;
	type: BlockType;
	title: string;
	helpText: string;
	required: boolean;
	position: number;
	scale: Scale;
	items: FormBlockItem[];
}

export interface ScenarioOption {
	id: number;
	title: string;
}

export interface CreateScenarioRequest {
	title: string;
	caseIds?: number[];
	forms: {
		role: FormRole;
		title: string;
		descr: string;
		blocks: FormBlock[];
	}[];
}

export interface UpdateScenarioRequest {
	title?: string;
}

export interface UpdateFormMetaRequest {
	title: string;
	descr: string;
}

export interface CreateBlockRequest {
	type: BlockType;
	title: string;
	helpText: string;
	required: boolean;
	position: number;
	scale: Scale;
	items: FormBlockItem[];
}

export interface UpdateBlockRequest {
	type?: BlockType;
	title?: string;
	helpText?: string;
	required?: boolean;
	position?: number;
	scale?: Scale;
}

export interface CreateBlockItemRequest {
	title: string;
	position: number;
	skillId: number;
}

export interface UpdateBlockItemRequest {
	title?: string;
	position?: number;
	skillId?: number;
}

export interface ReorderBlocksRequest {
	items: {
		id: number;
		position: number;
	}[];
}

export interface ReorderBlockItemsRequest {
	items: {
		id: number;
		position: number;
	}[];
}

export interface GetScenariosParams {
	limit?: number;
	page?: number;
	by?: "id" | "title" | "version" | "createdAt" | "updatedAt";
	order?: "asc" | "desc";
	title?: string;
	createdByUserId?: number;
}

export interface GetScenarioOptionsParams {
	q?: string;
	limit?: number;
}

export interface GetScenarioFormsParams {
	role?: FormRole;
}
