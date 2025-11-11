import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { ScenarioListItem } from "@/entities";
import { ArrowIcon, Badge, Box } from "@/shared";
import { X } from "lucide-react";
import { useState, type FC } from "react";
import { useNavigate } from "react-router-dom";

interface ScenarioCardProps {
  data: ScenarioListItem;
  onDelete: (id: number, title: string) => void;
}

export const ScenarioCard: FC<ScenarioCardProps> = ({ data, onDelete }) => {
  const navigate = useNavigate();
  const [skillsExpanded, setSkillsExpanded] = useState(false);

  const getSkillDeclension = (count: number) => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
      return "навыков";
    }

    if (lastDigit === 1) {
      return "навык";
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
      return "навыка";
    }

    return "навыков";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Box variant="dark" justify="start" className="gap-3 p-3">
      <div className="flex flex-col gap-1 w-full text-white">
        <div className="flex items-center w-full justify-between">
          <p className="text-lg font-medium leading-[100%]">
            {data.title} (#{data.id})
          </p>
          <button
            onClick={() => onDelete(data.id, data.title)}
            className="
              p-1 rounded-full hover:bg-white/10 transition-colors
              flex items-center justify-center
            "
            title="Удалить сценарий"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
        <p className="text-sm text-base-gray">Версия {data.version}</p>
      </div>

      <div className="w-full flex items-center gap-1">
        <Badge
          variant="gray-opacity"
          label={`Создан: ${formatDate(data.createdAt)}`}
        />
        <Badge
          variant="gray-opacity"
          label={`Обновлен: ${formatDate(data.updatedAt)}`}
        />
      </div>

      {/* Skills section */}
      {data.skills && data.skills.length > 0 && (
        <div className="flex flex-col gap-2 w-full">
          <p className="text-sm text-white/80 font-medium">Навыки:</p>
          <div className="flex flex-wrap gap-2 justify-start">
            {(skillsExpanded ? data.skills : data.skills.slice(0, 4)).map((skill) => (
              <Badge
                key={skill.id}
                label={skill.name}
                variant="gray"
                size="md"
              />
            ))}
            {!skillsExpanded && data.skills.length > 4 && (
              <Badge
                label={`+${data.skills.length - 4} ${getSkillDeclension(
                  data.skills.length - 4
                )}`}
                variant="gray"
                size="md"
                className="cursor-pointer hover:bg-white/20 transition-colors"
                onClick={() => setSkillsExpanded(true)}
              />
            )}
          </div>
          {data.skills.length > 4 && (
            <button
              onClick={() => setSkillsExpanded((prev) => !prev)}
              className="text-xs text-white/80 hover:underline self-start"
            >
              {skillsExpanded ? "Скрыть" : "Показать все"}
            </button>
          )}
        </div>
      )}

      <Separator className="bg-[#FFFFFF1A]" />

      <div className="flex w-full items-center gap-2">
        <Button
          variant="main-opacity"
          text="main"
          className="flex-1 cursor-pointer"
          size="2s"
          onClick={() => navigate(`/admin/content/scenarios/${data.id}/edit`)}
        >
          Редактировать <ArrowIcon />
        </Button>
        <Button
          variant="second"
          className="flex-1 cursor-pointer"
          size="2s"
          onClick={() => navigate(`/admin/content/scenarios/${data.id}/view`)}
        >
          Просмотр
        </Button>
      </div>
    </Box>
  );
};
