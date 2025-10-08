import { useState } from "react";
import { HeadText } from "@/shared/ui/head-text";
import { PracticeList, PracticeJoinDrawer, ModeratorTermsDrawer, PracticeSuccessDrawer, CaseInfoDrawer, PracticePastCard, PracticeMineCard } from "@/feature/practice-feature";
import { useNavigate } from "react-router-dom";
import { practicesQueryOptions } from "@/entities/practices";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getUserRoleFromToken } from "@/shared";

type TabKey = "all" | "mine" | "past";

export const PracticeHomePage = () => {
  const [tab, setTab] = useState<TabKey>("all");
  // Pagination state per tab
  const [pageAll, setPageAll] = useState<number>(1);
  const [pageMine, setPageMine] = useState<number>(1);
  const [pagePast, setPagePast] = useState<number>(1);
  const LIMIT = 20;
  const navigate = useNavigate();
  const role = getUserRoleFromToken();

  const cardsQ = useQuery(practicesQueryOptions.cards({ page: pageAll, limit: LIMIT }));
  const mineQ = useQuery(practicesQueryOptions.mine({ page: pageMine, limit: LIMIT }));
  const pastQ = useQuery(practicesQueryOptions.past({ page: pagePast, limit: LIMIT }));

  const cards = cardsQ.data?.data ?? [];
  const mine = mineQ.data?.data ?? [];
  const past = pastQ.data?.data ?? [];

  const cardsPg = (cardsQ.data as any)?.meta?.pagination;
  const minePg = (mineQ.data as any)?.meta?.pagination;
  const pastPg = (pastQ.data as any)?.meta?.pagination;

  return (
    <div className="bg-second-bg min-h-dvh">
      <div className="flex flex-col gap-3 px-2 pb-5">
        <div className="gap-0.5 pl-2 pt-2">
          <HeadText head="Площадка практик" label="Оттачивайте переговорные навыки"/>
        </div>

        <div className="w-full inline-flex min-h-10 items-center justify-center rounded-lg p-1 bg-base-bg">
          {[
            { key: "all", label: "Все практики" },
            { key: "mine", label: "Участвую" },
            { key: "past", label: "Прошедшие" },
          ].map((t) => {
            const active = tab === (t.key as TabKey);
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key as TabKey)}
                className={
                  "flex-1 h-[calc(100%-1px)] rounded-md px-3 py-2 text-sm font-medium transition-colors " +
                  (active ? "bg-second-bg text-white" : "text-base-gray hover:bg-second-bg/50")
                }
              >
                {t.label}
              </button>
            );
          })}
        </div>
          {tab === "all" && role !== "CLIENT" && (
          <Button size="xs" rounded="3xl" className="w-full" onClick={() => navigate("/practice/create")}>Создать практику</Button>
          )}
        </div>


      <div className="mt-3">
        {tab === "all" && (
          <>
            <PracticeList items={cards} isLoading={cardsQ.isLoading} isError={!!cardsQ.error} />
            {!!cardsPg?.totalPages && cardsPg.totalPages > 1 && (
              <div className="flex items-center justify-between px-2 py-3">
                <button
                  className="text-sm text-base-main disabled:text-base-gray"
                  disabled={cardsQ.isLoading || cardsPg.currentPage <= 1}
                  onClick={() => setPageAll((p) => Math.max(1, p - 1))}
                >
                  Назад
                </button>
                <span className="text-xs text-base-gray">
                  {cardsPg.currentPage} / {cardsPg.totalPages}
                </span>
                <button
                  className="text-sm text-base-main disabled:text-base-gray"
                  disabled={cardsQ.isLoading || cardsPg.currentPage >= cardsPg.totalPages}
                  onClick={() => setPageAll((p) => p + 1)}
                >
                  Вперёд
                </button>
              </div>
            )}
          </>
        )}
        {tab === "mine" && (
          mineQ.isLoading ? (
            <div className="text-center text-sm text-base-gray">Загрузка…</div>
          ) : mineQ.error ? (
            <div className="text-center text-sm text-base-gray">Ошибка загрузки</div>
          ) : !mine.length ? (
            <div className="text-center text-sm text-base-gray">Ничего не найдено</div>
          ) : (
            <>
              <div className="flex flex-col gap-3 px-2 pb-3">
                {mine.map((p) => (
                  <PracticeMineCard key={p.id} data={p} />
                ))}
              </div>
              {!!minePg?.totalPages && minePg.totalPages > 1 && (
                <div className="flex items-center justify-between px-2 pb-5">
                  <button
                    className="text-sm text-base-main disabled:text-base-gray"
                    disabled={mineQ.isLoading || minePg.currentPage <= 1}
                    onClick={() => setPageMine((p) => Math.max(1, p - 1))}
                  >
                    Назад
                  </button>
                  <span className="text-xs text-base-gray">
                    {minePg.currentPage} / {minePg.totalPages}
                  </span>
                  <button
                    className="text-sm text-base-main disabled:text-base-gray"
                    disabled={mineQ.isLoading || minePg.currentPage >= minePg.totalPages}
                    onClick={() => setPageMine((p) => p + 1)}
                  >
                    Вперёд
                  </button>
                </div>
              )}
            </>
          )
        )}
        {tab === "past" && (
          pastQ.isLoading ? (
            <div className="text-center text-sm text-base-gray">Загрузка…</div>
          ) : pastQ.error ? (
            <div className="text-center text-sm text-base-gray">Ошибка загрузки</div>
          ) : !past.length ? (
            <div className="text-center text-sm text-base-gray">Ничего не найдено</div>
          ) : (
            <>
              <div className="flex flex-col gap-3 px-2 pb-3">
                {past.map((p) => (
                  <PracticePastCard key={p.id} data={p} />
                ))}
              </div>
              {!!pastPg?.totalPages && pastPg.totalPages > 1 && (
                <div className="flex items-center justify-between px-2 pb-5">
                  <button
                    className="text-sm text-base-main disabled:text-base-gray"
                    disabled={pastQ.isLoading || pastPg.currentPage <= 1}
                    onClick={() => setPagePast((p) => Math.max(1, p - 1))}
                  >
                    Назад
                  </button>
                  <span className="text-xs text-base-gray">
                    {pastPg.currentPage} / {pastPg.totalPages}
                  </span>
                  <button
                    className="text-sm text-base-main disabled:text-base-gray"
                    disabled={pastQ.isLoading || pastPg.currentPage >= pastPg.totalPages}
                    onClick={() => setPagePast((p) => p + 1)}
                  >
                    Вперёд
                  </button>
                </div>
              )}
            </>
          )
        )}
      </div>

      <PracticeJoinDrawer />
      <ModeratorTermsDrawer />
      <PracticeSuccessDrawer />
      <CaseInfoDrawer />
    </div>
  );
};

export default PracticeHomePage;
