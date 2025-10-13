import { useEffect, useRef, useState } from "react";
import { HeadText } from "@/shared/ui/head-text";
import {
  PracticeList,
  PracticeJoinDrawer,
  ModeratorTermsDrawer,
  PracticeSuccessDrawer,
  CaseInfoDrawer,
  PracticePastCard,
  PracticeMineCard,
} from "@/feature/practice-feature";
import { useNavigate } from "react-router-dom";
import { practicesQueryOptions } from "@/entities/practices";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/shared";

type TabKey = "all" | "mine" | "past";

export const PracticeHomePage = () => {
  const [tab, setTab] = useState<TabKey>("all");
  // Pagination state per tab
  const [pageAll, setPageAll] = useState<number>(1);
  const [pageMine, setPageMine] = useState<number>(1);
  const [pagePast, setPagePast] = useState<number>(1);
  const LIMIT = 20;
  const navigate = useNavigate();
  const { role } = useUserRole();
  const roleReady = Boolean(role);

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

  // Accumulated items per tab for infinite scroll
  const [allItems, setAllItems] = useState<any[]>([]);
  const [mineItems, setMineItems] = useState<any[]>([]);
  const [pastItems, setPastItems] = useState<any[]>([]);

  // Track last appended page to avoid duplicate merges
  const [lastAppendedAllPage, setLastAppendedAllPage] = useState<number>(0);
  const [lastAppendedMinePage, setLastAppendedMinePage] = useState<number>(0);
  const [lastAppendedPastPage, setLastAppendedPastPage] = useState<number>(0);

  // Sentinels to trigger loading next pages
  const allSentinelRef = useRef<HTMLDivElement | null>(null);
  const mineSentinelRef = useRef<HTMLDivElement | null>(null);
  const pastSentinelRef = useRef<HTMLDivElement | null>(null);

  const cardsQ = useQuery({
    ...practicesQueryOptions.cards({ page: pageAll, limit: LIMIT }),
  });
  const mineQ = useQuery({
    ...practicesQueryOptions.mine({ page: pageMine, limit: LIMIT }),
    enabled: roleReady && role !== "CLIENT",
  });
  const pastQ = useQuery({
    ...practicesQueryOptions.past({ page: pagePast, limit: LIMIT }),
  });

  const cards = cardsQ.data?.data ?? [];
  const mine = mineQ.data?.data ?? [];
  const past = pastQ.data?.data ?? [];

  const cardsPg = (cardsQ.data as any)?.meta?.pagination;
  const minePg = (mineQ.data as any)?.meta?.pagination;
  const pastPg = (pastQ.data as any)?.meta?.pagination;

  // Accumulate lists for infinite scroll (All)
  useEffect(() => {
    if (!cardsPg) return;
    if (cardsPg.currentPage === 1) {
      setAllItems(cards);
      setLastAppendedAllPage(1);
      return;
    }
    if (cardsPg.currentPage > lastAppendedAllPage) {
      setAllItems((prev) => [...prev, ...cards]);
      setLastAppendedAllPage(cardsPg.currentPage);
    }
  }, [cards, cardsPg?.currentPage]);

  // Accumulate lists for infinite scroll (Mine)
  useEffect(() => {
    if (!minePg) return;
    if (minePg.currentPage === 1) {
      setMineItems(mine);
      setLastAppendedMinePage(1);
      return;
    }
    if (minePg.currentPage > lastAppendedMinePage) {
      setMineItems((prev) => [...prev, ...mine]);
      setLastAppendedMinePage(minePg.currentPage);
    }
  }, [mine, minePg?.currentPage]);

  // Accumulate lists for infinite scroll (Past)
  useEffect(() => {
    if (!pastPg) return;
    if (pastPg.currentPage === 1) {
      setPastItems(past);
      setLastAppendedPastPage(1);
      return;
    }
    if (pastPg.currentPage > lastAppendedPastPage) {
      setPastItems((prev) => [...prev, ...past]);
      setLastAppendedPastPage(pastPg.currentPage);
    }
  }, [past, pastPg?.currentPage]);

  // Observe sentinel for All tab
  useEffect(() => {
    if (tab !== "all") return;
    const target = allSentinelRef.current;
    if (!target) return;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry?.isIntersecting) return;
      if (cardsQ.isLoading) return;
      if (cardsPg && cardsPg.currentPage < cardsPg.totalPages) {
        setPageAll((p) => p + 1);
      }
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [tab, cardsQ.isLoading, cardsPg?.currentPage, cardsPg?.totalPages]);

  // Observe sentinel for Mine tab
  useEffect(() => {
    if (role === "CLIENT") return;
    if (tab !== "mine") return;
    const target = mineSentinelRef.current;
    if (!target) return;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry?.isIntersecting) return;
      if (mineQ.isLoading) return;
      if (minePg && minePg.currentPage < minePg.totalPages) {
        setPageMine((p) => p + 1);
      }
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [tab, role, mineQ.isLoading, minePg?.currentPage, minePg?.totalPages]);

  // Observe sentinel for Past tab
  useEffect(() => {
    if (tab !== "past") return;
    const target = pastSentinelRef.current;
    if (!target) return;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry?.isIntersecting) return;
      if (pastQ.isLoading) return;
      if (pastPg && pastPg.currentPage < pastPg.totalPages) {
        setPagePast((p) => p + 1);
      }
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [tab, pastQ.isLoading, pastPg?.currentPage, pastPg?.totalPages]);

  if (!roleReady) {
    return (
      <div className="bg-second-bg min-h-dvh flex items-center justify-center">
        <div className="text-center text-sm text-base-gray">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="bg-second-bg min-h-dvh">
      <div className="flex flex-col gap-3 px-2 pb-5">
        <div className="gap-0.5 pl-2 pt-2">
          <HeadText
            head="Площадка практик"
            label="Оттачивайте переговорные навыки"
          />
        </div>

        <div className="w-full inline-flex min-h-10 items-center justify-center rounded-lg p-1 bg-base-bg">
          {tabs.map((t) => {
            const active = tab === (t.key as TabKey);
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key as TabKey)}
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
        {tab === "all" && (
          <>
            <PracticeList
              items={allItems.length ? allItems : cards}
              isLoading={cardsQ.isLoading}
              isError={!!cardsQ.error}
            />
            {cardsPg?.currentPage &&
              cardsPg?.totalPages &&
              cardsPg.currentPage < cardsPg.totalPages && (
                <div className="px-2 py-3">
                  {cardsQ.isLoading ? (
                    <div className="text-center text-xs text-base-gray">
                      Загрузка…
                    </div>
                  ) : null}
                  <div ref={allSentinelRef} className="h-1" />
                </div>
              )}
          </>
        )}
        {tab === "mine" &&
          (mineQ.isLoading ? (
            <div className="text-center text-sm text-base-gray">Загрузка…</div>
          ) : mineQ.error ? (
            <div className="text-center text-sm text-base-gray">
              Ошибка загрузки
            </div>
          ) : !mine.length ? (
            <div className="text-center text-sm text-base-gray">
              Ничего не найдено
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3 px-2 pb-3">
                {(mineItems.length ? mineItems : mine).map((p) => (
                  <PracticeMineCard key={p.id} data={p} />
                ))}
              </div>
              {minePg?.currentPage &&
                minePg?.totalPages &&
                minePg.currentPage < minePg.totalPages && (
                  <div className="px-2 pb-5">
                    {mineQ.isLoading ? (
                      <div className="text-center text-xs text-base-gray">
                        Загрузка…
                      </div>
                    ) : null}
                    <div ref={mineSentinelRef} className="h-1" />
                  </div>
                )}
            </>
          ))}
        {tab === "past" &&
          (pastQ.isLoading ? (
            <div className="text-center text-sm text-base-gray">Загрузка…</div>
          ) : pastQ.error ? (
            <div className="text-center text-sm text-base-gray">
              Ошибка загрузки
            </div>
          ) : !past.length ? (
            <div className="text-center text-sm text-base-gray">
              Ничего не найдено
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3 px-2 pb-3">
                {(pastItems.length ? pastItems : past).map((p) => (
                  <PracticePastCard key={p.id} data={p} />
                ))}
              </div>
              {pastPg?.currentPage &&
                pastPg?.totalPages &&
                pastPg.currentPage < pastPg.totalPages && (
                  <div className="px-2 pb-5">
                    {pastQ.isLoading ? (
                      <div className="text-center text-xs text-base-gray">
                        Загрузка…
                      </div>
                    ) : null}
                    <div ref={pastSentinelRef} className="h-1" />
                  </div>
                )}
            </>
          ))}
      </div>

      <PracticeJoinDrawer />
      <ModeratorTermsDrawer />
      <PracticeSuccessDrawer />
      <CaseInfoDrawer />
    </div>
  );
};

export default PracticeHomePage;
