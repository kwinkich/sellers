import type { PracticeCard as PracticeCardType } from "@/entities/practices";
import { PracticesAPI } from "@/entities/practices";
import { useInfiniteScroll, InfiniteScrollList } from "@/shared";
import { PracticeCard } from "./PracticeCard";

interface Props {
  searchQuery?: string;
}

export const PracticeList = ({ searchQuery = "" }: Props) => {
  const {
    items: practices,
    isLoading,
    isError,
    error,
    hasNextPage,
    sentinelRef,
    isFetchingNextPage,
  } = useInfiniteScroll<PracticeCardType>({
    queryKey: ["practices", "cards"],
    queryFn: (page, limit) =>
      PracticesAPI.getPracticeCards({
        page,
        limit,
        by: "startAt",
        order: "asc",
      }),
    limit: 20,
  });

  const filteredPractices = practices.filter(
    (practice) =>
      practice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      practice.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      practice.id.toString().includes(searchQuery)
  );

  return (
    <InfiniteScrollList
      items={filteredPractices}
      getKey={(practice) => practice.id}
      renderItem={(practice) => <PracticeCard data={practice} />}
      isLoading={isLoading}
      isError={isError}
      error={error}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      sentinelRef={sentinelRef}
      emptyMessage={searchQuery ? "Ничего не найдено" : "Нет практик"}
      loadingMessage="Загрузка практик..."
      errorMessage="Ошибка загрузки практик"
      className="flex flex-col gap-3 px-2 pb-6"
    />
  );
};
