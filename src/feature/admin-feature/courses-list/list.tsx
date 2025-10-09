import { coursesQueryOptions } from "@/entities";
import { useQuery } from "@tanstack/react-query";
import { CourseCard } from "./ui";

export const AdminCourseList = () => {
	const { data, isLoading, error } = useQuery(
		coursesQueryOptions.list({
			limit: 10,
			page: 1,
		})
	);

	if (isLoading) {
		return (
			<div className="flex justify-center py-8">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
					<p className="text-base-gray">Загрузка курсов...</p>
				</div>
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="text-center py-8 text-destructive">
				{error?.message || "Ошибка загрузки курсов"}
			</div>
		);
	}

	const courses = data.data;

	if (courses.length === 0) {
		return (
			<div className="text-center py-8 text-base-gray">
				Нет доступных курсов
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			{courses.map((course) => (
				<CourseCard key={course.id} data={course} />
			))}
		</div>
	);
};
