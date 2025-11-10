import { TelegramBackSync } from "@/app/telegram";
import { PracticesAPI } from "@/entities/practices/model/api/practices.api";
import { useActivePracticeStore } from "@/feature/practice-feature/model/activePractice.store";
import { useFinishedPracticeStore } from "@/feature/practice-feature/model/finishedPractice.store";
import { useUploadRecordingStore } from "@/feature/practice-feature/model/uploadRecording.store";
import { CaseInfoDrawer } from "@/feature/practice-feature/ui/CaseInfoDrawer";
import { PracticeFinishedModal } from "@/feature/practice-feature/ui/PracticeFinishedModal";
import { PracticeUploadRecordingModal } from "@/feature/practice-feature/ui/PracticeUploadRecordingModal";
import { BlockedPage } from "@/pages/Blocked";
import { useAppInit } from "@/shared";
import { UserRoleProvider } from "@/shared/contexts/UserRoleContext";
import { sseClient } from "@/shared/lib/sse";
import { useQueryClient } from "@tanstack/react-query";
import WebApp from "@twa-dev/sdk";
import { useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useKeyboardChrome, RouteChromeResetter, ScrollToTop } from "@/shared";

export const AppInitLayout = () => {
  const { isLoading, isError, userData } = useAppInit();

  useKeyboardChrome();

  WebApp?.setHeaderColor("#1C1F23");
  WebApp?.setBottomBarColor("#000000");
  WebApp?.expand();

  const qc = useQueryClient();
  const showActive = useActivePracticeStore((s) => s.show);
  const hideActive = useActivePracticeStore((s) => s.hide);
  const showFinished = useFinishedPracticeStore((s) => s.show);
  const showUpload = useUploadRecordingStore((s) => s.show);
  const currentRole = userData?.role;
  const sseBound = useRef(false);
  const previousPathRef = useRef<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const blocking = useActivePracticeStore((s) => s.blocking);
  const practice = useActivePracticeStore((s) => s.practice);

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
          if (practice) {
            showActive(practice);
          }
        }

        if (modalState === "OPEN_EVAL_MODAL") {
          if (practice?.id) {
            hideActive();
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
    showFinished,
    showUpload,
    hideActive,
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
            console.log("Showing active page for practice");
            showActive(practice);
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
  ]);

  useEffect(() => {
    if (blocking && practice) {
      if (
        location.pathname !== "/practice/active" &&
        !previousPathRef.current
      ) {
        previousPathRef.current = location.pathname + location.search;
      }
      if (location.pathname !== "/practice/active") {
        navigate("/practice/active", { replace: true });
      }
      return;
    }

    if (!blocking && location.pathname === "/practice/active") {
      const target = previousPathRef.current ?? "/practice";
      previousPathRef.current = null;
      navigate(target, { replace: true });
    }

    if (!blocking && location.pathname !== "/practice/active") {
      previousPathRef.current = null;
    }
  }, [
    blocking,
    practice,
    location.pathname,
    location.search,
    navigate,
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
    return <BlockedPage />;
  }

  return (
    <>
      <TelegramBackSync closeOnRootBack={false} />
      <RouteChromeResetter />
      <ScrollToTop />
      <UserRoleProvider
        role={currentRole as "CLIENT" | "ADMIN" | "MOP" | null}
        userId={userData?.sub || null}
      >
        <Outlet />
      </UserRoleProvider>
      <PracticeFinishedModal />
      <PracticeUploadRecordingModal />
      <CaseInfoDrawer />
    </>
  );
};
