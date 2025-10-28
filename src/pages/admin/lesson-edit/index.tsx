import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { FileUploadBlock } from "@/components/ui/file-upload-block";
import InputFloatingLabel from "@/components/ui/inputFloating";
import { Textarea } from "@/components/ui/textarea";
import type { ContentBlock } from "@/entities";
import {
  lessonsMutationOptions,
  lessonsQueryOptions,
  modulesQueryOptions,
} from "@/entities";
import { Box, HeadText, handleFormError } from "@/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Edit,
  File,
  FileText,
  Image,
  Loader2,
  Plus,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const LessonEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lessonId = parseInt(id!);

  const {
    data: lessonData,
    isLoading: lessonLoading,
    error: lessonError,
    refetch,
  } = useQuery(lessonsQueryOptions.byId(lessonId));

  const { data: moduleData } = useQuery(
    modulesQueryOptions.byId(lessonData?.data?.moduleId || 0)
  );

  const module = moduleData?.data;

  const updateLessonMutation = useMutation({
    ...lessonsMutationOptions.update(),
    onSuccess: (result) => {
      if (result.success && result.data) {
        refetch();
        setIsEditing(false);
      } else {
        handleFormError("Не удалось обновить урок", "Попробуйте еще раз");
      }
    },
    onError: (error) => {
      console.error("Error updating lesson:", error);
      handleFormError(error, "Ошибка при обновлении урока");
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    shortDesc: "",
  });
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (lessonData?.data) {
      const lesson = lessonData.data;
      console.log("Initializing lesson data:", lesson);
      console.log("Content blocks from API:", lesson.contentBlocks);

      setFormData({
        title: lesson.title,
        shortDesc: lesson.shortDesc,
      });
      setContentBlocks(lesson.contentBlocks || []);

      console.log("Content blocks after set:", lesson.contentBlocks || []);
    }
  }, [lessonData]); // Добавляем lessonData в зависимости

  const handleEditStart = (): void => {
    setIsEditing(true);
  };

  const handleEditCancel = (): void => {
    if (lessonData?.data) {
      const lesson = lessonData.data;
      setFormData({
        title: lesson.title,
        shortDesc: lesson.shortDesc,
      });
      setContentBlocks(lesson.contentBlocks || []);
    }
    setIsEditing(false);
  };

  const handleSave = async (e?: React.FormEvent): Promise<void> => {
    if (e) e.preventDefault();

    const contentBlocksForSubmit = contentBlocks.map((block) => ({
      orderIndex: block.orderIndex,
      type: block.type,
      textContent: block.textContent,
      storageObjectId: block.storageObjectId || block.storageObject?.id || 0,
    }));

    const submitData = {
      title: formData.title,
      shortDesc: formData.shortDesc,
      contentBlocks: contentBlocksForSubmit,
    };

    console.log("Sending data:", submitData);

    updateLessonMutation.mutate({
      id: lessonId,
      data: submitData,
    });
  };
  const handleChange = (field: string, value: unknown): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addContentBlock = (type: ContentBlock["type"]): void => {
    const newBlock: ContentBlock = {
      orderIndex: contentBlocks.length + 1,
      type,
      textContent: "",
      storageObjectId: 0,
    };
    setContentBlocks((prev) => [...prev, newBlock]);
  };

  const updateContentBlock = (
    index: number,
    field: string,
    value: unknown
  ): void => {
    setContentBlocks((prev) =>
      prev.map((block, i) =>
        i === index ? { ...block, [field]: value } : block
      )
    );
  };

  const removeContentBlock = (index: number): void => {
    setContentBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  const openDrawer = (): void => setIsDrawerOpen(true);
  const closeDrawer = (): void => setIsDrawerOpen(false);

  const handleContentTypeSelect = (type: ContentBlock["type"]): void => {
    addContentBlock(type);
    closeDrawer();
  };

  const isFormValid = formData.title.trim() && formData.shortDesc.trim();

  const contentTypes = [
    {
      type: "TEXT" as const,
      label: "Текстовый блок",
      icon: FileText,
      description: "Добавить текстовый контент",
    },
    {
      type: "IMAGE" as const,
      label: "Изображение",
      icon: Image,
      description: "Загрузить изображение",
    },
    {
      type: "VIDEO" as const,
      label: "Видео",
      icon: Video,
      description: "Загрузить видео файл",
    },
    {
      type: "FILE" as const,
      label: "PDF документ",
      icon: File,
      description: "Загрузить PDF файл",
    },
  ];

  if (lessonLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (lessonError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Ошибка загрузки урока</h2>
          <p className="text-gray-500 mb-4">
            {lessonError instanceof Error
              ? lessonError.message
              : "Неизвестная ошибка"}
          </p>
          <Button onClick={() => window.location.reload()}>
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  if (!lessonData?.data) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Урок не найден</h2>
          <Button onClick={() => navigate(-1)}>Назад</Button>
        </div>
      </div>
    );
  }

  const lesson = lessonData.data;

  // Добавим отладочную информацию
  console.log("Current lesson:", lesson);
  console.log("Current contentBlocks state:", contentBlocks);
  console.log("Lesson contentBlocks from API:", lesson.contentBlocks);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] pb-3 gap-6">
      {/* Шапка с полями названия и описания */}
      <div className="w-full bg-base-bg rounded-b-2xl px-3 py-4">
        <HeadText
          head={isEditing ? "Редактирование урока" : lesson.title}
          label={`Урок модуля "${moduleData?.data?.title || ""}"`}
          className="px-2 mb-6"
        />

        <div className="flex flex-col gap-4">
          {isEditing ? (
            <>
              <InputFloatingLabel
                type="text"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Введите название урока"
                className="w-full"
                required
                variant="second"
              />

              <Textarea
                value={formData.shortDesc}
                onChange={(e) => handleChange("shortDesc", e.target.value)}
                placeholder="Введите описание урока"
                className="w-full resize-none"
                rows={3}
                variant="second"
                required
              />
            </>
          ) : null}
        </div>

        <div className="flex flex-col items-start w-full gap-4 mt-4">
          {!isEditing ? (
            <Button size="sm" className="w-full" onClick={handleEditStart}>
              <Edit className="h-4 w-4 mr-2" />
              Редактировать
            </Button>
          ) : (
            <div className="flex w-full flex-col-reverse gap-2">
              <Button
                className="w-full"
                size="link"
                variant="link"
                onClick={handleEditCancel}
                disabled={updateLessonMutation.isPending}
              >
                Отмена
              </Button>
              <Button
                className="w-full"
                size="2s"
                onClick={handleSave}
                disabled={!isFormValid || updateLessonMutation.isPending}
              >
                {updateLessonMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Сохранение...
                  </>
                ) : (
                  "Сохранить"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Форма с контентом */}
      {isEditing ? (
        <form
          onSubmit={handleSave}
          className="flex flex-col flex-1 gap-6 h-full px-2 overflow-auto"
        >
          {contentBlocks.length > 0 ? (
            <div className="flex flex-col flex-1">
              {/* Блоки контента */}
              <div className="space-y-4 mb-4">
                {contentBlocks.map((block, index) => (
                  <Box
                    key={index}
                    variant="white"
                    align="start"
                    className="p-4 border-2"
                  >
                    <div className="flex items-center w-full justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {block.type === "TEXT" && "Текстовый блок"}
                          {block.type === "AUDIO" && "Аудио блок"}
                          {block.type === "IMAGE" && "Блок изображения"}
                          {block.type === "VIDEO" && "Видео блок"}
                          {block.type === "FILE" && "Блок файла"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="link"
                          size="link"
                          className="text-base-red"
                          onClick={() => removeContentBlock(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {block.type === "TEXT" && (
                      <Textarea
                        value={block.textContent || ""}
                        onChange={(e) =>
                          updateContentBlock(
                            index,
                            "textContent",
                            e.target.value
                          )
                        }
                        placeholder="Введите текст контента..."
                        rows={6}
                        className="w-full bg-white rounded-2xl"
                      />
                    )}

                    {(block.type === "IMAGE" ||
                      block.type === "VIDEO" ||
                      block.type === "FILE") && (
                      <FileUploadBlock
                        block={block}
                        index={index}
                        onUpdate={updateContentBlock}
                        onRemove={removeContentBlock}
                        isEditing={isEditing}
                      />
                    )}
                  </Box>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Нет контентных блоков для редактирования</p>
            </div>
          )}

          <Button
            variant="bordered"
            type="button"
            text="main"
            className="w-full"
            onClick={openDrawer}
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить раздел
          </Button>

          <Button
            type="submit"
            className="w-full"
            disabled={!isFormValid || updateLessonMutation.isPending}
          >
            {updateLessonMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Сохранение...
              </>
            ) : (
              "Сохранить изменения"
            )}
          </Button>
        </form>
      ) : (
        // Режим просмотра
        <div className="flex flex-col flex-1 gap-6 h-full px-2">
          {contentBlocks.length > 0 ? (
            <div className="space-y-4">
              {contentBlocks.map((block, index) => (
                <Box
                  key={index}
                  variant="white"
                  align="start"
                  className="p-4 border-2"
                >
                  <div className="flex items-center w-full justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                        {block.orderIndex}
                      </span>
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {block.type === "TEXT" && "Текстовый блок"}
                        {block.type === "AUDIO" && "Аудио блок"}
                        {block.type === "IMAGE" && "Блок изображения"}
                        {block.type === "VIDEO" && "Видео блок"}
                        {block.type === "FILE" && "Блок файла"}
                      </span>
                    </div>
                  </div>

                  {block.type === "TEXT" && (
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {block.textContent || (
                          <span className="text-gray-400">
                            Текст не заполнен
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  {(block.type === "IMAGE" ||
                    block.type === "VIDEO" ||
                    block.type === "FILE") && (
                    <FileUploadBlock
                      block={block}
                      index={index}
                      onUpdate={updateContentBlock}
                      onRemove={removeContentBlock}
                      isEditing={isEditing}
                    />
                  )}
                </Box>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
              <p className="mb-2">В этом уроке пока нет контента</p>
              <Button onClick={handleEditStart}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить контент
              </Button>
            </div>
          )}

          {lesson.quizId === 0 && module && (
            <Button
              onClick={() =>
                navigate(
                  `/admin/content/courses/${module.courseId}/modules/${lesson.moduleId}/lessons/${lessonId}/quizzes/create`
                )
              }
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Создать тест для урока
            </Button>
          )}

          {lesson.quizId > 0 && module && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex flex-col w-full gap-3 justify-between">
                <div>
                  <h4 className="text-sm font-medium text-green-900">
                    Тест прикреплен к уроку
                  </h4>
                </div>
                <Button
                  size="sm"
                  onClick={() =>
                    navigate(
                      `/admin/content/courses/${module.courseId}/modules/${lesson.moduleId}/lessons/${lessonId}/quizzes/${lesson.quizId}/edit`
                    )
                  }
                >
                  Редактировать тест
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Drawer для выбора типа контента (только в режиме редактирования) */}
      {isEditing && (
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent className="max-h-[80vh]">
            <DrawerHeader className="text-left">
              <DrawerTitle>Выберите тип контента</DrawerTitle>
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  className="absolute right-4 top-4"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </DrawerHeader>
            <div className="p-4 pb-6">
              <div className="space-y-2">
                {contentTypes.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Button
                      key={item.type}
                      variant="ghost"
                      className="w-full justify-start h-16 px-4"
                      onClick={() => handleContentTypeSelect(item.type)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-10 h-10 bg-base-opacity10-main rounded-lg flex items-center justify-center">
                          <IconComponent className="h-5 w-5 text-base-main" />
                        </div>
                        <div className="flex text-black flex-col items-start">
                          <span className="text-sm font-medium">
                            {item.label}
                          </span>
                          <span className="text-xs text-base-gray">
                            {item.description}
                          </span>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
};
