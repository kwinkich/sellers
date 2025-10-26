import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { CaseListItem } from "@/entities";
import { ArrowIcon, Badge, Box, getSellerLevelLabel } from "@/shared";
import { X } from "lucide-react";
import type { FC } from "react";
import { useNavigate } from "react-router-dom";

interface CaseCardProps {
  data: CaseListItem;
  onDelete: (id: number, title: string) => void;
}

export const CaseCard: FC<CaseCardProps> = ({ data, onDelete }) => {
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
        <p className="text-lg font-medium leading-[100%]">
          {data.title} (#{data.id})
        </p>

        <div className="flex items-center gap-2">
          <Badge
            variant="main-opacity"
            label={getSellerLevelLabel(data.recommendedSellerLevel)}
          />
          <button
            onClick={() => onDelete(data.id, data.title)}
            className="
              p-1 rounded-full hover:bg-white/10 transition-colors
              flex items-center justify-center
            "
            title="Удалить кейс"
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

      <Separator className="bg-[#FFFFFF1A]" />

      <div className="flex w-full items-center gap-2">
        <Button
          variant="main-opacity"
          text="main"
          className="flex-1 cursor-pointer"
          size="2s"
          onClick={() => navigate(`/admin/cases/edit/${data.id}`)}
        >
          Редактировать <ArrowIcon />
        </Button>
        <Button
          variant="second"
          className="flex-1 cursor-pointer"
          size="2s"
          onClick={() => navigate(`/admin/cases/view/${data.id}`)}
        >
          Просмотр
        </Button>
      </div>
    </Box>
  );
};
