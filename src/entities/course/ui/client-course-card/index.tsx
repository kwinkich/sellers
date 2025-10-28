import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Course } from "@/entities";
import { ArrowIcon, Badge, Box } from "@/shared";
import { EyeIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ClientCourseCardProps {
  course: Course;
  isOpen?: boolean;
}

export const ClientCourseCard = ({
  course,
  isOpen = false,
}: ClientCourseCardProps) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU");
  };

  const handleCardClick = () => {
    if (!isOpen) return;
    navigate(`/client/education/courses/${course.id}`);
  };

  const getButtonText = () => {
    if (!isOpen) return "Заблокировано";
    return "Просмотреть курс";
  };

  return (
    <Box
      className="p-3 cursor-pointer hover:shadow-lg transition-shadow"
      variant="dark"
      align="start"
    >
      <div
        className="w-full flex items-start justify-between"
        onClick={handleCardClick}
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
        <Badge label="Просмотр" variant="gray" />
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
          <EyeIcon size={18} className="mr-2" />
          {getButtonText()}
          <ArrowIcon size={18} fill="#FFF" />
        </Button>
      ) : (
        <Button variant="second" className="w-full" size="2s" disabled>
          <EyeIcon size={18} className="mr-2" />
          Доступ ограничен
        </Button>
      )}
    </Box>
  );
};
