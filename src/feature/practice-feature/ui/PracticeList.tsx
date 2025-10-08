import type { PracticeCard as PracticeCardType } from "@/entities/practices";
import { PracticeCard } from "./PracticeCard";

interface Props {
  items?: PracticeCardType[];
  isLoading?: boolean;
  isError?: boolean;
}

export const PracticeList = ({ items, isLoading, isError }: Props) => {
  if (isLoading) return <div className="text-center text-sm text-base-gray">Загрузка…</div>;
  if (isError) return <div className="text-center text-sm text-base-gray">Ошибка загрузки</div>;
  if (!items?.length) return <div className="text-center text-sm text-base-gray">Ничего не найдено</div>;

  return (
    <div className="flex flex-col gap-3 px-2 pb-6">
      {items.map((p) => (
        <PracticeCard key={p.id} data={p} />
      ))}
    </div>
  );
};


