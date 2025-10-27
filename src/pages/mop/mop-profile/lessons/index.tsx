import { modulesQueryOptions } from "@/entities";
import { LessonsList } from "@/feature/education-feature/lessons-list";
import { HeadText } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const MopLessonsPage = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();

  const {
    data: moduleResponse,
    isLoading: isModuleLoading,
    error: moduleError,
  } = useQuery(modulesQueryOptions.byId(Number(moduleId)));

  if (isModuleLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (moduleError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Ошибка загрузки модуля</h2>
          <p className="text-gray-500">{moduleError?.message}</p>
        </div>
      </div>
    );
  }

  if (!moduleId) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Модуль не найден</h2>
          <p className="text-gray-500">Пожалуйста, выберите модуль из списка</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-second-bg px-2 min-h-full pb-3 pt-4">
      <HeadText
        head={moduleResponse?.data.title || ""}
        label={moduleResponse?.data.shortDesc || ""}
        className="px-2 mb-4"
      />

      <div className="px-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Уроков: {moduleResponse?.data.lessonsCount}</span>
          <span>•</span>
          <span>Прогресс: {moduleResponse?.data.progressPercent}%</span>
        </div>
      </div>

      <LessonsList moduleId={Number(moduleId)} />

      {moduleResponse?.data.testVariant === "QUIZ" &&
        moduleResponse?.data.quizId && (
          <div className="px-2 mt-6">
            <Button
              type="button"
              size="xs"
              className="w-full"
              onClick={() =>
                navigate(`/mop/education/quizzes/${moduleResponse.data.quizId}`)
              }
            >
              Пройти тест
            </Button>
          </div>
        )}
    </div>
  );
};
