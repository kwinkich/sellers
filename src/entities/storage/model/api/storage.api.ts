// entities/storage.api.ts
import { API, type GApiResponse } from "@/shared";
import type { StorageObject } from "../types/storage.types";

export const StorageAPI = {
	uploadFile: async (file: File) => {
		try {
			const formData = new FormData();
			formData.append("file", file);

			console.log(
				"Uploading file to backend:",
				file.name,
				file.type,
				file.size
			);

			const response = await API.post("storage-objects/upload", {
				body: formData,
				timeout: false,
			});

			// Проверяем статус ответа
			if (!response.ok) {
				const errorText = await response.text();
				console.error("Upload failed with status:", response.status, errorText);
				throw new Error(
					`Upload failed: ${response.status} ${response.statusText}`
				);
			}

			const result = (await response.json()) as GApiResponse<StorageObject>;

			if (!result.success) {
				console.error("Upload API returned error:", result);
				throw new Error("Upload failed");
			}

			console.log("Upload successful:", result.data);
			return result;
		} catch (error) {
			console.error("Upload file error:", error);
			throw error;
		}
	},

	deleteFile: (id: number) => {
		return API.delete(`storage-objects/${id}`).json<GApiResponse<void>>();
	},
};
