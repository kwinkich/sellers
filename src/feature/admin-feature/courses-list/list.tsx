import { CoursesAPI } from "@/entities";
import { CourseCard } from "./ui";
import { useInfiniteScroll, InfiniteScrollList } from "@/shared";

export const AdminCourseList = () => {
	const {
		items: courses,
		isLoading,
		isError,
		error,
		hasNextPage,
		sentinelRef,
		isFetchingNextPage,
	} = useInfiniteScroll({
		queryKey: ["courses", "admin-list"],
		queryFn: (page, limit) => CoursesAPI.getCourses({ page, limit }),
		limit: 20,
	});

	return (
		<InfiniteScrollList
			items={courses}
			renderItem={(course) => (
				<CourseCard key={course.id} data={course} />
			)}
			isLoading={isLoading}
			isError={isError}
			error={error}
			hasNextPage={hasNextPage}
			isFetchingNextPage={isFetchingNextPage}
			sentinelRef={sentinelRef}
			emptyMessage="Нет доступных курсов"
			loadingMessage="Загрузка курсов..."
			errorMessage="Ошибка загрузки курсов"
			className="flex flex-col gap-4"
		/>
	);
};
