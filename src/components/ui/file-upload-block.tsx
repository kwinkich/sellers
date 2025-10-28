import { Button } from "@/components/ui/button";
import { handleFormError } from "@/shared";
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
      handleFormError(
        "Пожалуйста, выберите файл изображения",
        "Поддерживаются только изображения"
      );
      return;
    }
    if (block.type === "VIDEO" && !file.type.startsWith("video/")) {
      handleFormError(
        "Пожалуйста, выберите видео файл",
        "Поддерживаются только видео файлы"
      );
      return;
    }
    if (block.type === "FILE" && !file.type.includes("pdf")) {
      handleFormError(
        "Пожалуйста, выберите PDF файл",
        "Поддерживаются только PDF файлы"
      );
      return;
    }

    setIsUploading(true);
    setUploadStatus("idle");
    setUploadError("");

    try {
      const result = await StorageAPI.uploadFile(file);

      if (result.success && result.data) {
        // ИСПРАВЛЕНИЕ: Сохраняем ID для отправки и полный объект для отображения
        onUpdate(index, "storageObjectId", result.data.id);
        onUpdate(index, "storageObject", result.data); // Сохраняем полный объект для немедленного отображения
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

  // Проверка наличия загруженного файла
  const hasUploadedFile = Boolean(
    block?.storageObject?.id && block.storageObject.id > 0
  );

  // Получаем актуальный URL файла
  const getFileUrl = (): string | null => {
    // Используем storageObject.publicUrl если есть, иначе textContent
    return block.storageObject?.publicUrl || block.textContent || null;
  };

  // Рендер встроенного контента
  const renderEmbeddedContent = () => {
    const fileUrl = getFileUrl();
    if (!fileUrl) return null;

    switch (block.type) {
      case "IMAGE":
        return (
          <div className="mt-3">
            <img
              src={fileUrl}
              alt={block.textContent || "Загруженное изображение"}
              className="max-w-full h-auto rounded-lg mx-auto max-h-64 object-contain"
              key={fileUrl} // Добавляем key для принудительного обновления
            />
          </div>
        );

      case "VIDEO":
        return (
          <div className="mt-3">
            <video
              controls
              className="w-full max-w-full rounded-lg max-h-64"
              key={fileUrl} // Добавляем key для принудительного обновления
            >
              <source
                src={fileUrl}
                type={block.storageObject?.contentType || "video/mp4"}
              />
              Ваш браузер не поддерживает видео элементы.
            </video>
          </div>
        );

      case "FILE":
        return (
          <div className="mt-3">
            <iframe
              src={fileUrl}
              className="w-full h-64 rounded-lg border"
              title="PDF документ"
              key={fileUrl} // Добавляем key для принудительного обновления
            />
            <div className="mt-2 text-center">
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                Открыть в новой вкладке
              </a>
            </div>
          </div>
        );

      default:
        return null;
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
        {hasUploadedFile ? (
          <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
            <div className="flex items-center justify-center mb-3">
              <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
              <p className="text-sm text-gray-700 font-medium">
                {block.type === "IMAGE" && "Изображение загружено"}
                {block.type === "VIDEO" && "Видео загружено"}
                {block.type === "FILE" && "PDF документ загружен"}
              </p>
            </div>
            {renderEmbeddedContent()}
            {block.storageObject && (
              <div className="mt-3 text-xs text-gray-500 text-center">
                Размер: {Math.round(block.storageObject.sizeBytes / 1024)} KB
              </div>
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
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
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
          <div className="space-y-3">
            <div className="flex flex-col items-center">
              <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
              <p className="text-sm text-green-600">Файл успешно загружен</p>
              <p className="text-xs text-gray-500">
                ID: {block.storageObjectId}
              </p>
            </div>
            {renderEmbeddedContent()}
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
        ) : hasUploadedFile ? (
          <div className="space-y-3">
            <div className="flex flex-col items-center">
              <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
              <p className="text-sm text-green-600">Файл уже загружен</p>
              <p className="text-xs text-gray-500">
                ID: {block.storageObjectId}
              </p>
            </div>
            {renderEmbeddedContent()}
            <div className="flex gap-2 justify-center mt-3">
              <Button type="button" size="sm" onClick={handleFileSelect}>
                Заменить файл
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Загрузите {getFileTypeText()}
            </p>
            <Button type="button" size="xs" onClick={handleFileSelect}>
              Выбрать файл
            </Button>
            <p className="text-xs text-gray-500 mt-2">{getFileSizeLimit()}</p>
          </div>
        )}
      </div>
    </div>
  );
};
