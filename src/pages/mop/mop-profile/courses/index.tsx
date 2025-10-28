import { CoursesList } from "@/feature";
import { HeadText } from "@/shared";

export const MopCoursesPage = () => {
  return (
    <div className="page-content-dark px-2 pb-3 pt-4">
      <HeadText
        head="Обучение"
        label="Оттачивайте переговорные навыки"
        className="px-2 mb-6"
      />

      <CoursesList />
    </div>
  );
};
