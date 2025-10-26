import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { ScenarioListItem } from "@/entities";
import { ArrowIcon, Badge, Box } from "@/shared";
import { X } from "lucide-react";
import type { FC } from "react";
import { useNavigate } from "react-router-dom";

interface Skill {
  id: number;
  name: string;
}

interface ScenarioCardData extends ScenarioListItem {
  skills?: Skill[];
}

interface ScenarioCardProps {
  data: ScenarioCardData;
  onDelete: (id: number, title: string) => void;
}

export const ScenarioCard: FC<ScenarioCardProps> = ({ data, onDelete }) => {
  const navigate = useNavigate();

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
      <div className="flex items-center w-full justify-between text-white">
        <div className="flex flex-col">
          <p className="text-lg font-medium leading-[100%]">
            {data.title} (#{data.id})
          </p>
          <p className="text-sm text-base-gray">Версия {data.version}</p>
        </div>

        <div className="flex items-center gap-2">
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
        <div className="flex flex-wrap gap-2">
          {data.skills.map((skill) => (
            <Badge key={skill.id} label={skill.name} variant="gray" size="md" />
          ))}
        </div>
      )}

      <Separator className="bg-[#FFFFFF1A]" />

      <div className="flex w-full items-center gap-2">
        <Button
          variant="main-opacity"
          text="main"
          className="flex-1 cursor-pointer"
          size="2s"
          onClick={() => navigate(`/admin/scenarios/edit/${data.id}`)}
        >
          Редактировать <ArrowIcon />
        </Button>
        <Button
          variant="second"
          className="flex-1 cursor-pointer"
          size="2s"
          onClick={() => navigate(`/admin/scenarios/view/${data.id}`)}
        >
          Просмотр
        </Button>
      </div>
    </Box>
  );
};
