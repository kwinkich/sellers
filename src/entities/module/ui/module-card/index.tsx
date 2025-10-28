import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Module } from "@/entities";
import { ArrowIcon, Badge, Box, DonutProgress } from "@/shared";
import { LockIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ModuleCardProps {
  module: Module;
  isOpen?: boolean;
  courseId?: number;
}

export const ModuleCard = ({
  module,
  isOpen = false,
  courseId,
}: ModuleCardProps) => {
  const navigate = useNavigate();

  const getTestVariantText = (variant: string) => {
    switch (variant) {
      case "QUIZ":
        return "Тест";
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
      case "LEVEL_3":
        return "Уровень 3";
      case "LEVEL_4":
        return "Уровень 4";
      case "AFTER_PREV_MODULE":
        return "После предыдущего";
      default:
        return rule;
    }
  };

  const getLessonText = (count: number) => {
    if (count === 1) return "1 урок";
    if (count >= 2 && count <= 4) return `${count} урока`;
    return `${count} уроков`;
  };

  const getQuestionText = (count: number) => {
    if (count === 1) return "1 вопрос";
    if (count >= 2 && count <= 4) return `${count} вопроса`;
    return `${count} вопросов`;
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

      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-1 flex-wrap">
          <Badge
            label={`${module.completedLessons}/${module.lessonsCount} ${
              getLessonText(module.lessonsCount).split(" ")[1]
            }`}
            variant="gray"
          />
          <Badge
            label={getTestVariantText(module.testVariant)}
            variant="gray"
          />
          {module.quizQuestionsCount > 0 && module.testVariant !== "NONE" && (
            <Badge
              label={getQuestionText(module.quizQuestionsCount)}
              variant="gray"
            />
          )}
        </div>
      </div>

      <Separator className="bg-[#FFFFFF1A]" />

      {isOpen ? (
        <div className="flex w-full gap-2">
          <Button
            className="flex-1 hover:bg-base-main/80"
            size="2s"
            onClick={() =>
              navigate(
                `/mop/education/courses/${courseId}/modules/${module.id}/lessons`
              )
            }
          >
            {getButtonText()}
            <ArrowIcon size={18} fill="#FFF" />
          </Button>
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
