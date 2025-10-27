// pages/lesson/CreateLessonPage.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { quizzesMutationOptions, type QuizQuestion } from "@/entities";
import { Box, HeadText } from "@/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  File,
  FileText,
  Image,
  Loader2,
  Plus,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const CreateLessonPage = () => {
  const { moduleId: moduleIdParam } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const moduleId = parseInt(moduleIdParam!, 10);

  const { data: moduleData } = useQuery(modulesQueryOptions.byId(moduleId));
  const { data: lessonsData } = useQuery(
    lessonsQueryOptions.byModule(moduleId)
  );

  const module = moduleData?.data;
  const lessons = lessonsData?.data || [];

  // Автоматически определяем порядковый номер
  const nextOrderIndex = lessons.length + 1;

  const [formData, setFormData] = useState({
    title: "",
    shortDesc: "",
  });

  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Quiz builder state
  const [showQuizBlock, setShowQuizBlock] = useState(false);
  const [quizFormData, setQuizFormData] = useState({
    passThresholdPercent: 70,
    questions: [] as QuizQuestion[],
  });

  const createLessonMutation = useMutation({
    ...lessonsMutationOptions.create(),
    onSuccess: (result) => {
      if (result.success && result.data) {
        navigate(
          `/admin/content/courses/${module?.courseId}/modules/${moduleId}/edit`
        );
      } else {
        alert("Не удалось создать урок. Попробуйте еще раз.");
      }
    },
    onError: (error) => {
      console.error("Error creating lesson:", error);
      alert("Произошла ошибка при создании урока. Попробуйте еще раз.");
    },
  });

  const createQuizMutation = useMutation({
    ...quizzesMutationOptions.create(),
    onError: (error) => {
      console.error("Error creating quiz:", error);
      alert("Произошла ошибка при создании теста. Попробуйте еще раз.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let quizIdToAttach = 0;

    if (showQuizBlock) {
      const quizSubmitData = {
        passThresholdPercent: quizFormData.passThresholdPercent,
        questions: quizFormData.questions.map((q, qIndex) => ({
          ...q,
          order: qIndex + 1,
          options: q.options.map((opt, optIndex) => ({
            ...opt,
            id: opt.id || optIndex + 1,
          })),
        })),
      };

      const quizResult = await createQuizMutation.mutateAsync(quizSubmitData);
      if (!quizResult?.success || !quizResult.data) {
        alert("Не удалось создать тест. Попробуйте еще раз.");
        return;
      }
      quizIdToAttach = quizResult.data.id;
    } else {
      alert("Добавьте тест для урока");
      return;
    }

    const submitData = {
      ...formData,
      moduleId,
      quizId: quizIdToAttach,
      contentBlocks,
      orderIndex: nextOrderIndex,
    };

    createLessonMutation.mutate(submitData);
  };

  // Removed handleCreateTest — no longer used after automatic redirect

  const handleChange = (field: string, value: unknown) => {
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

  // Quiz builder helpers
  const addQuizQuestion = (): void => {
    const newQuestion: QuizQuestion = {
      text: "",
      order: quizFormData.questions.length + 1,
      options: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
    };
    setQuizFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const updateQuizQuestion = (
    index: number,
    field: string,
    value: unknown
  ): void => {
    setQuizFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      ),
    }));
  };

  const updateQuizOption = (
    questionIndex: number,
    optionIndex: number,
    field: string,
    value: unknown
  ): void => {
    setQuizFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              options: q.options.map((opt, j) =>
                j === optionIndex ? { ...opt, [field]: value } : opt
              ),
            }
          : q
      ),
    }));
  };

  const addQuizOption = (questionIndex: number): void => {
    setQuizFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              options: [...q.options, { text: "", isCorrect: false }],
            }
          : q
      ),
    }));
  };

  const removeQuizQuestion = (index: number): void => {
    setQuizFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const removeQuizOption = (
    questionIndex: number,
    optionIndex: number
  ): void => {
    setQuizFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              options: q.options.filter((_, j) => j !== optionIndex),
            }
          : q
      ),
    }));
  };

  const setQuizCorrectAnswer = (
    questionIndex: number,
    optionIndex: number
  ): void => {
    setQuizFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              options: q.options.map((opt, j) => ({
                ...opt,
                isCorrect: j === optionIndex,
              })),
            }
          : q
      ),
    }));
  };

  const isQuizValid =
    quizFormData.questions.length > 0 &&
    quizFormData.questions.every(
      (q) =>
        q.text.trim() &&
        q.options.length >= 2 &&
        q.options.every((opt) => opt.text.trim()) &&
        q.options.some((opt) => opt.isCorrect)
    );

  const isFormValid =
    formData.title.trim() &&
    formData.shortDesc.trim() &&
    showQuizBlock &&
    isQuizValid;

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

  // Removed success screen — automatic redirect happens on successful creation

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] pb-3 gap-6">
      {/* Шапка с полями названия и описания */}
      <div className="w-full bg-base-bg rounded-b-2xl px-3 py-4">
        <HeadText
          head="Создание урока"
          label={`Для модуля: ${module?.title}`}
          className="px-2 mb-4"
        />

        <div className="flex flex-col gap-4">
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
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col flex-1 gap-6 h-full px-2 overflow-auto"
      >
        {/* Content Blocks Section - NOW FIRST */}
        {contentBlocks.length > 0 && (
          <div className="flex flex-col flex-1">
            <div className="space-y-4 mb-4">
              {contentBlocks.map((block, index) => (
                <Box
                  key={index}
                  variant="white"
                  align="start"
                  className="p-4 border-2"
                >
                  <div className="flex items-center w-full justify-between mb-4">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {block.type === "TEXT" && "Текстовый блок"}
                      {block.type === "AUDIO" && "Аудио блок"}
                      {block.type === "IMAGE" && "Блок изображения"}
                      {block.type === "VIDEO" && "Видео блок"}
                      {block.type === "FILE" && "Блок файла"}
                    </span>
                    <Button
                      type="button"
                      variant="link"
                      size="link"
                      className="text-base-red"
                      onClick={() => removeContentBlock(index)}
                    >
                      Удалить
                    </Button>
                  </div>

                  {block.type === "TEXT" && (
                    <Textarea
                      value={block.textContent || ""}
                      onChange={(e) =>
                        updateContentBlock(index, "textContent", e.target.value)
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
                    />
                  )}
                </Box>
              ))}
            </div>
          </div>
        )}

        {/* Add Section Button */}
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

        {/* Quiz Block Section - NOW SECOND */}
        {showQuizBlock ? (
          <div className="space-y-4">
            <div className="w-full rounded-2xl px-1">
              <HeadText
                head="Тест"
                label="Настройте тест для урока"
                className="px-2 mb-4"
                variant="black-black"
              />
              <Button
                type="button"
                className="w-full"
                size="xs"
                variant="default"
                onClick={addQuizQuestion}
                disabled={
                  createLessonMutation.isPending || createQuizMutation.isPending
                }
              >
                Добавить вопрос
              </Button>
            </div>

            <div>
              <InputFloatingLabel
                type="number"
                value={quizFormData.passThresholdPercent.toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = value === "" ? 0 : parseInt(value, 10);
                  if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
                    setQuizFormData((prev) => ({
                      ...prev,
                      passThresholdPercent: numValue,
                    }));
                  }
                }}
                min="1"
                max="100"
                placeholder="Порог прохождения (%)"
                className="w-full"
                disabled={
                  createLessonMutation.isPending || createQuizMutation.isPending
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Минимальный процент правильных ответов для успешного прохождения
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Вопросы теста ({quizFormData.questions.length})
                </label>
              </div>

              {quizFormData.questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                  <p className="mb-2">Нет добавленных вопросов</p>
                  <p className="text-sm">
                    Нажмите «Добавить вопрос» чтобы начать
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {quizFormData.questions.map((question, qIndex) => (
                    <div
                      key={qIndex}
                      className="border rounded-lg p-4 bg-white shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          Вопрос {qIndex + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuizQuestion(qIndex)}
                          disabled={
                            createLessonMutation.isPending ||
                            createQuizMutation.isPending
                          }
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>

                      <InputFloatingLabel
                        value={question.text}
                        onChange={(e) =>
                          updateQuizQuestion(qIndex, "text", e.target.value)
                        }
                        placeholder="Введите текст вопроса..."
                        className="w-full mb-4"
                        disabled={
                          createLessonMutation.isPending ||
                          createQuizMutation.isPending
                        }
                      />

                      <div className="space-y-3 w-full">
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-2">
                            <Input
                              type="radio"
                              name={`question-${qIndex}`}
                              checked={option.isCorrect}
                              onChange={() =>
                                setQuizCorrectAnswer(qIndex, oIndex)
                              }
                              className="w-3 h-3"
                              disabled={
                                createLessonMutation.isPending ||
                                createQuizMutation.isPending
                              }
                            />
                            <Input
                              value={option.text}
                              onChange={(e) =>
                                updateQuizOption(
                                  qIndex,
                                  oIndex,
                                  "text",
                                  e.target.value
                                )
                              }
                              placeholder="Текст варианта ответа..."
                              className="flex-1 border-0 focus:ring-0"
                              disabled={
                                createLessonMutation.isPending ||
                                createQuizMutation.isPending
                              }
                            />
                            {question.options.length > 2 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeQuizOption(qIndex, oIndex)}
                                disabled={
                                  createLessonMutation.isPending ||
                                  createQuizMutation.isPending
                                }
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <div className="flex flex-col-reverse w-full items-start gap-2">
                          <label className="text-xs text-gray-500">
                            Варианты ответов * (минимум 2)
                          </label>
                          <Button
                            type="button"
                            className="w-full"
                            size="xs"
                            onClick={() => addQuizOption(qIndex)}
                            disabled={
                              createLessonMutation.isPending ||
                              createQuizMutation.isPending
                            }
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Добавить вариант
                          </Button>
                        </div>
                        {!question.text.trim() && (
                          <p className="text-xs text-red-500">
                            Введите текст вопроса
                          </p>
                        )}
                        {question.options.some((opt) => !opt.text.trim()) && (
                          <p className="text-xs text-red-500">
                            Все варианты ответов должны быть заполнены
                          </p>
                        )}
                        {!question.options.some((opt) => opt.isCorrect) && (
                          <p className="text-xs text-red-500">
                            Укажите правильный вариант ответа
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <Button
            variant="bordered"
            type="button"
            text="main"
            className="w-full"
            onClick={() => setShowQuizBlock(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить тест
          </Button>
        )}

        {/* Submit Button - Stays at the end */}
        <Button
          type="submit"
          className="w-full"
          disabled={
            !isFormValid ||
            createLessonMutation.isPending ||
            createQuizMutation.isPending
          }
        >
          {createLessonMutation.isPending || createQuizMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Создание...
            </>
          ) : (
            "Создать урок"
          )}
        </Button>
      </form>

      {/* Drawer для выбора типа контента */}
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
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium text-black">
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
    </div>
  );
};
