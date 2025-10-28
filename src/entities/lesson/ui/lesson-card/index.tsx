import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Lesson } from "@/entities";
import { ArrowIcon, Badge, Box } from "@/shared";
import { useNavigate } from "react-router-dom";

interface LessonCardProps {
  lesson: Lesson;
  courseId?: number;
  moduleId?: number;
}

export const LessonCard = ({ lesson, courseId, moduleId }: LessonCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (courseId && moduleId) {
      navigate(
        `/mop/education/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`
      );
    } else {
      // Fallback for cases where courseId/moduleId are not provided
      navigate(`/mop/education/lesson/${lesson.id}`);
    }
  };

  const getButtonText = () => {
    return lesson.completed ? "Повторить" : "Начать урок";
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
        {lesson.completed ? (
          <Badge label="Выполнено" variant="main" />
        ) : (
          <Badge label="Не начат" variant="gray" />
        )}
      </div>

      <p className="text-xs text-base-gray">
        {lesson.shortDesc || "Описание отсутствует"}
      </p>

      <Separator className="bg-[#FFFFFF1A]" />

      <Button className="w-full" size="2s" onClick={handleCardClick}>
        {getButtonText()}
        <ArrowIcon size={18} fill="#FFF" />
      </Button>
    </Box>
  );
};
