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
      getKey={(module) => module.id}
      renderItem={(module) => {
        const prevModule = modules.find(
          (m) => m.orderIndex === module.orderIndex - 1
        );
        const isPrevCompleted = prevModule?.progressPercent === 100;

        const isOpen =
          module.unlockRule === "AFTER_PREV_MODULE"
            ? Boolean(isPrevCompleted) || module.progressPercent > 0
            : true;

        return <ModuleCard module={module} isOpen={isOpen} />;
      }}
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
