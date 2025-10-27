import { CoursesList } from "@/feature";
import { HeadText } from "@/shared";

export const MopCoursesPage = () => {
  return (
    <div className="bg-second-bg px-2 min-h-[calc(100vh-4rem)] pb-3 pt-4">
      <HeadText
        head="Обучение"
        label="Оттачивайте переговорные навыки"
        className="px-2 mb-6"
      />

      <CoursesList />
    </div>
  );
};
