import { Button } from "@/components/ui/button";
import InputFloatingLabel from "@/components/ui/inputFloating";
import { StorageAPI, type ContentBlock } from "@/entities";

import { AlertCircle, CheckCircle, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";

interface FileUploadBlockProps {
	block: ContentBlock;
	index: number;
	onUpdate: (index: number, field: string, value: unknown) => void;
	onRemove?: (index: number) => void;
	isEditing?: boolean;
}

export const FileUploadBlock = ({
	block,
	index,
	onUpdate,
	isEditing = true,
}: FileUploadBlockProps) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadStatus, setUploadStatus] = useState<
		"idle" | "success" | "error"
	>("idle");
	const [uploadError, setUploadError] = useState<string>("");

	const handleFileSelect = (): void => {
		fileInputRef.current?.click();
	};

	const handleFileChange = async (
		e: React.ChangeEvent<HTMLInputElement>
	): Promise<void> => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Валидация типа файла
		if (block.type === "IMAGE" && !file.type.startsWith("image/")) {
			alert("Пожалуйста, выберите файл изображения");
			return;
		}
		if (block.type === "VIDEO" && !file.type.startsWith("video/")) {
			alert("Пожалуйста, выберите видео файл");
			return;
		}
		if (block.type === "FILE" && !file.type.includes("pdf")) {
			alert("Пожалуйста, выберите PDF файл");
			return;
		}

		setIsUploading(true);
		setUploadStatus("idle");
		setUploadError("");

		try {
			const result = await StorageAPI.uploadFile(file);

			if (result.success && result.data) {
				onUpdate(index, "storageObjectId", result.data.id);
				onUpdate(index, "textContent", result.data.publicUrl);
				setUploadStatus("success");
			} else {
				throw new Error("Не удалось загрузить файл");
			}
		} catch (error) {
			console.error("Error uploading file:", error);
			setUploadStatus("error");
			setUploadError(
				error instanceof Error ? error.message : "Неизвестная ошибка"
			);
		} finally {
			setIsUploading(false);
		}
	};

	const getFileTypeText = (): string => {
		switch (block.type) {
			case "IMAGE":
				return "изображение";
			case "VIDEO":
				return "видео";
			case "FILE":
				return "PDF документ";
			default:
				return "файл";
		}
	};

	const getAcceptTypes = (): string => {
		switch (block.type) {
			case "IMAGE":
				return "image/*";
			case "VIDEO":
				return "video/*";
			case "FILE":
				return ".pdf";
			default:
				return "*";
		}
	};

	const getFileSizeLimit = (): string => {
		switch (block.type) {
			case "IMAGE":
				return "JPG, PNG, GIF до 10MB";
			case "VIDEO":
				return "MP4, AVI до 100MB";
			case "FILE":
				return "PDF до 50MB";
			default:
				return "";
		}
	};

	const handleViewFile = (): void => {
		if (block.textContent) {
			window.open(block.textContent, "_blank");
		}
	};

	// Режим просмотра
	if (!isEditing) {
		return (
			<div className="space-y-3 w-full">
				{block.textContent && (
					<div className="text-sm text-gray-600">
						<a
							href={block.textContent}
							target="_blank"
							rel="noopener noreferrer"
							className="text-blue-600 hover:underline"
						>
							{block.textContent}
						</a>
					</div>
				)}
				{block.storageObjectId > 0 ? (
					<div className="border-2 border-gray-200 rounded-xl p-4 text-center bg-gray-50">
						<CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
						<p className="text-sm text-gray-700">Файл загружен</p>
						{block.textContent && (
							<Button
								type="button"
								size="sm"
								className="mt-2"
								onClick={handleViewFile}
							>
								Просмотреть файл
							</Button>
						)}
					</div>
				) : (
					<div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
						<AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
						<p className="text-sm text-gray-500">Файл не загружен</p>
					</div>
				)}
			</div>
		);
	}

	// Режим редактирования
	return (
		<div className="space-y-3 w-full">
			{/* Ссылка на файл */}
			<InputFloatingLabel
				type="text"
				value={block.textContent || ""}
				onChange={(e) => onUpdate(index, "textContent", e.target.value)}
				placeholder={`Введите ссылку на ${getFileTypeText()}`}
				className="w-full bg-white"
			/>

			<div className="text-center text-xs text-gray-500">или</div>

			{/* Загрузка файла */}
			<div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
				<input
					type="file"
					ref={fileInputRef}
					onChange={handleFileChange}
					accept={getAcceptTypes()}
					className="hidden"
				/>

				{isUploading ? (
					<div className="flex flex-col items-center">
						<Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
						<p className="text-sm text-gray-600">Загрузка файла...</p>
					</div>
				) : uploadStatus === "success" ? (
					<div className="flex flex-col items-center">
						<CheckCircle className="h-8 w-8 text-green-500 mb-2" />
						<p className="text-sm text-green-600">Файл успешно загружен</p>
						<p className="text-xs text-gray-500 mt-1">
							ID: {block.storageObjectId}
						</p>
						{block.textContent && (
							<a
								href={block.textContent}
								target="_blank"
								rel="noopener noreferrer"
								className="text-xs text-blue-600 hover:underline mt-1"
							>
								Просмотреть
							</a>
						)}
					</div>
				) : uploadStatus === "error" ? (
					<div className="flex flex-col items-center">
						<AlertCircle className="h-8 w-8 text-red-500 mb-2" />
						<p className="text-sm text-red-600">Ошибка загрузки</p>
						{uploadError && (
							<p className="text-xs text-red-500 mt-1">{uploadError}</p>
						)}
						<Button
							type="button"
							size="sm"
							onClick={handleFileSelect}
							className="mt-2"
						>
							Попробовать снова
						</Button>
					</div>
				) : block.storageObjectId > 0 ? (
					<div className="flex flex-col items-center">
						<CheckCircle className="h-8 w-8 text-green-500 mb-2" />
						<p className="text-sm text-green-600">Файл уже загружен</p>
						<p className="text-xs text-gray-500 mt-1">
							ID: {block.storageObjectId}
						</p>
						<div className="flex gap-2 mt-2">
							<Button type="button" size="sm" onClick={handleFileSelect}>
								Заменить файл
							</Button>
							{block.textContent && (
								<Button type="button" size="sm" onClick={handleViewFile}>
									Просмотр
								</Button>
							)}
						</div>
					</div>
				) : (
					<>
						<Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
						<p className="text-sm text-gray-600 mb-2">
							Загрузите {getFileTypeText()}
						</p>
						<Button type="button" size="sm" onClick={handleFileSelect}>
							Выбрать файл
						</Button>
						<p className="text-xs text-gray-500 mt-2">{getFileSizeLimit()}</p>
					</>
				)}
			</div>
		</div>
	);
};
