import { API, createSearchParams, type GApiResponse } from "@/shared";
import { queryOptions } from "@tanstack/react-query";
import type {
	CreateBlockItemRequest,
	CreateBlockRequest,
	CreateScenarioRequest,
	FormBlock,
	FormBlockItem,
	GetScenarioFormsParams,
	GetScenarioOptionsParams,
	GetScenariosParams,
	ReorderBlockItemsRequest,
	ReorderBlocksRequest,
	Scenario,
	ScenarioForm,
	ScenarioListItem,
	ScenarioOption,
	UpdateBlockItemRequest,
	UpdateBlockRequest,
	UpdateFormMetaRequest,
	UpdateScenarioRequest,
} from "../types/scenarios.types";

export const ScenariosAPI = {
	// Основные методы сценариев
	createScenario: (scenarioData: CreateScenarioRequest) =>
		API.post("scenarios", { json: scenarioData }).json<
			GApiResponse<Scenario>
		>(),

	getScenarios: (params?: GetScenariosParams) => {
		const searchParams = createSearchParams(params);
		return API.get("scenarios", { searchParams }).json<
			GApiResponse<ScenarioListItem[], false>
		>();
	},

	getScenarioOptions: (params?: GetScenarioOptionsParams) => {
		const searchParams = createSearchParams(params);
		return API.get("scenarios/options", { searchParams }).json<
			GApiResponse<ScenarioOption[]>
		>();
	},

	getScenarioById: (id: number, includeForms?: boolean) => {
		const searchParams = createSearchParams({ includeForms });
		return API.get(`scenarios/${id}`, { searchParams }).json<
			GApiResponse<Scenario>
		>();
	},

	updateScenario: (id: number, scenarioData: UpdateScenarioRequest) =>
		API.patch(`scenarios/${id}`, { json: scenarioData }).json<
			GApiResponse<Scenario>
		>(),

	deleteScenario: (id: number) =>
		API.delete(`scenarios/${id}`).json<GApiResponse<void>>(),

	// Методы для форм
	getScenarioForms: (id: number, params?: GetScenarioFormsParams) => {
		const searchParams = createSearchParams(params);
		return API.get(`scenarios/${id}/forms`, { searchParams }).json<
			GApiResponse<ScenarioForm[]>
		>();
	},

	updateFormMeta: (id: number, role: string, formData: UpdateFormMetaRequest) =>
		API.patch(`scenarios/${id}/forms/${role}`, { json: formData }).json<
			GApiResponse<ScenarioForm>
		>(),

	// Методы для блоков форм
	createBlock: (id: number, role: string, blockData: CreateBlockRequest) =>
		API.post(`scenarios/${id}/forms/${role}/blocks`, { json: blockData }).json<
			GApiResponse<FormBlock>
		>(),

	updateBlock: (
		id: number,
		role: string,
		blockId: number,
		blockData: UpdateBlockRequest
	) =>
		API.patch(`scenarios/${id}/forms/${role}/blocks/${blockId}`, {
			json: blockData,
		}).json<GApiResponse<FormBlock>>(),

	deleteBlock: (id: number, role: string, blockId: number) =>
		API.delete(`scenarios/${id}/forms/${role}/blocks/${blockId}`).json<
			GApiResponse<void>
		>(),

	reorderBlocks: (
		id: number,
		role: string,
		reorderData: ReorderBlocksRequest
	) =>
		API.put(`scenarios/${id}/forms/${role}/blocks/reorder`, {
			json: reorderData,
		}).json<GApiResponse<FormBlock[]>>(),

	// Методы для подпунктов блоков
	createBlockItem: (
		id: number,
		role: string,
		blockId: number,
		itemData: CreateBlockItemRequest
	) =>
		API.post(`scenarios/${id}/forms/${role}/blocks/${blockId}/items`, {
			json: itemData,
		}).json<GApiResponse<FormBlockItem>>(),

	updateBlockItem: (
		id: number,
		role: string,
		blockId: number,
		itemId: number,
		itemData: UpdateBlockItemRequest
	) =>
		API.patch(
			`scenarios/${id}/forms/${role}/blocks/${blockId}/items/${itemId}`,
			{
				json: itemData,
			}
		).json<GApiResponse<FormBlockItem>>(),

	deleteBlockItem: (
		id: number,
		role: string,
		blockId: number,
		itemId: number
	) =>
		API.delete(
			`scenarios/${id}/forms/${role}/blocks/${blockId}/items/${itemId}`
		).json<GApiResponse<void>>(),

	reorderBlockItems: (
		id: number,
		role: string,
		blockId: number,
		reorderData: ReorderBlockItemsRequest
	) =>
		API.put(`scenarios/${id}/forms/${role}/blocks/${blockId}/items/reorder`, {
			json: reorderData,
		}).json<GApiResponse<FormBlockItem[]>>(),
};

