import { LessonCard, lessonsQueryOptions } from "@/entities";
import { useQuery } from "@tanstack/react-query";

export const LessonsList = () => {
	const {
		data: lessonsData,
		isLoading,
		error,
	} = useQuery(lessonsQueryOptions.list());

	console.log("Lessons data:", lessonsData);
	console.log("Loading:", isLoading);
	console.log("Error:", error);

	return (
		<div className="flex flex-col gap-2">
			{Array(10)
				.fill(null)
				.map((_, idx) => (
					<LessonCard key={idx} />
				))}
		</div>
	);
};
