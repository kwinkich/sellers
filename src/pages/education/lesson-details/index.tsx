import { Button } from "@/components/ui/button";
import { lessonsQueryOptions, type ContentBlock } from "@/entities";
import { ArrowIcon, HeaderWithClose } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { EyeIcon } from "lucide-react";

export const LessonDetailsPage = () => {
  const { courseId, moduleId, lessonId } = useParams<{
    courseId: string;
    moduleId: string;
    lessonId: string;
  }>();
  const navigate = useNavigate();

  const {
    data: lessonResponse,
    isLoading,
    error,
  } = useQuery(lessonsQueryOptions.byId(Number(lessonId)));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !lessonResponse) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Ошибка загрузки урока</h2>
          <p className="text-gray-500">{error?.message || "Урок не найден"}</p>
        </div>
      </div>
    );
  }

  const lesson = lessonResponse.data;

  if (!lesson) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Урок не найден</h2>
          <p className="text-gray-500">Попробуйте обновить страницу</p>
        </div>
      </div>
    );
  }

  // Функция для рендера встроенного контента
  const renderEmbeddedContent = (block: ContentBlock) => {
    if (!block.storageObject?.publicUrl) {
      return (
        <div className=" text-center ">
          <p className="text-gray-500">[Файл не загружен]</p>
          <p className="text-sm text-gray-400 mt-1">
            Файл не был загружен в хранилище
          </p>
        </div>
      );
    }

    const fileUrl = block.storageObject.publicUrl;

    switch (block.type) {
      case "IMAGE":
        return (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <img
              src={fileUrl}
              alt={block.textContent || "Изображение из урока"}
              className="max-w-full h-auto rounded-lg mx-auto max-h-96 object-contain"
            />
            {block.textContent && (
              <p className="text-sm text-gray-600 text-center mt-3 italic">
                {block.textContent}
              </p>
            )}
          </div>
        );

      case "VIDEO":
        return (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <video
              controls
              className="w-full max-w-full rounded-lg max-h-96 mx-auto"
            >
              <source
                src={fileUrl}
                type={block.storageObject.contentType || "video/mp4"}
              />
              Ваш браузер не поддерживает видео элементы.
            </video>
            {block.textContent && (
              <p className="text-sm text-gray-600 text-center mt-3 italic">
                {block.textContent}
              </p>
            )}
          </div>
        );

      case "FILE":
        return (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex flex-col items-center gap-3">
              <iframe
                src={fileUrl}
                className="w-full h-96 rounded-lg border"
                title="PDF документ"
              />
              <div className="flex gap-2 mt-2">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Открыть в новой вкладке
                </a>
              </div>
            </div>
            {block.textContent && (
              <p className="text-sm text-gray-600 text-center mt-3 italic">
                {block.textContent}
              </p>
            )}
          </div>
        );

      case "AUDIO":
        return (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex flex-col items-center gap-3">
              <audio controls className="w-full max-w-md">
                <source
                  src={fileUrl}
                  type={block.storageObject.contentType || "audio/mpeg"}
                />
                Ваш браузер не поддерживает аудио элементы.
              </audio>
            </div>
            {block.textContent && (
              <p className="text-sm text-gray-600 text-center mt-3 italic">
                {block.textContent}
              </p>
            )}
          </div>
        );

      default:
        return (
          <div className="bg-gray-100 rounded-lg p-4 text-center border-2 border-dashed border-gray-300">
            <p className="text-gray-500">[Неизвестный тип файла]</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-full pb-3">
      <div className="w-full bg-base-bg rounded-b-3xl px-3 py-4 mb-6">
        <HeaderWithClose
          title={lesson.title}
          description={`Урок ${lesson.orderIndex}`}
          onClose={() => {
            if (courseId && moduleId) {
              navigate(
                `/mop/education/courses/${courseId}/modules/${moduleId}/lessons`
              );
            } else {
              navigate("/mop/education/courses");
            }
          }}
          variant="dark"
        />
      </div>

      {/* Контентные блоки */}
      <div className="px-2 space-y-6">
        {lesson.contentBlocks.map((block: ContentBlock) => (
          <div key={block.orderIndex} className="py-4">
            {block.type === "TEXT" && (
              <div className="prose max-w-none bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {block.textContent}
                </p>
              </div>
            )}

            {(block.type === "IMAGE" ||
              block.type === "VIDEO" ||
              block.type === "FILE" ||
              block.type === "AUDIO") && (
              <div>{renderEmbeddedContent(block)}</div>
            )}
          </div>
        ))}
      </div>

      {lesson.quizId > 0 && (
        <div className="w-full px-2 mt-8">
          <Button
            className="w-full"
            size="sm"
            onClick={() =>
              navigate(
                `/mop/education/courses/${courseId}/modules/${moduleId}/quizzes/${lesson.quizId}`
              )
            }
          >
            Пройти тест
            <ArrowIcon />
          </Button>
        </div>
      )}
    </div>
  );
};
