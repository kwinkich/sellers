import { lessonsQueryOptions } from "@/entities";
import { HeaderWithClose } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { ClientLessonContent } from "@/feature/education-feature/client-lesson-content";

export const ClientLessonDetailsPage = () => {
  const { courseId, moduleId, lessonId } = useParams<{
    courseId: string;
    moduleId: string;
    lessonId: string;
  }>();
  const navigate = useNavigate();

  const {
    data: lessonResponse,
    isLoading: isLessonLoading,
    error: lessonError,
  } = useQuery(lessonsQueryOptions.byId(Number(lessonId)));

  if (isLessonLoading) {
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
          <p className="text-gray-500">{lessonError?.message}</p>
        </div>
      </div>
    );
  }

  if (!lessonId || !lessonResponse?.data) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Урок не найден</h2>
        </div>
      </div>
    );
  }

  const lesson = lessonResponse.data;

  return (
    <div className="bg-second-bg px-2 min-h-full pb-3 pt-4">
      <HeaderWithClose
        title={lesson.title}
        description={lesson.shortDesc || "Описание отсутствует"}
        onClose={() => {
          if (courseId && moduleId) {
            navigate(
              `/client/education/courses/${courseId}/modules/${moduleId}/lessons`
            );
          } else {
            navigate("/client/education/courses");
          }
        }}
        variant="dark"
      />

      <ClientLessonContent lesson={lesson} />
    </div>
  );
};
