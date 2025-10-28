import { CourseCard, CoursesAPI } from "@/entities";
import { useInfiniteScroll, InfiniteScrollList } from "@/shared";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export const CoursesList = () => {
  const queryClient = useQueryClient();
  const [refreshToken, setRefreshToken] = useState(0);

  // Listen for course deletion events and reset the list
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === "updated" && event.query.queryKey[0] === "courses") {
        console.log(
          "Course query updated, resetting courses list:",
          event.query.queryKey
        );
        // Reset the list when any course-related query is updated
        setRefreshToken((prev) => prev + 1);
      }
    });

    return unsubscribe;
  }, [queryClient]);

  const {
    items: courses,
    isLoading,
    isError,
    error,
    hasNextPage,
    sentinelRef,
    isFetchingNextPage,
  } = useInfiniteScroll({
    queryKey: ["courses", "list"],
    queryFn: (page, limit) => CoursesAPI.getCourses({ page, limit }),
    limit: 20,
    resetKey: refreshToken,
  });

  return (
    <InfiniteScrollList
      items={courses}
      getKey={(course) => course.id}
      renderItem={(course) => (
        <CourseCard
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
