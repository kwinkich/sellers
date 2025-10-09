// components/AppInitLayout.tsx
import { useAppInit } from "@/shared";
import { Loader2 } from "lucide-react";
import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { sseClient } from "@/shared/lib/sse";
import { useQueryClient } from "@tanstack/react-query";
import { PracticesAPI } from "@/entities/practices/model/api/practices.api";
import { useActivePracticeStore } from "@/feature/practice-feature/model/activePractice.store";
import { useFinishedPracticeStore } from "@/feature/practice-feature/model/finishedPractice.store";
import { useFinishPracticeStore } from "@/feature/practice-feature/model/finishPractice.store";
import { PracticeActiveModal } from "@/feature/practice-feature/ui/PracticeActiveModal";
import { PracticeFinishedModal } from "@/feature/practice-feature/ui/PracticeFinishedModal";
import { PracticeUploadRecordingModal } from "@/feature/practice-feature/ui/PracticeUploadRecordingModal";
import { useUploadRecordingStore } from "@/feature/practice-feature/model/uploadRecording.store";
import { PracticeFinishModal } from "@/feature/practice-feature/ui/PracticeFinishModal";
import { getUserRoleFromToken } from "@/shared";
import { TelegramBackSync } from "@/app/telegram";

export const AppInitLayout = () => {
	const { isLoading, isError, error } = useAppInit();
  const qc = useQueryClient();
  const showActive = useActivePracticeStore((s) => s.show);
  const hideActive = useActivePracticeStore((s) => s.hide);
  const showFinished = useFinishedPracticeStore((s) => s.show);
  const showFinish = useFinishPracticeStore((s) => s.show);
  const showUpload = useUploadRecordingStore((s) => s.show);
  const currentRole = getUserRoleFromToken();

  useEffect(() => {
    if (currentRole === "CLIENT") return;

    const checkCurrentPractice = async () => {
      try {
        const res = await PracticesAPI.getCurrentPracticeState();
        const stateData = res?.data;

        if (!stateData || !stateData.isModalOpen) return; // nothing to do

        const practice = stateData.practice;
        const modalState = stateData.state;

        if (modalState === "OPEN_IN_PROGRESS_MODAL") {
          if (practice?.myRole === "MODERATOR") {
            showFinish(practice.id);
          } else if (practice) {
            showActive(practice);
          }
        }

        if (modalState === "OPEN_EVAL_MODAL") {
          if (practice?.id) {
            showFinished(practice.id);
          }
        }

        if (modalState === "OPEN_VIDEO_MODAL") {
          if (practice?.id) {
            showUpload(practice.id);
          }
        }
      } catch {
      }
    };

    checkCurrentPractice();
  }, [currentRole, showActive, showFinish, showFinished, showUpload]);

  useEffect(() => {
    if (currentRole === "CLIENT") return;

    const off = sseClient.on(async (e) => {
      if (e.event === "practice-started") {
        try {
          const res = await PracticesAPI.getPracticeById(e.practiceId);
          const practice = res?.data;

          if (practice?.myRole) {
            // Show finish modal only to moderators
            if (practice.myRole === "MODERATOR") {
              showFinish(e.practiceId);
            } else {
              showActive(practice);
            }
          }
        } catch {
        }
      }

      if (e.event === "practice-finished") {
        hideActive();
        showFinished(e.practiceId);
        qc.invalidateQueries({ queryKey: ["practices", "cards"] });
        qc.invalidateQueries({ queryKey: ["practices", "mine"] });
        qc.invalidateQueries({ queryKey: ["practices", "past"] });
        qc.invalidateQueries({ queryKey: ["practices", "detail", e.practiceId] });
      }
    });

    return () => off();
  }, [currentRole, qc, showActive, hideActive, showFinished, showFinish]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-center">
					<Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
					<h2 className="text-lg font-semibold text-gray-900 mb-2">
						Инициализация приложения
					</h2>
					<p className="text-sm text-gray-500">Проверка авторизации...</p>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-center max-w-md mx-4">
					<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<span className="text-2xl">⚠️</span>
					</div>
					<h2 className="text-lg font-semibold text-gray-900 mb-2">
						Ошибка инициализации
					</h2>
					<p className="text-sm text-gray-500 mb-4">
						{error?.message || "Не удалось загрузить приложение"}
					</p>
					<button
						onClick={() => window.location.reload()}
						className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						Попробовать снова
					</button>
				</div>
			</div>
		);
	}

  return (
    <>
      <TelegramBackSync closeOnRootBack={false} />
      <Outlet />
      <PracticeActiveModal />
      <PracticeFinishedModal />
      <PracticeUploadRecordingModal />
      <PracticeFinishModal />
    </>
  );
};