export const scenariosQueryOptions = {
	list: (params?: GetScenariosParams) =>
		queryOptions({
			queryKey: ["scenarios", "list", params],
			queryFn: () => ScenariosAPI.getScenarios(params),
		}),

	options: (params?: GetScenarioOptionsParams) =>
		queryOptions({
			queryKey: ["scenarios", "options", params],
			queryFn: () => ScenariosAPI.getScenarioOptions(params),
		}),

	byId: (id: number, includeForms?: boolean) =>
		queryOptions({
			queryKey: ["scenarios", "detail", id, { includeForms }],
			queryFn: () => ScenariosAPI.getScenarioById(id, includeForms),
		}),

	forms: (id: number, params?: GetScenarioFormsParams) =>
		queryOptions({
			queryKey: ["scenarios", "forms", id, params],
			queryFn: () => ScenariosAPI.getScenarioForms(id, params),
		}),
};

export const scenariosMutationOptions = {
	create: () => ({
		mutationFn: ScenariosAPI.createScenario,
	}),

	update: () => ({
		mutationFn: ({ id, data }: { id: number; data: UpdateScenarioRequest }) =>
			ScenariosAPI.updateScenario(id, data),
	}),

	delete: () => ({
		mutationFn: ScenariosAPI.deleteScenario,
	}),

	updateFormMeta: () => ({
		mutationFn: ({
			id,
			role,
			data,
		}: {
			id: number;
			role: string;
			data: UpdateFormMetaRequest;
		}) => ScenariosAPI.updateFormMeta(id, role, data),
	}),

	createBlock: () => ({
		mutationFn: ({
			id,
			role,
			data,
		}: {
			id: number;
			role: string;
			data: CreateBlockRequest;
		}) => ScenariosAPI.createBlock(id, role, data),
	}),

	updateBlock: () => ({
		mutationFn: ({
			id,
			role,
			blockId,
			data,
		}: {
			id: number;
			role: string;
			blockId: number;
			data: UpdateBlockRequest;
		}) => ScenariosAPI.updateBlock(id, role, blockId, data),
	}),

	deleteBlock: () => ({
		mutationFn: ({
			id,
			role,
			blockId,
		}: {
			id: number;
			role: string;
			blockId: number;
		}) => ScenariosAPI.deleteBlock(id, role, blockId),
	}),

	reorderBlocks: () => ({
		mutationFn: ({
			id,
			role,
			data,
		}: {
			id: number;
			role: string;
			data: ReorderBlocksRequest;
		}) => ScenariosAPI.reorderBlocks(id, role, data),
	}),

	createBlockItem: () => ({
		mutationFn: ({
			id,
			role,
			blockId,
			data,
		}: {
			id: number;
			role: string;
			blockId: number;
			data: CreateBlockItemRequest;
		}) => ScenariosAPI.createBlockItem(id, role, blockId, data),
	}),

	updateBlockItem: () => ({
		mutationFn: ({
			id,
			role,
			blockId,
			itemId,
			data,
		}: {
			id: number;
			role: string;
			blockId: number;
			itemId: number;
			data: UpdateBlockItemRequest;
		}) => ScenariosAPI.updateBlockItem(id, role, blockId, itemId, data),
	}),

	deleteBlockItem: () => ({
		mutationFn: ({
			id,
			role,
			blockId,
			itemId,
		}: {
			id: number;
			role: string;
			blockId: number;
			itemId: number;
		}) => ScenariosAPI.deleteBlockItem(id, role, blockId, itemId),
	}),

	reorderBlockItems: () => ({
		mutationFn: ({
			id,
			role,
			blockId,
			data,
		}: {
			id: number;
			role: string;
			blockId: number;
			data: ReorderBlockItemsRequest;
		}) => ScenariosAPI.reorderBlockItems(id, role, blockId, data),
	}),
};
