import { LessonsList } from "@/feature/education-feature/lessons-list";
import { HeadText } from "@/shared";

export const MopLessonsPage = () => {
	return (
		<div className="bg-second-bg px-2 min-h-full pb-24 pt-4">
			<HeadText head="Название модуля" label="Модуль 2" className="px-2 mb-6" />

			<LessonsList />
		</div>
	);
};
