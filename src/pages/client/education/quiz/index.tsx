import { Button } from "@/components/ui/button";
import { quizzesQueryOptions, type QuizOption } from "@/entities";
import { ArrowIcon, HeadText, handleFormSuccess } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const ClientQuizPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Текущий вопрос
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Фетчим данные квиза
  const {
    data: quizResponse,
    isLoading,
    error,
  } = useQuery(quizzesQueryOptions.data(parseInt(id!)));

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

  // Переход к следующему вопросу
  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Завершение квиза
      handleFormSuccess("Тест завершен! Все ответы показаны.");
      navigate(-1); // Возврат назад
    }
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  // Используем correctAnswerId для определения правильного ответа

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
        <h2 className="text-lg font-semibold text-gray-900 mb-4 text-white">
          {currentQuestion.text}
        </h2>

        {/* Варианты ответов */}
        <div className="space-y-3">
          {currentQuestion.options.map((option: QuizOption) => {
            const isCorrect = option.id === currentQuestion.correctAnswerId;

            return (
              <div
                key={option.id}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                  isCorrect
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                      isCorrect
                        ? "border-green-500 bg-green-500"
                        : "border-gray-300"
                    }`}
                  >
                    {isCorrect && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span
                    className={`${
                      isCorrect ? "text-green-800 font-medium" : "text-gray-900"
                    }`}
                  >
                    {option.text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Навигация */}
      <div className="w-full px-2">
        <div className="flex gap-3">
          <Button className="flex-1" onClick={handleNextQuestion}>
            {isLastQuestion ? "Завершить тест" : "Следующий вопрос"}{" "}
            <ArrowIcon />
          </Button>
        </div>
      </div>
    </div>
  );
};
