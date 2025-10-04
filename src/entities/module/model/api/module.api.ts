import { API, createSearchParams, type GApiResponse } from "@/shared";
import { queryOptions } from "@tanstack/react-query";
import type {
	CreateModuleRequest,
	GetModulesParams,
	Module,
	UpdateModuleRequest,
} from "../types/module.types";

export const ModulesAPI = {
	createModule: (moduleData: CreateModuleRequest) =>
		API.post("modules", { json: moduleData }).json<GApiResponse<Module>>(),

	getModules: (params?: GetModulesParams) => {
		const searchParams = createSearchParams(params);
		return API.get("modules", { searchParams }).json<
			GApiResponse<Module[], false>
		>();
	},

	getModulesByCourse: (courseId: number, params?: GetModulesParams) => {
		const searchParams = createSearchParams(params);
		return API.get(`modules/by-course/${courseId}`, { searchParams }).json<
			GApiResponse<Module[], false>
		>();
	},

	getModuleById: (id: number) =>
		API.get(`modules/${id}`).json<GApiResponse<Module>>(),

	updateModule: (id: number, moduleData: UpdateModuleRequest) =>
		API.put(`modules/${id}`, { json: moduleData }).json<GApiResponse<Module>>(),

	deleteModule: (id: number) =>
		API.delete(`modules/${id}`).json<GApiResponse<void>>(),
};

export const modulesQueryOptions = {
	list: (params?: GetModulesParams) =>
		queryOptions({
			queryKey: ["modules", "list", params],
			queryFn: () => ModulesAPI.getModules(params),
		}),

	byCourse: (courseId: number, params?: GetModulesParams) =>
		queryOptions({
			queryKey: ["modules", "by-course", courseId, params],
			queryFn: () => ModulesAPI.getModulesByCourse(courseId, params),
		}),

	byId: (id: number) =>
		queryOptions({
			queryKey: ["modules", "detail", id],
			queryFn: () => ModulesAPI.getModuleById(id),
		}),
};

export const modulesMutationOptions = {
	create: () => ({
		mutationFn: ModulesAPI.createModule,
	}),

	update: () => ({
		mutationFn: ({ id, data }: { id: number; data: UpdateModuleRequest }) =>
			ModulesAPI.updateModule(id, data),
	}),

	delete: () => ({
		mutationFn: ModulesAPI.deleteModule,
	}),
};
