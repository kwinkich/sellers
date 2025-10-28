import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Lesson } from "@/entities";
import { ArrowIcon, Badge, Box } from "@/shared";
import { EyeIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ClientLessonCardProps {
  lesson: Lesson;
}

export const ClientLessonCard = ({ lesson }: ClientLessonCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/client/education/lesson/${lesson.id}`);
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
            label={`Урок ${lesson.orderIndex}`}
            variant="gray-opacity"
            className="w-max"
          />
          <p className="text-lg font-medium text-white hover:text-blue-200 transition-colors">
            {lesson.title}
          </p>
        </div>
        <Badge label="Просмотр" variant="gray" />
      </div>

      <p className="text-xs text-base-gray">
        {lesson.shortDesc || "Описание отсутствует"}
      </p>

      <Separator className="bg-[#FFFFFF1A]" />

      <Button className="w-full" size="2s" onClick={handleCardClick}>
        <EyeIcon size={18} className="mr-2" />
        Просмотреть урок
        <ArrowIcon size={18} fill="#FFF" />
      </Button>
    </Box>
  );
};
