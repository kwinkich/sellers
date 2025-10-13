import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Module } from "@/entities";
import { ArrowIcon, Badge, Box, DonutProgress } from "@/shared";
import { LockIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ModuleCardProps {
	module: Module;
	isOpen?: boolean;
}

export const ModuleCard = ({ module, isOpen = false }: ModuleCardProps) => {
	const navigate = useNavigate();

	const getTestVariantText = (variant: string) => {
		switch (variant) {
			case "QUIZ":
				return "Тест";
			case "PRACTICE":
				return "Практика";
			case "NONE":
				return "Без теста";
			default:
				return variant;
		}
	};

	const getUnlockRuleText = (rule: string) => {
		switch (rule) {
			case "ALL":
				return "Все уроки";
			case "PREVIOUS":
				return "Предыдущий";
			case "TEST":
				return "После теста";
			default:
				return rule;
		}
	};

	const getButtonText = () => {
		if (!isOpen) return "Заблокировано";
		return module.progressPercent > 0 ? "Продолжить" : "Начать модуль";
	};

	return (
		<Box
			className="p-3 cursor-pointer hover:shadow-lg transition-shadow"
			variant="dark"
			align="start"
		>
			<div className="w-full flex items-start justify-between">
				<div className="flex flex-col gap-1">
					<Badge
						label={`Модуль ${module.orderIndex}`}
						variant="gray-opacity"
						className="w-max"
					/>
					<p className="text-lg font-medium text-white hover:text-blue-200 transition-colors">
						{module.title}
					</p>
				</div>
				{module.progressPercent === 100 ? (
					<Badge label="Завершено" variant="main" />
				) : module.progressPercent > 0 ? (
					<DonutProgress
						value={module.progressPercent}
						size={32}
						strokeWidth={3}
						fontSize="9px"
					/>
				) : (
					<Badge label="Не начат" variant="gray" />
				)}
			</div>

			<p className="text-xs text-base-gray">
				{module.shortDesc || "Описание отсутствует"}
			</p>

			<div className="flex items-center gap-1 flex-wrap">
				<Badge
					label={`${module.completedLessons}/${module.lessonsCount} уроков`}
					variant="gray"
				/>
				<Badge label={getTestVariantText(module.testVariant)} variant="gray" />
				{module.quizQuestionsCount > 0 && module.testVariant !== "NONE" && (
					<Badge
						label={`${module.quizQuestionsCount} вопросов`}
						variant="gray"
					/>
				)}
			</div>

			<Separator className="bg-[#FFFFFF1A]" />

			{isOpen ? (
				<div className="flex w-full gap-2">
					<Button
						className="flex-1 hover:bg-base-main/80"
						size="2s"
						onClick={() =>
							navigate(`/mop/education/courses/${module.id}/lessons`)
						}
					>
						{getButtonText()}
						<ArrowIcon size={18} fill="#FFF" />
					</Button>
					{/* {module.testVariant !== "NONE" && (
						<Button
							size="2s"
							onClick={() =>
								navigate(`/mop/education/quizzes/${module.quizId}`)
							}
						>
							Тест
						</Button>
					)} */}
				</div>
			) : (
				<Button variant="second" className="w-full" size="2s" disabled>
					<LockIcon />
					Доступ:{" "}
					<span className="text-base-main">
						{getUnlockRuleText(module.unlockRule)}
					</span>
				</Button>
			)}
		</Box>
	);
};
