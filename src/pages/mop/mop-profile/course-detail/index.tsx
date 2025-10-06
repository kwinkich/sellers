import { ModulesList } from "@/feature/education-feature/modules-list";
import { HeadText } from "@/shared";

export const MopCourseDetailPage = () => {
	return (
		<div className="bg-second-bg px-2 min-h-full pb-24 pt-4">
			<HeadText
				head="Название курса"
				label="Пройдено: 28%"
				className="px-2 mb-6"
			/>

			<ModulesList />
		</div>
	);
};
