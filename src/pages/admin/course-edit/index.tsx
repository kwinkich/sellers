import { Button } from "@/components/ui/button";
import {
  coursesQueryOptions,
  modulesQueryOptions,
  modulesMutationOptions,
  type Module,
} from "@/entities";
import { Badge, Box, HeadText, ConfirmationDialog } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";

export const CourseEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const courseId = parseInt(id!);
  const queryClient = useQueryClient();
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    moduleId: number | null;
    moduleTitle: string | null;
  }>({ isOpen: false, moduleId: null, moduleTitle: null });

  const { mutate: deleteModule, isPending: isDeleting } = useMutation({
    ...modulesMutationOptions.delete(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["modules", "by-course", courseId],
      });
      toast.success("Модуль удалён");
      setConfirmState({ isOpen: false, moduleId: null, moduleTitle: null });
    },
    onError: () => {
      toast.error("Не удалось удалить модуль");
    },
  });

  const {
    data: courseData,
    isLoading: courseLoading,
    error: courseError,
  } = useQuery(coursesQueryOptions.byId(courseId));

  const {
    data: modulesData,
    isLoading: modulesLoading,
    error: modulesError,
  } = useQuery(modulesQueryOptions.byCourse(courseId));

  const course = courseData?.data;
  const modules: Module[] = modulesData?.data || [];

  if (courseLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (courseError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Ошибка загрузки курса</h2>
          <p className="text-gray-500 mb-4">
            {courseError instanceof Error
              ? courseError.message
              : "Неизвестная ошибка"}
          </p>
          <Button onClick={() => window.location.reload()}>
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Курс не найден</h2>
          <Button onClick={() => navigate("/admin/content/courses")}>
            Вернуться к списку курсов
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] pb-3">
      {/* Шапка с названием курса */}
      <div className="w-full bg-base-bg rounded-b-3xl px-3 py-4 mb-6">
        <div className="flex items-center justify-between px-2 mb-6">
          <HeadText
            head={course.title}
            label="Редактирование курса"
            className="px-0 mb-0"
          />
          <Button
            size="xs"
            className="text-base-main bg-transparent text-md"
            onClick={() =>
              navigate(`/admin/content/courses/${courseId}/detail-edit`)
            }
          >
            изменить
          </Button>
        </div>
        <Button
          onClick={() =>
            navigate(`/admin/content/courses/${courseId}/modules/create`)
          }
          className="w-full"
          size="xs"
          text="white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Добавить модуль
        </Button>
      </div>

      {/* Список модулей */}
      <div className="flex-1 overflow-auto px-4">
        <h3 className="text-lg font-semibold mb-4">Модули курса</h3>

        {modulesLoading ? (
          <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : modulesError ? (
          <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center text-center">
            <div>
              <p className="text-red-500 mb-2">Ошибка загрузки модулей</p>
              <Button size="sm" onClick={() => window.location.reload()}>
                Обновить
              </Button>
            </div>
          </div>
        ) : modules.length === 0 ? (
          <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center text-gray-500">
            Модулей пока нет. Добавьте первый модуль.
          </div>
        ) : (
          <div className="space-y-3">
            {modules.map((module) => (
              <Box
                variant="white"
                align="start"
                key={module.id}
                className="p-3"
              >
                <div className="flex w-full items-center justify-between">
                  <Badge
                    variant="gray-opacity"
                    label={`Модуль ${module.orderIndex}`}
                  />
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="gray-opacity"
                      label={`Количество уроков: ${module.lessonsCount}`}
                    />
                    <button
                      onClick={() =>
                        setConfirmState({
                          isOpen: true,
                          moduleId: module.id,
                          moduleTitle: module.title,
                        })
                      }
                      disabled={isDeleting}
                      className="disabled:opacity-50 w-6 h-6 rounded-full items-center flex justify-center"
                      aria-label="Удалить модуль"
                    >
                      <X className="w-4 h-4 text-black" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-start gap-1 mb-4">
                  <h4 className="text-lg font-medium text-black leading-[100%]">
                    {module.title}
                  </h4>
                  <p className="text-xs leading-[100%] text-base-gray ">
                    {module.shortDesc}
                  </p>
                </div>

                <Button
                  size="2s"
                  variant="second"
                  className="w-full"
                  onClick={() =>
                    navigate(
                      `/admin/content/courses/${courseId}/modules/${module.id}/edit`
                    )
                  }
                >
                  Редактировать
                </Button>
              </Box>
            ))}
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={confirmState.isOpen}
        onClose={() =>
          setConfirmState({ isOpen: false, moduleId: null, moduleTitle: null })
        }
        onConfirm={() =>
          confirmState.moduleId && deleteModule(confirmState.moduleId)
        }
        title="Удалить модуль"
        description={`Вы уверены, что хотите удалить модуль ${
          confirmState.moduleTitle ?? ""
        }? Это действие необратимо.`}
        confirmText="Удалить"
        isLoading={isDeleting}
        userName={confirmState.moduleTitle ?? undefined}
        showCancelButton={false}
        severity="destructive"
      />
    </div>
  );
};
