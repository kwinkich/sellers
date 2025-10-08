import type { PracticeType } from "@/entities/practices";

export type FormRole = "SELLER" | "BUYER" | "MODERATOR";
export type BlockType = "TEXT" | "SCALE" | "RADIO" | "CHECKBOX" | "SELECT";

export interface ScenarioListItem {
	id: number;
	title: string;
	version: number;
	practiceType: PracticeType;
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
	practiceType: PracticeType;
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

export interface FormBlock {
	id?: number;
	type: BlockType;
	title: string;
	helpText: string;
	required: boolean;
	position: number;
	skillId: number;
	scaleId: number;
	items: FormBlockItem[];
}

export interface ScenarioOption {
	id: number;
	title: string;
}

export interface CreateScenarioRequest {
	title: string;
	practiceType: PracticeType;
	seedPresets: boolean;
	forms: {
		role: FormRole;
		title: string;
		descr: string;
		blocks: FormBlock[];
	}[];
}

export interface UpdateScenarioRequest {
	title?: string;
	practiceType?: PracticeType;
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
	skillId: number;
	scaleId: number;
	items: FormBlockItem[];
}

export interface UpdateBlockRequest {
	type?: BlockType;
	title?: string;
	helpText?: string;
	required?: boolean;
	position?: number;
	skillId?: number;
	scaleId?: number;
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
    practiceType?: PracticeType;
    title?: string;
    createdByUserId?: number;
    caseId?: number;
    skillIds?: number[];
}

export interface GetScenarioOptionsParams {
	practiceType?: PracticeType;
	q?: string;
	limit?: number;
}

export interface GetScenarioFormsParams {
	role?: FormRole;
}
