import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowIcon, Badge, Box } from "@/shared";
import { LockIcon } from "lucide-react";

export const LessonCard = () => {
	const isOpen = false;

	return (
		<Box className="p-3" variant="dark" align="start">
			<div className="w-full flex items-start justify-between">
				<div className="flex flex-col gap-1">
					<Badge label="Урок 1" variant="gray-opacity" className="w-max" />
					<p className="text-lg font-medium text-white">Лига продаж</p>
				</div>
				<Badge label="Выполнено" variant="gray" />
			</div>

			<p className="text-xs text-base-gray">
				Обучающий курс для тех, кто хочет отточить навыки переговоров и уверенно
				побеждать в сделках.
			</p>

			<Separator className="bg-[#FFFFFF1A]" />

			{isOpen ? (
				<Button className="w-full" size="2s">
					Пройти
					<ArrowIcon size={18} fill="#FFF" />
				</Button>
			) : (
				<Button variant="second" className="w-full" size="2s">
					<LockIcon />
					Пройдите <span className="text-base-main">Курс 1</span> для доступа
				</Button>
			)}
		</Box>
	);
};
