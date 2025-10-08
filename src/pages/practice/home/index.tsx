import { useState } from "react";
import { HeadText } from "@/shared/ui/head-text";
import { PracticeList, PracticeJoinDrawer, ModeratorTermsDrawer, PracticeSuccessDrawer, CaseInfoDrawer, PracticePastCard, PracticeMineCard } from "@/feature/practice-feature";
import { useNavigate } from "react-router-dom";
import { practicesQueryOptions } from "@/entities/practices";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

type TabKey = "all" | "mine" | "past";

export const PracticeHomePage = () => {
  const [tab, setTab] = useState<TabKey>("all");
  const navigate = useNavigate();
  const cardsQ = useQuery(practicesQueryOptions.cards());
  const mineQ = useQuery(practicesQueryOptions.mine());
  const pastQ = useQuery(practicesQueryOptions.past());

  const cards = cardsQ.data?.data ?? [];
  const mine = mineQ.data?.data ?? [];
  const past = pastQ.data?.data ?? [];

  return (
    <div className="bg-second-bg">
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
          {tab === "all" && (
          <Button size="xs" rounded="3xl" className="w-full" onClick={() => navigate("/practice/create")}>Создать практику</Button>
          )}
        </div>


      <div className="mt-3">
        {tab === "all" && (
          <PracticeList items={cards} isLoading={cardsQ.isLoading} isError={!!cardsQ.error} />
        )}
        {tab === "mine" && (
          mineQ.isLoading ? (
            <div className="text-center text-sm text-base-gray">Загрузка…</div>
          ) : mineQ.error ? (
            <div className="text-center text-sm text-base-gray">Ошибка загрузки</div>
          ) : !mine.length ? (
            <div className="text-center text-sm text-base-gray">Ничего не найдено</div>
          ) : (
            <div className="flex flex-col gap-3 px-2 pb-5">
              {mine.map((p) => (
                <PracticeMineCard key={p.id} data={p} />
              ))}
            </div>
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
            <div className="flex flex-col gap-3 px-2 pb-5">
              {past.map((p) => (
                <PracticePastCard key={p.id} data={p} />
              ))}
            </div>
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


