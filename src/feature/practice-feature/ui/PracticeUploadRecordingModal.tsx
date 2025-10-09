import { BlockingModal } from "@/components/ui/blocking-modal";
import { useUploadRecordingStore } from "../model/uploadRecording.store";
import { useState, useRef } from "react";
import { Trophy, Loader2, Upload } from "lucide-react";
import { PracticesAPI } from "@/entities/practices/model/api/practices.api";
import { toast } from "sonner";

export const PracticeUploadRecordingModal = () => {
  const { isOpen, practiceId, hide } = useUploadRecordingStore();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!practiceId) return null;

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/") && !file.type.startsWith("audio/")) {
      toast.error("Пожалуйста, выберите видео или аудио файл");
      return;
    }

    setIsUploading(true);
    try {
      const presignResult = await PracticesAPI.getRecordingPresignUrl(practiceId, {
        filename: file.name,
        contentType: file.type,
      });

      if (!presignResult.success || !presignResult.data) {
        throw new Error("Не удалось получить URL для загрузки");
      }

      const { url, publicUrl } = presignResult.data;

      const uploadResponse = await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Не удалось загрузить файл на сервер");
      }

      await PracticesAPI.finalizeRecording(practiceId);

      setUploadedUrl(publicUrl);
      toast.success("Запись встречи успешно загружена");
      setTimeout(() => {
        hide();
        setUploadedUrl(null);
      }, 1000);
    } catch (error) {
      console.error("Error uploading recording:", error);
      toast.error(error instanceof Error ? error.message : "Ошибка загрузки");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      hide();
      setUploadedUrl(null);
    }
  };

  return (
    <BlockingModal open={isOpen} onClose={handleClose}>
      <div className="flex flex-col items-center text-center py-6">
        <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mb-4">
          <Trophy size={32} className="text-teal-600" />
        </div>

        <h2 className="text-xl font-semibold mb-2">Игра закончена!</h2>
        <p className="text-sm text-gray-600 mb-6">
          Загрузите запись встречи
        </p>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="video/*,audio/*"
          className="hidden"
        />

        {isUploading ? (
          <div className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600 mb-2" />
            <p className="text-sm text-gray-600">Загрузка файла...</p>
          </div>
        ) : uploadedUrl ? (
          <div className="w-full border-2 border-teal-500 bg-teal-50 rounded-xl p-8 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-teal-700 font-medium">Файл успешно загружен</p>
          </div>
        ) : (
          <button
            onClick={handleFileSelect}
            className="w-full border-2 border-dashed border-teal-500 bg-teal-50 rounded-xl p-8 flex flex-col items-center justify-center hover:border-teal-600 hover:bg-teal-100 transition-colors cursor-pointer"
          >
            <Upload className="h-8 w-8 text-teal-600 mb-2" />
            <p className="text-sm text-teal-700 font-medium">Загрузите запись встречи</p>
            <p className="text-xs text-gray-500 mt-1">Нажмите для выбора файла</p>
          </button>
        )}
      </div>
    </BlockingModal>
  );
};

