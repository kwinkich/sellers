import { CourseCard, coursesQueryOptions } from "@/entities";
import { useQuery } from "@tanstack/react-query";

export const CoursesList = () => {
	const {
		data: coursesData,
		isLoading,
		error,
	} = useQuery(coursesQueryOptions.list());

	console.log("Courses data:", coursesData);
	console.log("Loading:", isLoading);
	console.log("Error:", error);

	return (
		<div className="flex flex-col gap-2">
			{Array(10)
				.fill(null)
				.map((_, idx) => (
					<CourseCard key={idx} />
				))}
		</div>
	);
};
