import { Skeleton } from "@/components/ui/skeleton";
import { CourseCard, coursesQueryOptions } from "@/entities";
import { useQuery } from "@tanstack/react-query";

export const CoursesList = () => {
	const {
		data: coursesData,
		isLoading,
		error,
	} = useQuery(coursesQueryOptions.list());

	if (isLoading) {
		return (
			<div className="flex flex-col gap-2">
				{Array(3)
					.fill(null)
					.map((_, idx) => (
						<Skeleton
							key={idx}
							className="h-32 w-full bg-gray-700 rounded-lg"
						/>
					))}
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center text-red-500 py-4">
				Ошибка загрузки курсов: {error.message}
			</div>
		);
	}

	if (!coursesData?.data?.length) {
		return (
			<div className="text-center text-gray-500 py-4">Курсы не найдены</div>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			{coursesData.data.map((course) => (
				<CourseCard
					key={course.id}
					course={course}
					isOpen={course.accessScope === "ALL" || !course.isIntro}
				/>
			))}
		</div>
	);
};
