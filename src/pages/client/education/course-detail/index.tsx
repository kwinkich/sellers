import { ClientModulesList } from "@/feature/education-feature/client-modules-list";
import { HeaderWithClose } from "@/shared";
import { coursesQueryOptions } from "@/entities";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export const ClientCourseDetailPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const {
    data: courseData,
    isLoading,
    error,
  } = useQuery(coursesQueryOptions.byId(Number(courseId)));

  if (isLoading) {
    return (
      <div className="bg-second-bg px-2 min-h-full pb-3 pt-4">
        <div className="px-2 mb-6">
          <Skeleton className="h-8 w-64 bg-gray-700 rounded mb-2" />
          <Skeleton className="h-4 w-48 bg-gray-600 rounded" />
        </div>
        <div className="flex flex-col gap-2">
          {Array(3)
            .fill(null)
            .map((_, idx) => (
              <Skeleton
                key={idx}
                className="h-32 w-full bg-gray-700 rounded-lg"
              />
            ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-second-bg px-2 min-h-full pb-3 pt-4">
        <div className="text-center text-red-500 py-8">
          Ошибка загрузки курса: {error.message}
        </div>
      </div>
    );
  }

  if (!courseData?.data) {
    return (
      <div className="bg-second-bg px-2 min-h-full pb-3 pt-4">
        <div className="text-center text-gray-500 py-8">Курс не найден</div>
      </div>
    );
  }

  const course = courseData.data;

  return (
    <div className="bg-second-bg px-2 min-h-full pb-3 pt-4">
      <HeaderWithClose
        title={course.title}
        description={course.shortDesc || ""}
        onClose={() => navigate("/client/education/courses")}
        variant="dark"
      />

      <ClientModulesList courseId={Number(courseId)} />
    </div>
  );
};
