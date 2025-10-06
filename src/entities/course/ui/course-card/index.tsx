import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowIcon, Badge, Box, DonutProgress } from "@/shared";
import { LockIcon } from "lucide-react";

export const CourseCard = () => {
	const isOpen = false;

	return (
		<Box className="p-3" variant="dark" align="start">
			<div className="w-full flex items-start justify-between">
				<div className="flex flex-col gap-1">
					<Badge label="Курс 1" variant="gray-opacity" className="w-max" />
					<p className="text-lg font-medium text-white">Лига продаж</p>
				</div>
				<DonutProgress value={20} size={32} strokeWidth={3} fontSize="9px" />
			</div>

			<p className="text-xs text-base-gray">
				Обучающий курс для тех, кто хочет отточить навыки переговоров и уверенно
				побеждать в сделках.
			</p>

			<div className="flex items-center gap-1">
				<Badge label="Аргументация" variant="gray" />
				<Badge label="Активное слушание" variant="gray" />
				<p className="text-xs text-base-gray px-3">+2</p>
			</div>

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
