import { Button } from "@/components/ui/button";
import { AdminCourseList } from "@/feature/admin-feature/courses-list";
import { HeadText } from "@/shared";
import { PlusIcon } from "lucide-react";

export const AdminCourseListPage = () => {
	return (
		<div className="flex flex-col bg-second-bg min-h-full pb-24 gap-6 px-2 pt-4">
			<HeadText
				head="Список курсов"
				label={`Оттачивайте переговорные навыки`}
				className="px-2"
			/>

			<AdminCourseList />

			<Button
				rounded="full"
				size="xs"
				className="fixed bottom-[100px] text-sm right-2"
			>
				<PlusIcon />
				Создать курс
			</Button>
		</div>
	);
};
