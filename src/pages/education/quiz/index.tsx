import { Button } from "@/components/ui/button";
import {
  quizzesMutationOptions,
  quizzesQueryOptions,
  type QuizOption,
} from "@/entities";
import { ArrowIcon, HeadText } from "@/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const QuizPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Текущий вопрос
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: number]: number;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Фетчим данные квиза
  const {
    data: quizResponse,
    isLoading,
    error,
  } = useQuery(quizzesQueryOptions.byId(parseInt(id!)));

  // Мутация для отправки ответов
  const submitQuizMutation = useMutation({
    ...quizzesMutationOptions.submit(),
    onSuccess: (result) => {
      if (result.success && result.data) {
        // Обработка успешной отправки
        console.log("Quiz result:", result.data);
        // Можно добавить навигацию на страницу результатов или показать уведомление
        alert(`Квиз завершен! Результат: ${result.data.scorePercent}%`);
        navigate(-1); // Возврат назад
      } else {
        alert("Ошибка при отправке квиза. Попробуйте еще раз.");
      }
    },
    onError: (error) => {
      console.error("Error submitting quiz:", error);
      alert("Произошла ошибка при отправке квиза. Попробуйте еще раз.");
    },
  });

  const quiz = quizResponse?.data;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !quizResponse) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Ошибка загрузки квиза</h2>
          <p className="text-gray-500">{error?.message || "Квиз не найден"}</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Квиз не найден</h2>
          <p className="text-gray-500">Попробуйте обновить страницу</p>
        </div>
      </div>
    );
  }

  // Обработчик выбора варианта ответа
  const handleOptionSelect = (optionId: number) => {
    const currentQuestion = quiz?.questions[currentQuestionIndex];
    if (!currentQuestion) return;

    setSelectedOptions((prev) => ({
      ...prev,
      [currentQuestion.id!]: optionId,
    }));
  };

  // Переход к следующему вопросу
  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  // Отправка результатов квиза
  const handleSubmitQuiz = async () => {
    if (!quiz) return;

    setIsSubmitting(true);
    try {
      const answers = Object.entries(selectedOptions).map(
        ([questionId, optionId]) => ({
          questionId: parseInt(questionId),
          optionId: optionId,
        })
      );

      submitQuizMutation.mutate({
        id: quiz.quizId,
        data: { answers },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const isOptionSelected = selectedOptions[currentQuestion.id!] !== undefined;

  return (
    <div className="min-h-full pb-3">
      {/* Шапка */}
      <div className="w-full bg-base-bg rounded-b-3xl px-3 py-4 mb-6">
        <HeadText
          aligin="center"
          head={`Вопрос ${currentQuestionIndex + 1} из ${
            quiz.questions.length
          }`}
          label="Проверка знаний"
        />
      </div>

      {/* Прогресс бар */}
      <div className="px-4 mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-base-main h-2 rounded-full transition-all duration-300"
            style={{
              width: `${
                ((currentQuestionIndex + 1) / quiz.questions.length) * 100
              }%`,
            }}
          />
        </div>
      </div>

      {/* Вопрос */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {currentQuestion.text}
        </h2>

        {/* Варианты ответов */}
        <div className="space-y-3">
          {currentQuestion.options.map((option: QuizOption) => (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.id!)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                selectedOptions[currentQuestion.id!] === option.id
                  ? "border-base-main bg-base-opacity10-main"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                    selectedOptions[currentQuestion.id!] === option.id
                      ? "border-base-main bg-base-main"
                      : "border-gray-300"
                  }`}
                >
                  {selectedOptions[currentQuestion.id!] === option.id && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <span className="text-gray-900">{option.text}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Навигация */}
      <div className="w-full px-2">
        <div className="flex gap-3">
          {!isLastQuestion ? (
            <Button
              className="flex-1"
              onClick={handleNextQuestion}
              disabled={!isOptionSelected || isSubmitting}
            >
              Следующий вопрос <ArrowIcon />
            </Button>
          ) : (
            <Button
              className="flex-1"
              onClick={handleSubmitQuiz}
              disabled={!isOptionSelected || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Завершить квиз"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
