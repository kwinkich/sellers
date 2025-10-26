import { ModuleCard, ModulesAPI } from "@/entities";
import { useInfiniteScroll, InfiniteScrollList } from "@/shared";

interface ModulesListProps {
  courseId: number;
}

export const ModulesList = ({ courseId }: ModulesListProps) => {
  const {
    items: modules,
    isLoading,
    isError,
    error,
    hasNextPage,
    sentinelRef,
    isFetchingNextPage,
  } = useInfiniteScroll({
    queryKey: ["modules", "by-course", courseId],
    queryFn: (page, limit) =>
      ModulesAPI.getModulesByCourse(courseId, { page, limit }),
    limit: 20,
  });

  return (
    <InfiniteScrollList
      items={modules}
      renderItem={(module) => (
        <ModuleCard
          key={module.id}
          module={module}
          isOpen={module.unlockRule === "ALL" || module.progressPercent > 0}
        />
      )}
      isLoading={isLoading}
      isError={isError}
      error={error}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      sentinelRef={sentinelRef}
      emptyMessage="В этом курсе пока нет модулей"
      loadingMessage="Загрузка модулей..."
      errorMessage="Ошибка загрузки модулей"
      className="flex flex-col gap-2"
    />
  );
};
