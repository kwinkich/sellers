import { clientsQueryOptions } from "@/entities";
import { AdminLicencesList } from "@/feature";
import { HeadText } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useParams } from "react-router-dom";

export const AdminLicensesListPage = () => {
  const { clientId } = useParams<{ clientId: string }>();

  const { data, isLoading, error } = useQuery(
    clientsQueryOptions.byId(parseInt(clientId!))
  );

  if (isLoading) {
    return (
      <div className="flex flex-col bg-second-bg min-h-full pb-24 gap-6 px-2 pt-4">
        <HeadText
          head="Лицензии клиента"
          label="Загрузка данных клиента..."
          labelSize="sm"
          className="px-2"
        />
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col bg-second-bg min-h-full pb-24 gap-6 px-2 pt-4">
        <HeadText
          head="Лицензии клиента"
          label="Ошибка загрузки данных клиента"
          labelSize="sm"
          className="px-2"
        />
        <div className="text-center py-8 text-destructive">
          {error?.message || "Клиент не найден"}
        </div>
      </div>
    );
  }

  const clientName =
    data.data.displayName ||
    data.data.telegramUsername ||
    `Клиент #${clientId}`;

  return (
    <div className="flex flex-col bg-second-bg min-h-full pb-24 gap-6 px-2 pt-4">
      <HeadText
        head="Лицензии клиента"
        label={`Список всех лицензий клиента <strong>${clientName} (#${clientId})</strong>`}
        labelSize="sm"
        className="px-2"
      />

      <AdminLicencesList />
    </div>
  );
};
