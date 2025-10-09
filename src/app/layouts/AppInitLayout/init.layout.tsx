import { TelegramBackSync } from "@/app/telegram";
import { PracticesAPI } from "@/entities/practices/model/api/practices.api";
import { useActivePracticeStore } from "@/feature/practice-feature/model/activePractice.store";
import { useFinishedPracticeStore } from "@/feature/practice-feature/model/finishedPractice.store";
import { useFinishPracticeStore } from "@/feature/practice-feature/model/finishPractice.store";
import { useUploadRecordingStore } from "@/feature/practice-feature/model/uploadRecording.store";
import { PracticeActiveModal } from "@/feature/practice-feature/ui/PracticeActiveModal";
import { PracticeFinishedModal } from "@/feature/practice-feature/ui/PracticeFinishedModal";
import { PracticeFinishModal } from "@/feature/practice-feature/ui/PracticeFinishModal";
import { PracticeUploadRecordingModal } from "@/feature/practice-feature/ui/PracticeUploadRecordingModal";
import { useAppInit } from "@/shared";
import { UserRoleProvider } from "@/shared/contexts/UserRoleContext";
import { sseClient } from "@/shared/lib/sse";
import { useQueryClient } from "@tanstack/react-query";
import WebApp from "@twa-dev/sdk";
import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";

export const AppInitLayout = () => {
	const { isLoading, isError, userData } = useAppInit();

	WebApp.setHeaderColor("#1C1F23");
	WebApp.setBottomBarColor("#000000");

	const qc = useQueryClient();
	const showActive = useActivePracticeStore((s) => s.show);
	const hideActive = useActivePracticeStore((s) => s.hide);
	const showFinished = useFinishedPracticeStore((s) => s.show);
	const showFinish = useFinishPracticeStore((s) => s.show);
	const showUpload = useUploadRecordingStore((s) => s.show);
	const currentRole = userData?.role;
	const sseBound = useRef(false);

	useEffect(() => {
		if (currentRole === "CLIENT" || isLoading || !userData) return;

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
			} catch {}
		};

		checkCurrentPractice();
	}, [
		currentRole,
		isLoading,
		userData,
		showActive,
		showFinish,
		showFinished,
		showUpload,
	]);

	useEffect(() => {
		if (currentRole === "CLIENT" || sseBound.current || isLoading || !userData)
			return;
		sseBound.current = true;

		const off = sseClient.on(async (e) => {
			console.log("SSE Event received:", e);

			if (e.event === "practice-started") {
				console.log(
					"Processing practice-started event for practiceId:",
					e.practiceId
				);
				try {
					const res = await PracticesAPI.getPracticeById(e.practiceId);
					const practice = res?.data;
					console.log("Fetched practice data:", practice);

					if (practice?.myRole) {
						console.log("User role in practice:", practice.myRole);
						// Show finish modal only to moderators
						if (practice.myRole === "MODERATOR") {
							console.log("Showing finish modal for moderator");
							showFinish(e.practiceId);
						} else {
							console.log("Showing active modal for non-moderator");
							showActive(practice);
						}
					} else {
						console.log("No myRole found in practice data");
					}
				} catch (error) {
					console.error("Error fetching practice data:", error);
				}
			}

			if (e.event === "practice-finished") {
				console.log(
					"Processing practice-finished event for practiceId:",
					e.practiceId
				);
				hideActive();
				showFinished(e.practiceId);
				qc.invalidateQueries({ queryKey: ["practices", "cards"] });
				qc.invalidateQueries({ queryKey: ["practices", "mine"] });
				qc.invalidateQueries({ queryKey: ["practices", "past"] });
				qc.invalidateQueries({
					queryKey: ["practices", "detail", e.practiceId],
				});
			}
		});

		return () => {
			off();
			sseBound.current = false;
		};
	}, [
		currentRole,
		isLoading,
		userData,
		qc,
		showActive,
		hideActive,
		showFinished,
		showFinish,
	]);

	// Индикатор загрузки
	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
					<p className="text-gray-600">Загрузка...</p>
				</div>
			</div>
		);
	}

	// Обработка ошибок авторизации
	if (isError) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<h2 className="text-xl font-semibold mb-2">Ошибка авторизации</h2>
					<p className="text-gray-600 mb-4">Не удалось войти в систему</p>
					<button
						onClick={() => window.location.reload()}
						className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
					>
						Перезагрузить
					</button>
				</div>
			</div>
		);
	}

	return (
		<>
			<TelegramBackSync closeOnRootBack={false} />
			<UserRoleProvider
				role={currentRole as "CLIENT" | "ADMIN" | "MOP" | null}
				userId={userData?.sub || null}
			>
				<Outlet />
			</UserRoleProvider>
			<PracticeActiveModal />
			<PracticeFinishedModal />
			<PracticeUploadRecordingModal />
			<PracticeFinishModal />
		</>
	);
};
