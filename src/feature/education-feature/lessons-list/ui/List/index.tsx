import { Skeleton } from "@/components/ui/skeleton";
import { LessonCard, lessonsQueryOptions } from "@/entities";
import { useQuery } from "@tanstack/react-query";
import type { FC } from "react";

export const LessonsList: FC<{ moduleId: number }> = ({ moduleId }) => {
	const {
		data: lessonsData,
		isLoading,
		error,
	} = useQuery(lessonsQueryOptions.byModule(moduleId));

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
				Ошибка загрузки уроков: {error.message}
			</div>
		);
	}

	if (!lessonsData?.data?.length) {
		return (
			<div className="text-center text-gray-500 py-4">Уроки не найдены</div>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			{lessonsData.data.map((lesson) => (
				<LessonCard key={lesson.id} lesson={lesson} />
			))}
		</div>
	);
};
