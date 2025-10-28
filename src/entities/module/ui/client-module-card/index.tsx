import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Module } from "@/entities";
import { ArrowIcon, Badge, Box } from "@/shared";
import { EyeIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ClientModuleCardProps {
  module: Module;
  isOpen?: boolean;
}

export const ClientModuleCard = ({
  module,
  isOpen = false,
}: ClientModuleCardProps) => {
  const navigate = useNavigate();

  const getTestVariantText = (variant: string) => {
    switch (variant) {
      case "QUIZ":
        return "С тестом";
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

  const getButtonText = () => {
    if (!isOpen) return "Заблокировано";
    return "Просмотреть модуль";
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
        <Badge label="Просмотр" variant="gray" />
      </div>

      <p className="text-xs text-base-gray">
        {module.shortDesc || "Описание отсутствует"}
      </p>

      <div className="flex items-center gap-1 flex-wrap">
        <Badge label={`${module.lessonsCount} уроков`} variant="gray" />
        <Badge label={getTestVariantText(module.testVariant)} variant="gray" />
        {module.quizQuestionsCount > 0 && module.testVariant !== "NONE" && (
          <Badge
            label={`${module.quizQuestionsCount} вопросов`}
            variant="gray"
          />
        )}
        <Badge
          label={`Доступ: ${getUnlockRuleText(module.unlockRule)}`}
          variant="gray"
        />
      </div>

      <Separator className="bg-[#FFFFFF1A]" />

      {isOpen ? (
        <div className="flex w-full gap-2">
          <Button
            className="flex-1 hover:bg-base-main/80"
            size="2s"
            onClick={() =>
              navigate(`/client/education/courses/${module.id}/lessons`)
            }
          >
            <EyeIcon size={18} className="mr-2" />
            {getButtonText()}
            <ArrowIcon size={18} fill="#FFF" />
          </Button>
        </div>
      ) : (
        <Button variant="second" className="w-full" size="2s" disabled>
          <EyeIcon size={18} className="mr-2" />
          Доступ:{" "}
          <span className="text-base-main">
            {getUnlockRuleText(module.unlockRule)}
          </span>
        </Button>
      )}
    </Box>
  );
};
