export type FormRole = "SELLER" | "BUYER" | "MODERATOR";
export type BlockType =
  | "TEXT"
  | "QA"
  | "SCALE_SKILL_SINGLE"
  | "SCALE_SKILL_MULTI";

export interface ScenarioSkill {
  id: number;
  name: string;
}

export interface ScenarioListItem {
  id: number;
  title: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  skills: ScenarioSkill[];
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

// Base block properties that all blocks have
export interface BaseFormBlock {
  id?: number;
  type: BlockType;
  title: string;
  required: boolean;
  position: number;
}

// TEXT and QA blocks only have base properties
export interface TextFormBlock extends BaseFormBlock {
  type: "TEXT" | "QA";
}

// SCALE blocks have additional properties
export interface ScaleFormBlock extends BaseFormBlock {
  type: "SCALE_SKILL_SINGLE" | "SCALE_SKILL_MULTI";
  scale: Scale;
  items: FormBlockItem[];
}

// Union type for all possible block types
export type FormBlock = TextFormBlock | ScaleFormBlock;

export interface ScenarioOption {
  id: number;
  title: string;
}

export interface CreateScenarioRequest {
  title: string;
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
  skillIds?: number[];
}
export interface GetScenarioOptionsParams {
  q?: string;
  limit?: number;
}

export interface GetScenarioFormsParams {
  role?: FormRole;
}
