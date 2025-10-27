import { Button } from "@/components/ui/button";
import { AdminCourseList } from "@/feature/admin-feature/courses-list";
import { HeadText, useFloatingButtonPosition } from "@/shared";
import { PlusIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AdminCourseListPage = () => {
  const navigate = useNavigate();
  const buttonPosition = useFloatingButtonPosition();

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] pb-3 gap-6 px-2 pt-4">
      <HeadText
        head="Список курсов"
        label={`Оттачивайте переговорные навыки`}
        className="px-2"
      />

      <AdminCourseList />

      <Button
        rounded="full"
        size="xs"
        className="fixed text-sm right-2 border border-black"
        style={buttonPosition}
        onClick={() => navigate("/admin/content/courses/create")}
      >
        <PlusIcon />
        Создать курс
      </Button>
    </div>
  );
};
