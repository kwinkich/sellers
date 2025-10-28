import { Button } from "@/components/ui/button";
import InputFloatingLabel from "@/components/ui/inputFloating";
import { SelectFloatingLabel } from "@/components/ui/selectFloating";
import { Textarea } from "@/components/ui/textarea";
import { modulesMutationOptions, modulesQueryOptions } from "@/entities";
import { quizzesMutationOptions, type QuizQuestion } from "@/entities";
import { Input } from "@/components/ui/input";
import { HeadText, handleFormError } from "@/shared";
import { Plus, Trash2 } from "lucide-react";
import { HeaderWithClose } from "@/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const ModuleDetailEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const moduleId = parseInt(id!);

  const { data: moduleData, isLoading: isModuleLoading } = useQuery(
    modulesQueryOptions.byId(moduleId)
  );

  const module = moduleData?.data;
  const hadQuizInitially = module?.testVariant === "QUIZ";

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

  useEffect(() => {
    if (moduleData?.data) {
      const incomingVariant = moduleData.data.testVariant;
      const normalizedVariant = incomingVariant === "QUIZ" ? "QUIZ" : "NONE";
      setFormData({
        title: moduleData.data.title,
        shortDesc: moduleData.data.shortDesc,
        testVariant: normalizedVariant,
        unlockRule: moduleData.data.unlockRule,
      });
    }
  }, [moduleData?.data]);

  const updateModuleMutation = useMutation({
    ...modulesMutationOptions.update(),
    onSuccess: () => {
      if (module) {
        navigate(
          `/admin/content/courses/${module.courseId}/modules/${moduleId}/edit`
        );
      }
    },
  });

  const createQuizMutation = useMutation({
    ...quizzesMutationOptions.create(),
    onError: (error) => {
      console.error("Error creating quiz:", error);
      handleFormError(error, "Ошибка при создании теста");
    },
  });

  const handleChange = (field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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
      (formData.testVariant === "QUIZ" && (hadQuizInitially || isQuizValid)));

  const remainingChars = 1000 - formData.shortDesc.length;
  const isNearLimit = remainingChars <= 20;
  const isOverLimit = remainingChars < 0;

  if (isModuleLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] pb-3 pt-4 gap-6 px-2">
      <HeaderWithClose
        title="Редактирование деталей модуля"
        description="Обновите данные модуля"
        onClose={() => {
          if (module) {
            navigate(
              `/admin/content/courses/${module.courseId}/modules/${moduleId}/edit`
            );
          }
        }}
      />

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!module) return;

          const shouldCreateNewQuiz =
            formData.testVariant === "QUIZ" && !hadQuizInitially;
          let quizIdToAttach: number | undefined = undefined;

          if (shouldCreateNewQuiz) {
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

            const quizResult = await createQuizMutation.mutateAsync(
              quizSubmitData
            );
            if (!quizResult?.success || !quizResult.data) {
              handleFormError(
                "Не удалось создать тест",
                "Попробуйте еще раз"
              );
              return;
            }
            quizIdToAttach = quizResult.data.id;
          }

          // If module already had a quiz and user keeps QUIZ, submit existing quizId
          if (formData.testVariant === "QUIZ" && hadQuizInitially && module.quizId) {
            quizIdToAttach = module.quizId;
          }

          const updateData: any = {
            courseId: module.courseId,
            title: formData.title,
            shortDesc: formData.shortDesc,
            testVariant: formData.testVariant,
            unlockRule: formData.unlockRule,
          };
          if (typeof quizIdToAttach === "number") {
            updateData.quizId = quizIdToAttach;
          }

          updateModuleMutation.mutate({
            id: moduleId,
            data: updateData,
          });
        }}
        className="flex flex-col flex-1 gap-6 h-full"
      >
        <div className="flex flex-col gap-6 flex-1 overflow-auto">
          <InputFloatingLabel
            type="text"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Введите название модуля"
            className="w-full"
            required
          />

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
            <p className="text-xs text-red-500 mt-1">
              Превышено максимальное количество символов
            </p>
          )}

          <SelectFloatingLabel
            placeholder="Выберите вариант тестирования"
            value={String(formData.testVariant)}
            onValueChange={(value) => {
              if (value === "NONE" || value === "QUIZ") {
                handleChange("testVariant", value);
              }
            }}
            options={testVariantOptions}
            variant="default"
            className="w-full"
          />

          {formData.testVariant === "QUIZ" && !hadQuizInitially && (
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
                  onClick={() => {
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
                  }}
                  disabled={
                    updateModuleMutation.isPending ||
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
                    updateModuleMutation.isPending ||
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
                            onClick={() =>
                              setQuizFormData((prev) => ({
                                ...prev,
                                questions: prev.questions.filter((_, i) => i !== qIndex),
                              }))
                            }
                            disabled={
                              updateModuleMutation.isPending ||
                              createQuizMutation.isPending
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>

                        <InputFloatingLabel
                          value={question.text}
                          onChange={(e) =>
                            setQuizFormData((prev) => ({
                              ...prev,
                              questions: prev.questions.map((q, i) =>
                                i === qIndex ? { ...q, text: e.target.value } : q
                              ),
                            }))
                          }
                          placeholder="Введите текст вопроса..."
                          className="w-full mb-4"
                          disabled={
                            updateModuleMutation.isPending ||
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
                                  setQuizFormData((prev) => ({
                                    ...prev,
                                    questions: prev.questions.map((q, i) =>
                                      i === qIndex
                                        ? {
                                            ...q,
                                            options: q.options.map((opt, j) => ({
                                              ...opt,
                                              isCorrect: j === oIndex,
                                            })),
                                          }
                                        : q
                                    ),
                                  }))
                                }
                                className="w-3 h-3"
                                disabled={
                                  updateModuleMutation.isPending ||
                                  createQuizMutation.isPending
                                }
                              />
                              <Input
                                value={option.text}
                                onChange={(e) =>
                                  setQuizFormData((prev) => ({
                                    ...prev,
                                    questions: prev.questions.map((q, i) =>
                                      i === qIndex
                                        ? {
                                            ...q,
                                            options: q.options.map((opt, j) =>
                                              j === oIndex
                                                ? { ...opt, text: e.target.value }
                                                : opt
                                            ),
                                          }
                                        : q
                                    ),
                                  }))
                                }
                                placeholder="Текст варианта ответа..."
                                className="flex-1 border-0 focus:ring-0"
                                disabled={
                                  updateModuleMutation.isPending ||
                                  createQuizMutation.isPending
                                }
                              />
                              {question.options.length > 2 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setQuizFormData((prev) => ({
                                      ...prev,
                                      questions: prev.questions.map((q, i) =>
                                        i === qIndex
                                          ? {
                                              ...q,
                                              options: q.options.filter((_, j) => j !== oIndex),
                                            }
                                          : q
                                      ),
                                    }))
                                  }
                                  disabled={
                                    updateModuleMutation.isPending ||
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
                              onClick={() =>
                                setQuizFormData((prev) => ({
                                  ...prev,
                                  questions: prev.questions.map((q, i) =>
                                    i === qIndex
                                      ? {
                                          ...q,
                                          options: [...q.options, { text: "", isCorrect: false }],
                                        }
                                      : q
                                  ),
                                }))
                              }
                              disabled={
                                updateModuleMutation.isPending ||
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

          <SelectFloatingLabel
            key={`unlock-${formData.unlockRule}`}
            placeholder="Выберите правило доступа"
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
          disabled={!isFormValid || updateModuleMutation.isPending}
        >
          {updateModuleMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Сохранение...
            </>
          ) : (
            "Сохранить"
          )}
        </Button>
      </form>
    </div>
  );
};
