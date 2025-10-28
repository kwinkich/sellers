import { clientsQueryOptions } from "@/entities";
import { UpdateClientForm } from "@/feature";
import { HeaderWithClose } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

export const AdminUpdateClientPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery(
    clientsQueryOptions.byId(parseInt(id!))
  );

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-4rem)] px-2 pt-4 pb-3">
        <HeaderWithClose
          title="Редактирование клиента"
          description="Загрузка данных..."
          onClose={() => navigate("/admin/clients")}
        />
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-4rem)] px-2 pt-4 pb-3">
        <HeaderWithClose
          title="Редактирование клиента"
          description="Ошибка загрузки данных клиента"
          onClose={() => navigate("/admin/clients")}
        />
        <div className="text-center py-8 text-destructive">
          {error?.message || "Клиент не найден"}
        </div>
      </div>
    );
  }

  const clientName =
    data.data.displayName || data.data.telegramUsername || `Клиент #${id}`;

  const handleClose = () => {
    navigate("/admin/clients");
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] px-2 pt-4 pb-3">
      <HeaderWithClose
        title="Редактирование клиента"
        description={`Обновите данные компании ${clientName} (#${id})`}
        onClose={handleClose}
      />

      {/* Content section */}
      <div className="flex-1 overflow-auto">
        <UpdateClientForm clientData={data.data} />
      </div>
    </div>
  );
};
