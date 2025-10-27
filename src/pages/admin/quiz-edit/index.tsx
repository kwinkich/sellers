// pages/quiz/EditQuizPage.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InputFloatingLabel from "@/components/ui/inputFloating";
import {
  quizzesMutationOptions,
  quizzesQueryOptions,
  type QuizQuestion,
} from "@/entities";
import { HeadText, handleFormError } from "@/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const EditQuizPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const quizId = parseInt(id!);

  const {
    data: quizData,
    isLoading: quizLoading,
    error: quizError,
  } = useQuery(quizzesQueryOptions.byId(quizId));

  const updateQuizMutation = useMutation({
    ...quizzesMutationOptions.update(),
    onSuccess: (result) => {
      if (result.success && result.data) {
        navigate(-1); // Возврат назад после сохранения
      } else {
        handleFormError("Не удалось обновить тест", "Попробуйте еще раз");
      }
    },
    onError: (error) => {
      console.error("Error updating quiz:", error);
      handleFormError(error, "Ошибка при обновлении теста");
    },
  });

  const [formData, setFormData] = useState({
    passThresholdPercent: 70,
    questions: [] as QuizQuestion[],
  });

  // Загружаем данные теста при монтировании
  useEffect(() => {
    if (quizData?.data) {
      const quiz = quizData.data;
      setFormData({
        passThresholdPercent: quiz.passThresholdPercent,
        questions: quiz.questions.map((q) => ({
          ...q,
          options: q.options || [],
        })),
      });
    }
  }, [quizData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      passThresholdPercent: formData.passThresholdPercent,
      questions: formData.questions.map((q, index) => ({
        ...q,
        order: index + 1,
        options: q.options.map((opt, optIndex) => ({
          ...opt,
          id: opt.id || optIndex + 1,
        })),
      })),
    };

    updateQuizMutation.mutate({
      id: quizId,
      data: submitData,
    });
  };

  const addQuestion = (): void => {
    const newQuestion: QuizQuestion = {
      text: "",
      order: formData.questions.length + 1,
      options: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
    };
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const updateQuestion = (
    index: number,
    field: string,
    value: unknown
  ): void => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      ),
    }));
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    field: string,
    value: unknown
  ): void => {
    setFormData((prev) => ({
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

  const addOption = (questionIndex: number): void => {
    setFormData((prev) => ({
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

  const removeQuestion = (index: number): void => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const removeOption = (questionIndex: number, optionIndex: number): void => {
    setFormData((prev) => ({
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

  const setCorrectAnswer = (
    questionIndex: number,
    optionIndex: number
  ): void => {
    setFormData((prev) => ({
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

  const isFormValid =
    formData.questions.length > 0 &&
    formData.questions.every(
      (q) =>
        q.text.trim() &&
        q.options.length >= 2 &&
        q.options.every((opt) => opt.text.trim()) &&
        q.options.some((opt) => opt.isCorrect)
    );

  const isLoading = updateQuizMutation.isPending;

  if (quizLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (quizError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Ошибка загрузки теста</h2>
          <p className="text-gray-500 mb-4">
            {quizError instanceof Error ? quizError.message : "Тест не найден"}
          </p>
          <Button onClick={() => navigate(-1)}>Назад</Button>
        </div>
      </div>
    );
  }

  if (!quizData?.data) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Тест не найден</h2>
          <Button onClick={() => navigate(-1)}>Назад</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full pb-3">
      {/* Шапка в стиле CreateQuizPage */}
      <div className="w-full bg-base-bg rounded-b-3xl px-2 py-4 mb-6">
        <HeadText
          head="Редактирование теста"
          label={`ID теста: ${quizId}`}
          className="px-2 mb-6"
        />

        <Button
          type="button"
          size="xs"
          variant="main-opacity"
          text="main"
          className="w-full"
          onClick={addQuestion}
          disabled={isLoading}
        >
          Добавить вопрос
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="px-4 space-y-6">
        {/* Порог прохождения - в стиле CreateQuizPage */}
        <div>
          <InputFloatingLabel
            type="number"
            value={formData.passThresholdPercent.toString()}
            onChange={(e) => {
              const value = e.target.value;
              const numValue = value === "" ? 0 : parseInt(value, 10);
              if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
                setFormData((prev) => ({
                  ...prev,
                  passThresholdPercent: numValue,
                }));
              }
            }}
            min="1"
            max="100"
            placeholder="Порог прохождения (%)"
            className="w-full"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Минимальный процент правильных ответов для успешного прохождения
          </p>
        </div>

        {/* Вопросы - в стиле CreateQuizPage */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Вопросы теста ({formData.questions.length})
            </label>
          </div>

          {formData.questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
              <p className="mb-2">Нет добавленных вопросов</p>
              <p className="text-sm">
                Нажмите "Добавить вопрос" чтобы начать редактирование теста
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {formData.questions.map((question, qIndex) => (
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
                      onClick={() => removeQuestion(qIndex)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>

                  {/* Текст вопроса с InputFloatingLabel */}
                  <InputFloatingLabel
                    value={question.text}
                    onChange={(e) =>
                      updateQuestion(qIndex, "text", e.target.value)
                    }
                    placeholder="Введите текст вопроса..."
                    className="w-full mb-4"
                    disabled={isLoading}
                  />

                  {/* Варианты ответов - в стиле CreateQuizPage */}
                  <div className="space-y-3 w-full">
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <Input
                          type="radio"
                          name={`question-${qIndex}`}
                          checked={option.isCorrect}
                          onChange={() => setCorrectAnswer(qIndex, oIndex)}
                          className="w-3 h-3"
                          disabled={isLoading}
                        />
                        <Input
                          value={option.text}
                          onChange={(e) =>
                            updateOption(qIndex, oIndex, "text", e.target.value)
                          }
                          placeholder="Текст варианта ответа..."
                          className="flex-1 border-0 focus:ring-0"
                          disabled={isLoading}
                        />
                        {question.options.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(qIndex, oIndex)}
                            disabled={isLoading}
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
                        onClick={() => addOption(qIndex)}
                        disabled={isLoading}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Добавить вариант
                      </Button>
                    </div>

                    {/* Валидация вопроса */}
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

        {/* Кнопка сохранения - в стиле CreateQuizPage */}
        <div className="pb-4">
          <Button
            type="submit"
            className="w-full"
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Сохранение...
              </>
            ) : (
              "Сохранить изменения"
            )}
          </Button>

          {!isFormValid && formData.questions.length > 0 && (
            <p className="text-xs text-red-500 text-center mt-2">
              Заполните все обязательные поля и укажите правильные ответы
            </p>
          )}
        </div>
      </form>
    </div>
  );
};
