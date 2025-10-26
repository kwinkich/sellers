import { useState, useEffect } from "react";
import { HeadText } from "@/shared/ui/head-text";
import {
  PracticeList,
  PracticeMineList,
  PracticePastList,
  PracticeJoinDrawer,
  ModeratorTermsDrawer,
  PracticeSuccessDrawer,
  CaseInfoDrawer,
} from "@/feature/practice-feature";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/shared";

type TabKey = "all" | "mine" | "past";

export const PracticeHomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Read initial parameters from URL
  const params = new URLSearchParams(location.search);
  const urlTab = (params.get("tab") as TabKey | null) ?? null;
  const scrollTo = params.get("scrollTo");

  const [tab, setTab] = useState<TabKey>(() => {
    if (urlTab === "mine" || urlTab === "all" || urlTab === "past")
      return urlTab;
    return "all";
  });

  const { role } = useUserRole();
  const roleReady = Boolean(role);

  // Function to sync tabs with URL
  const setTabAndUrl = (next: TabKey) => {
    setTab(next);
    const u = new URL(window.location.href);
    u.searchParams.set("tab", next);
    // scrollTo is one-time, so clear it when switching tabs
    u.searchParams.delete("scrollTo");
    navigate(u.pathname + u.search, { replace: true });
  };

  // Helper function to find practice card element
  const findCardEl = (practiceId: number) =>
    document.getElementById(`practice-card-${practiceId}`);

  // Handle scroll-to-practice functionality
  useEffect(() => {
    if (!scrollTo || !roleReady) return;

    const m = scrollTo.match(/^practice_(\d+)$/);
    if (!m) return;

    const targetId = Number(m[1]);
    if (!Number.isFinite(targetId)) return;

    // Determine which tab should contain the practice
    const targetTab = role === "CLIENT" ? "all" : "mine";

    // Switch to the correct tab if needed
    if (tab !== targetTab) {
      setTabAndUrl(targetTab);
      return; // Let the next effect handle the scroll after tab switch
    }

    // Attempt to scroll to the practice card
    const attemptScroll = () => {
      const el = findCardEl(targetId);
      if (el) {
        requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          // Clear scrollTo from URL after successful scroll
          const clean = new URL(window.location.href);
          clean.searchParams.delete("scrollTo");
          navigate(clean.pathname + clean.search, { replace: true });
        });
        return true;
      }
      return false;
    };

    // Try to scroll immediately
    if (attemptScroll()) return;

    // If not found, wait a bit for the list to load and try again
    const timeoutId = setTimeout(() => {
      attemptScroll();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [scrollTo, tab, role, roleReady, navigate]);

  // Handle scroll after tab switch
  useEffect(() => {
    if (!scrollTo || !roleReady) return;

    const m = scrollTo.match(/^practice_(\d+)$/);
    if (!m) return;

    const targetId = Number(m[1]);
    if (!Number.isFinite(targetId)) return;

    const targetTab = role === "CLIENT" ? "all" : "mine";

    // Only attempt scroll if we're on the correct tab
    if (tab !== targetTab) return;

    const attemptScroll = () => {
      const el = findCardEl(targetId);
      if (el) {
        requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          const clean = new URL(window.location.href);
          clean.searchParams.delete("scrollTo");
          navigate(clean.pathname + clean.search, { replace: true });
        });
        return true;
      }
      return false;
    };

    // Try after a short delay to allow the list to render
    const timeoutId = setTimeout(attemptScroll, 300);
    return () => clearTimeout(timeoutId);
  }, [tab, scrollTo, role, roleReady, navigate]);

  const tabs: Array<{ key: TabKey; label: string }> =
    roleReady && role === "CLIENT"
      ? [
          { key: "all", label: "Все практики" },
          { key: "past", label: "Прошедшие" },
        ]
      : [
          { key: "all", label: "Все практики" },
          { key: "mine", label: "Участвую" },
          { key: "past", label: "Прошедшие" },
        ];

  if (!roleReady) {
    return (
      <div className="bg-second-bg min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center text-sm text-base-gray">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="bg-second-bg min-h-[calc(100vh-4rem)] w-full">
      <div className="flex flex-col gap-3 px-2 pb-5 pt-4">
        <div className="gap-0.5 pl-2">
          <HeadText
            head="Площадка практик"
            label="Участвуйте в практиках и улучшайте свои навыки"
          />
        </div>

        <div className="w-full inline-flex min-h-10 items-center justify-center rounded-lg p-1 bg-base-bg">
          {tabs.map((t) => {
            const active = tab === (t.key as TabKey);
            return (
              <button
                key={t.key}
                onClick={() => setTabAndUrl(t.key as TabKey)}
                className={
                  "flex-1 h-[calc(100%-1px)] rounded-md px-3 py-2 text-sm font-medium transition-colors " +
                  (active
                    ? "bg-second-bg text-white"
                    : "text-base-gray hover:bg-second-bg/50")
                }
              >
                {t.label}
              </button>
            );
          })}
        </div>
        {tab === "all" && roleReady && role !== "CLIENT" && (
          <Button
            size="xs"
            rounded="3xl"
            className="w-full"
            onClick={() => navigate("/practice/create")}
          >
            Создать практику
          </Button>
        )}
      </div>

      <div className="mt-3">
        {tab === "all" && <PracticeList />}
        {tab === "mine" && roleReady && role !== "CLIENT" && (
          <PracticeMineList />
        )}
        {tab === "past" && <PracticePastList />}
      </div>

      <PracticeJoinDrawer />
      <ModeratorTermsDrawer />
      <PracticeSuccessDrawer />
      <CaseInfoDrawer />
    </div>
  );
};

export default PracticeHomePage;
