import { modulesQueryOptions } from "@/entities";
import { ClientLessonsList } from "@/feature/education-feature/client-lessons-list";
import { HeaderWithClose } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export const ClientLessonsPage = () => {
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
        </div>
      </div>
    );
  }

  return (
    <div className="bg-second-bg px-2 min-h-full pb-3 pt-4">
      <HeaderWithClose
        title={moduleResponse?.data.title || ""}
        description={moduleResponse?.data.shortDesc || ""}
        onClose={() => navigate("/client/education/courses")}
        variant="dark"
      />

      <div className="px-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Уроков: {moduleResponse?.data.lessonsCount}</span>
          <span>•</span>
          <span>
            Тип:{" "}
            {moduleResponse?.data.testVariant === "QUIZ"
              ? "С тестом"
              : "Без теста"}
          </span>
        </div>
      </div>

      <ClientLessonsList moduleId={Number(moduleId)} />
    </div>
  );
};
