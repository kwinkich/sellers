import { ClientCourseCard, CoursesAPI } from "@/entities";
import { useInfiniteScroll, InfiniteScrollList } from "@/shared";

export const ClientCoursesList = () => {
  const {
    items: courses,
    isLoading,
    isError,
    error,
    hasNextPage,
    sentinelRef,
    isFetchingNextPage,
  } = useInfiniteScroll({
    queryKey: ["courses", "client-list"],
    queryFn: (page, limit) => CoursesAPI.getCourses({ page, limit }),
    limit: 20,
  });

  return (
    <InfiniteScrollList
      items={courses}
      getKey={(course) => course.id}
      renderItem={(course) => (
        <ClientCourseCard
          course={course}
          isOpen={course.accessScope === "ALL" || !course.isIntro}
        />
      )}
      isLoading={isLoading}
      isError={isError}
      error={error}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      sentinelRef={sentinelRef}
      emptyMessage="Курсы не найдены"
      loadingMessage="Загрузка курсов..."
      errorMessage="Ошибка загрузки курсов"
      className="flex flex-col gap-2"
    />
  );
};
