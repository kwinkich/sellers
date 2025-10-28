import { clientsQueryOptions } from "@/entities";
import { AdminLicencesList } from "@/feature";
import { HeaderWithClose } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

export const AdminLicensesListPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery(
    clientsQueryOptions.byId(parseInt(id!))
  );

  if (isLoading) {
    return (
      <div className="flex flex-col bg-second-bg min-h-full pb-3 gap-6 px-2 pt-4">
        <HeaderWithClose
          title="Лицензии клиента"
          description="Загрузка данных клиента..."
          onClose={() => navigate("/admin/clients")}
          variant="dark"
        />
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col bg-second-bg min-h-full pb-3 gap-6 px-2 pt-4">
        <HeaderWithClose
          title="Лицензии клиента"
          description="Ошибка загрузки данных клиента"
          onClose={() => navigate("/admin/clients")}
          variant="dark"
        />
        <div className="text-center py-8 text-destructive">
          {error?.message || "Клиент не найден"}
        </div>
      </div>
    );
  }

  const clientName =
    data.data.displayName || data.data.telegramUsername || `Клиент #${id}`;

  return (
    <div className="flex flex-col bg-second-bg min-h-[calc(100vh-4rem)] pb-3 gap-6 px-2 pt-4">
      <HeaderWithClose
        title="Лицензии клиента"
        description={`Список всех лицензий клиента ${clientName} (#${id})`}
        onClose={() => navigate("/admin/clients")}
        variant="dark"
      />

      <div className="flex-1 overflow-auto">
        <AdminLicencesList />
      </div>
    </div>
  );
};
