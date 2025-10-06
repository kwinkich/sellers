import { LessonCard } from "@/entities";

export const LessonsList = () => {
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
