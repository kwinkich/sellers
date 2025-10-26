import { LessonCard, LessonsAPI } from "@/entities";
import { useInfiniteScroll, InfiniteScrollList } from "@/shared";
import type { FC } from "react";

export const LessonsList: FC<{ moduleId: number }> = ({ moduleId }) => {
  const {
    items: lessons,
    isLoading,
    isError,
    error,
    hasNextPage,
    sentinelRef,
    isFetchingNextPage,
  } = useInfiniteScroll({
    queryKey: ["lessons", "by-module", moduleId],
    queryFn: (page, limit) =>
      LessonsAPI.getLessonsByModule(moduleId, { page, limit }),
    limit: 20,
  });

  return (
    <InfiniteScrollList
      items={lessons}
      getKey={(lesson) => lesson.id}
      renderItem={(lesson) => <LessonCard lesson={lesson} />}
      isLoading={isLoading}
      isError={isError}
      error={error}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      sentinelRef={sentinelRef}
      emptyMessage="Уроки не найдены"
      loadingMessage="Загрузка уроков..."
      errorMessage="Ошибка загрузки уроков"
      className="flex flex-col gap-2"
    />
  );
};
