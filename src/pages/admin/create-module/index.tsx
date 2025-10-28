import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InputFloatingLabel from "@/components/ui/inputFloating";
import { SelectFloatingLabel } from "@/components/ui/selectFloating";
import { Textarea } from "@/components/ui/textarea";
import { modulesMutationOptions, modulesQueryOptions } from "@/entities";
import { quizzesMutationOptions, type QuizQuestion } from "@/entities";
import {
  HeadText,
  HeaderWithClose,
  handleFormSuccess,
  handleFormError,
} from "@/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const CreateModulePage = () => {
  const { courseId: courseIdParam } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const courseId = parseInt(courseIdParam!, 10);

  const { data: modulesData } = useQuery(
    modulesQueryOptions.byCourse(courseId)
  );

  const modules = modulesData?.data || [];

  const nextOrderIndex = modules.length + 1;

  const [formData, setFormData] = useState({
    title: "",
    shortDesc: "",
    testVariant: "NONE" as "NONE" | "QUIZ",
    unlockRule: "ALL" as "ALL" | "LEVEL_3" | "LEVEL_4" | "AFTER_PREV_MODULE",
  });

  const [quizFormData, setQuizFormData] = useState({
    passThresholdPercent: 70,
    questions: [] as QuizQuestion[],
  });

  const createModuleMutation = useMutation({
    ...modulesMutationOptions.create(),
    onSuccess: (result) => {
      if (result.success && result.data) {
        handleFormSuccess("Модуль успешно создан");
        navigate(`/admin/content/courses/${courseId}/edit`);
      } else {
        handleFormError("Не удалось создать модуль", "Попробуйте еще раз");
      }
    },
    onError: (error) => {
      console.error("Error creating module:", error);
      handleFormError(error, "Ошибка при создании модуля");
    },
  });

  const createQuizMutation = useMutation({
    ...quizzesMutationOptions.create(),
    onError: (error) => {
      console.error("Error creating quiz:", error);
      handleFormError(error, "Ошибка при создании теста");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let quizIdToAttach = 0;

    if (formData.testVariant === "QUIZ") {
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
        handleFormError("Не удалось создать тест", "Попробуйте еще раз");
        return;
      }
      quizIdToAttach = quizResult.data.id;
    }

    const submitData = {
      ...formData,
      courseId,
      quizId: quizIdToAttach,
      orderIndex: nextOrderIndex,
    };

    createModuleMutation.mutate(submitData);
  };

  const handleChange = (field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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

  // Опции для селектов
  const testVariantOptions = [
    { value: "NONE", label: "Нет тестирования" },
    { value: "QUIZ", label: "Тест (квиз)" },
  ];

  const unlockRuleOptions = [
    { value: "ALL", label: "Всем" },
    { value: "LEVEL_3", label: "От уровня 3 и выше" },
    { value: "LEVEL_4", label: "От уровня 4 и выше" },
    {
      value: "AFTER_PREV_MODULE",
      label: "После прохождения предыдущего модуля",
    },
  ];

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
    formData.shortDesc.length <= 1000 &&
    (formData.testVariant === "NONE" ||
      (formData.testVariant === "QUIZ" && isQuizValid));

  const remainingChars = 1000 - formData.shortDesc.length;
  const isNearLimit = remainingChars <= 20;
  const isOverLimit = remainingChars < 0;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] pb-3 pt-6 gap-6 px-2">
      <HeaderWithClose
        title="Создание модуля"
        description="Заполните данные модуля"
        onClose={() => navigate(`/admin/content/courses/${courseId}/edit`)}
        variant="light"
        className="px-2"
      />

      <form
        onSubmit={handleSubmit}
        className="flex flex-col flex-1 gap-6 h-full"
      >
        <div className="flex flex-col gap-6 flex-1 overflow-auto">
          {/* Название модуля */}
          <InputFloatingLabel
            type="text"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Введите название модуля"
            className="w-full"
            required
          />

          {/* Описание */}
          <div className="relative">
            <Textarea
              value={formData.shortDesc}
              onChange={(e) => handleChange("shortDesc", e.target.value)}
              placeholder="Введите описание модуля"
              className={`w-full resize-none pr-16 ${
                isOverLimit ? "border-red-300 focus:border-red-500" : ""
              }`}
              rows={4}
              maxLength={1000}
              required
            />
            <div
              className={`absolute bottom-2 right-2 text-xs ${
                isOverLimit
                  ? "text-red-500 font-semibold"
                  : isNearLimit
                  ? "text-amber-500"
                  : "text-gray-400"
              }`}
            >
              {remainingChars}
            </div>
          </div>
          {isOverLimit && (
            <p className="text-xs text-red-500 -mt-4">
              Превышено максимальное количество символов
            </p>
          )}

          {/* Вариант тестирования */}
          <SelectFloatingLabel
            placeholder="Выберите вариант тестирования"
            value={formData.testVariant}
            onValueChange={(value) => handleChange("testVariant", value)}
            options={testVariantOptions}
            variant="default"
            className="w-full"
          />

          {/* Quiz Form - shown when testVariant is QUIZ */}
          {formData.testVariant === "QUIZ" && (
            <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
              <div className="w-full">
                <HeadText
                  head="Тест"
                  label="Настройте тест для модуля"
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
                    createModuleMutation.isPending ||
                    createQuizMutation.isPending
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
                    createModuleMutation.isPending ||
                    createQuizMutation.isPending
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Минимальный процент правильных ответов для успешного
                  прохождения
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Вопросы теста ({quizFormData.questions.length})
                  </label>
                </div>

                {quizFormData.questions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg bg-white">
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
                              createModuleMutation.isPending ||
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
                            createModuleMutation.isPending ||
                            createQuizMutation.isPending
                          }
                        />

                        <div className="space-y-3 w-full">
                          {question.options.map((option, oIndex) => (
                            <div
                              key={oIndex}
                              className="flex items-center gap-2"
                            >
                              <Input
                                type="radio"
                                name={`question-${qIndex}`}
                                checked={option.isCorrect}
                                onChange={() =>
                                  setQuizCorrectAnswer(qIndex, oIndex)
                                }
                                className="w-3 h-3"
                                disabled={
                                  createModuleMutation.isPending ||
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
                                  createModuleMutation.isPending ||
                                  createQuizMutation.isPending
                                }
                              />
                              {question.options.length > 2 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    removeQuizOption(qIndex, oIndex)
                                  }
                                  disabled={
                                    createModuleMutation.isPending ||
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
                                createModuleMutation.isPending ||
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
          )}

          {/* Уровень доступа */}
          <SelectFloatingLabel
            placeholder="Выберите уровень доступа"
            value={formData.unlockRule}
            onValueChange={(value) => handleChange("unlockRule", value)}
            options={unlockRuleOptions}
            variant="default"
            className="w-full"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={
            !isFormValid ||
            createModuleMutation.isPending ||
            createQuizMutation.isPending
          }
        >
          {createModuleMutation.isPending || createQuizMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Создание...
            </>
          ) : (
            "Создать модуль"
          )}
        </Button>
      </form>
    </div>
  );
};
