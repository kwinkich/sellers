import { ClientCoursesList } from "@/feature/education-feature/client-courses-list";
import { HeadText } from "@/shared";

export const ClientCoursesPage = () => {
  return (
    <div className="bg-second-bg px-2 min-h-[calc(100vh-4rem)] pb-3 pt-4">
      <HeadText
        head="Обучение"
        label="Просмотр образовательных материалов"
        variant="white-gray"
        className="px-2 mb-6"
      />

      <ClientCoursesList />
    </div>
  );
};
