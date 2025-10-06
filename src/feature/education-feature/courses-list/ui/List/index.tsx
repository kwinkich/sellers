import { CourseCard } from "@/entities";

export const CoursesList = () => {
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
