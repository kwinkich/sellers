// components/AppInitLayout.tsx
import { useAppInit } from "@/shared";
import { Loader2 } from "lucide-react";
import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { sseClient } from "@/shared/lib/sse";
import { useQueryClient } from "@tanstack/react-query";
import { PracticesAPI } from "@/entities/practices/model/api/practices.api";
import { useActivePracticeStore } from "@/feature/practice-feature/model/activePractice.store";
import { PracticeActiveModal } from "@/feature/practice-feature/ui/PracticeActiveModal";

export const AppInitLayout = () => {
	const { isLoading, isError, error } = useAppInit();
  const qc = useQueryClient();
  const show = useActivePracticeStore((s) => s.show);
  const hide = useActivePracticeStore((s) => s.hide);

  useEffect(() => {
    const off = sseClient.on(async (e) => {
      if (e.event === "practice-started") {
        try {
          const res = await PracticesAPI.getPracticeById(e.practiceId);
          const practice = res?.data;
          if (practice?.myRole) {
            show(practice);
          }
        } catch {
          // ignore fetch errors
        }
      }

      if (e.event === "practice-finished") {
        hide();
        qc.invalidateQueries({ queryKey: ["practices", "cards"] });
        qc.invalidateQueries({ queryKey: ["practices", "mine"] });
        qc.invalidateQueries({ queryKey: ["practices", "past"] });
        qc.invalidateQueries({ queryKey: ["practices", "detail", e.practiceId] });
      }
    });
    return () => off();
  }, [qc, show, hide]);

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
      <Outlet />
      <PracticeActiveModal />
    </>
  );
};
