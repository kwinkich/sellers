import { CoursesList } from "@/feature";
import { HeadText } from "@/shared";

export const MopCoursesPage = () => {
  return (
    <div className="page-content-dark">
      <HeadText
        head="Обучение"
        label="Оттачивайте переговорные навыки"
        className="page-header"
      />

      <CoursesList />
    </div>
  );
};
