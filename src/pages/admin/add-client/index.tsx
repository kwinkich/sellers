import { CreateClientForm } from "@/feature";
import { HeaderWithClose } from "@/shared";
import { useNavigate } from "react-router-dom";

export const AdminAddClientPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] px-2 pt-4 pb-3">
      <HeaderWithClose
        title="Добавление клиента"
        description="Заполните данные компании для подключения к платформе"
        onClose={() => navigate("/admin/clients")}
      />

      <div className="flex-1 overflow-auto">
        <CreateClientForm />
      </div>
    </div>
  );
};
