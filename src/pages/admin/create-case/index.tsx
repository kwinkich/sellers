import { CreateCaseForm } from "@/feature";
import { HeaderWithClose } from "@/shared";
import { useNavigate } from "react-router-dom";

export const AdminCreateCasePage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-dvw h-svh bg-white flex flex-col overflow-hidden">
      <div
        className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y [-webkit-overflow-scrolling:touch]"
        data-scroll-container
      >
        <div className="flex flex-col gap-6 px-2 pt-4 pb-[calc(96px+env(safe-area-inset-bottom))] min-h-full">
          <HeaderWithClose
            title="Создание кейса"
            description="Добавьте новый кейс в систему"
            onClose={() => navigate("/admin/home")}
          />

          <CreateCaseForm />
        </div>
      </div>
    </div>
  );
};
