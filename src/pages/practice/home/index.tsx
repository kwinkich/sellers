import { useState } from "react";
import { HeadText } from "@/shared/ui/head-text";
import { PracticeList, PracticeJoinDrawer } from "@/feature/practice-feature";
import { practicesQueryOptions } from "@/entities/practices";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

type TabKey = "all" | "mine" | "past";

export const PracticeHomePage = () => {
  const [tab, setTab] = useState<TabKey>("all");
  const cardsQ = useQuery(practicesQueryOptions.cards());
  const mineQ = useQuery(practicesQueryOptions.mine());
  const pastQ = useQuery(practicesQueryOptions.past());

  const cards = cardsQ.data?.data ?? [];
  const mine = mineQ.data?.data ?? [];
  const past = pastQ.data?.data ?? [];

  return (
    <div className="bg-second-bg min-h-dvh">
      <div className="flex flex-col gap-3 px-2 pb-3">
        <div className="gap-0.5 pl-2 pt-2">
          <HeadText head="Площадка сражений" label="Оттачивайте переговорные навыки"/>
        </div>

        <div className="w-full inline-flex min-h-10 items-center justify-center rounded-lg p-1 bg-base-bg">
          {[
            { key: "all", label: "Все бои" },
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
          <Button size="xs" rounded="3xl" className="w-full">Создать бой</Button>
          )}
        </div>


      <div className="mt-3">
        {tab === "all" && (
          <PracticeList items={cards} isLoading={cardsQ.isLoading} isError={!!cardsQ.error} />
        )}
        {tab === "mine" && (
          <PracticeList items={mine} isLoading={mineQ.isLoading} isError={!!mineQ.error} />
        )}
        {tab === "past" && (
          <PracticeList items={past} isLoading={pastQ.isLoading} isError={!!pastQ.error} />
        )}
      </div>

      <PracticeJoinDrawer />
    </div>
  );
};

export default PracticeHomePage;


