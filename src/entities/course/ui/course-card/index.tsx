import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Course } from "@/entities";
import { ArrowIcon, Badge, Box, DonutProgress } from "@/shared";
import { LockIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CourseCardProps {
	course: Course;
	progress?: number;
	isOpen?: boolean;
	userType?: "mop" | "admin" | "client";
}

export const CourseCard = ({
	course,
	progress = 0,
	isOpen = false,
	userType = "mop",
}: CourseCardProps) => {
	const navigate = useNavigate();

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("ru-RU");
	};

	const handleCardClick = () => {
		if (!isOpen) return;

		switch (userType) {
			case "mop":
				navigate(`/mop/education/courses/${course.id}`);
				break;
			case "admin":
				navigate(`/admin/course/${course.id}/edit`);
				break;
			case "client":
				// Для клиента может быть другой роут или просмотр статистики
				navigate(`/client/mop/${course.id}`);
				break;
		}
	};

	const handleViewDetails = () => {
		switch (userType) {
			case "mop":
				navigate(`/mop/education/courses/${course.id}`);
				break;
			case "admin":
				navigate(`/admin/course/${course.id}/edit`);
				break;
		}
	};

	const getButtonText = () => {
		if (!isOpen) return "Заблокировано";

		switch (userType) {
			case "mop":
				return progress > 0 ? "Продолжить" : "Начать курс";
			case "admin":
				return "Редактировать";
			case "client":
				return "Просмотреть";
			default:
				return "Открыть";
		}
	};

	return (
		<Box
			className="p-3 cursor-pointer hover:shadow-lg transition-shadow"
			variant="dark"
			align="start"
		>
			<div
				className="w-full flex items-start justify-between"
				onClick={handleViewDetails}
			>
				<div className="flex flex-col gap-1">
					<Badge
						label={`Курс ${course.id}`}
						variant="gray-opacity"
						className="w-max"
					/>
					<p className="text-lg font-medium text-white hover:text-blue-200 transition-colors">
						{course.title}
					</p>
				</div>
				{progress > 0 && (
					<DonutProgress
						value={progress}
						size={32}
						strokeWidth={3}
						fontSize="9px"
					/>
				)}
			</div>

			<p className="text-xs text-base-gray">
				{course.shortDesc || "Описание отсутствует"}
			</p>

			<div className="flex items-center gap-1 flex-wrap">
				<Badge
					label={course.accessScope === "ALL" ? "Для всех" : "По выбору"}
					variant="gray"
				/>
				{course.isIntro && <Badge label="Вводный" variant="gray" />}
				<p className="text-xs text-base-gray px-2">
					Создан: {formatDate(course.createdAt)}
				</p>
			</div>

			<Separator className="bg-[#FFFFFF1A]" />

			{isOpen ? (
				<Button className="w-full" size="2s" onClick={handleCardClick}>
					{getButtonText()}
					<ArrowIcon size={18} fill="#FFF" />
				</Button>
			) : (
				<Button variant="second" className="w-full" size="2s" disabled>
					<LockIcon />
					Пройдите <span className="text-base-main">предыдущий курс</span> для
					доступа
				</Button>
			)}
		</Box>
	);
};
