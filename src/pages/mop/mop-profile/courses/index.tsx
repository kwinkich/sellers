import { CoursesList } from "@/feature";
import { HeadText } from "@/shared";

export const MopCoursesPage = () => {
  return (
    <div className="bg-second-bg px-2 min-h-[calc(100vh-4rem)] pb-3 pt-4">
      <HeadText
        head="Обучение"
        label="Оттачивайте переговорные навыки"
        className="gap-0.5 mb-8 pl-2"
      />

      <CoursesList />
    </div>
  );
};
