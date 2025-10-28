import { ClientModuleCard, ModulesAPI } from "@/entities";
import { useInfiniteScroll, InfiniteScrollList } from "@/shared";

interface ClientModulesListProps {
  courseId: number;
}

export const ClientModulesList = ({ courseId }: ClientModulesListProps) => {
  const {
    items: modules,
    isLoading,
    isError,
    error,
    hasNextPage,
    sentinelRef,
    isFetchingNextPage,
  } = useInfiniteScroll({
    queryKey: ["modules", "client-by-course", courseId],
    queryFn: (page, limit) =>
      ModulesAPI.getModulesByCourse(courseId, { page, limit }),
    limit: 20,
  });

  return (
    <InfiniteScrollList
      items={modules}
      getKey={(module) => module.id}
      renderItem={(module) => (
        <ClientModuleCard
          module={module}
          isOpen={true} // Clients can view all modules
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
