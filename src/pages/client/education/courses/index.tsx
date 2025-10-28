import { ClientCoursesList } from "@/feature/education-feature/client-courses-list";
import { HeaderWithClose } from "@/shared";
import { useNavigate } from "react-router-dom";

export const ClientCoursesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-second-bg px-2 min-h-[calc(100vh-4rem)] pb-3 pt-4">
      <HeaderWithClose
        title="Обучение"
        description="Просмотр образовательных материалов"
        onClose={() => navigate("/client/home")}
        variant="dark"
      />

      <ClientCoursesList />
    </div>
  );
};
