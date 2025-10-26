import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { ClientListItem } from "@/entities";
import { ArrowIcon, Badge, Box, openTelegramContact } from "@/shared";
import type { FC } from "react";
import { useNavigate } from "react-router-dom";

export const ClientCard: FC<{ data: ClientListItem }> = ({ data }) => {
  const navigate = useNavigate();

  const formatDaysLeft = (days: number) => {
    if (days === 0) return "0 д.";
    if (days === 1) return "1 д.";
    if (days < 0) return "Истекла";
    return `${days} д.`;
  };

  const getDaysBadgeVariant = (days: number) => {
    if (days <= 0) return "red-opacity";
    if (days <= 3) return "red-opacity";
    if (days <= 7) return "main-opacity";
    return "gray-opacity";
  };

  return (
    <Box variant="dark" justify="start" className="gap-3 p-3">
      <div className="flex items-center w-full justify-between text-white">
        <p className="text-lg font-medium leading-[100%]">
          {data.companyName} (#{data.id})
        </p>

        <Badge
          variant="main-opacity"
          label={data.level === "LEVEL_3" ? "Уровень 3" : "Уровень 4"}
        />
      </div>

      <div className="w-full flex items-center gap-1">
        <Badge
          variant="gray-opacity"
          label={`${data.licensesTotal} лицензий`}
          onClick={() => navigate(`/admin/clients/licenses/${data.id}`)}
        />
        <Badge
          label={formatDaysLeft(data.daysLeftNearest)}
          variant={getDaysBadgeVariant(data.daysLeftNearest)}
        />
      </div>

      <Separator className="bg-[#FFFFFF1A]" />

      <div className="flex w-full items-center gap-2">
        <Button
          onClick={() => openTelegramContact(data.tgLink)}
          size="2s"
          variant="main-opacity"
          text="main"
          className="flex-1 cursor-pointer"
        >
          Написать <ArrowIcon />
        </Button>
        <Button
          variant="second"
          className="flex-1 cursor-pointer"
          size="2s"
          onClick={() => navigate(`/admin/clients/update/${data.id}`)}
        >
          Редактировать
        </Button>
      </div>
    </Box>
  );
};
