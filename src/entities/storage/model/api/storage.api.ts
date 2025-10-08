import { API, type GApiResponse } from "@/shared";
import type { StorageObject } from "../types/storage.types";

export const StorageAPI = {
	uploadFile: (file: File) => {
		const formData = new FormData();
		formData.append("file", file);

		return API.post("storage-objects/upload", {
			body: formData,
		}).json<GApiResponse<StorageObject>>();
	},

	deleteFile: (id: number) => {
		return API.delete(`storage-objects/${id}`).json<GApiResponse<void>>();
	},
};
