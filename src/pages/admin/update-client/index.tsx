import { clientsQueryOptions } from "@/entities";
import { UpdateClientForm } from "@/feature";
import { HeadText } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useParams } from "react-router-dom";

export const AdminUpdateClientPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery(
    clientsQueryOptions.byId(parseInt(id!))
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 px-2 pt-4">
        <HeadText
          head="Редактирование клиента"
          label="Загрузка данных..."
          labelSize="sm"
          variant="black-gray"
        />
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col gap-6 px-2 pt-4">
        <HeadText
          head="Редактирование клиента"
          label="Ошибка загрузки данных клиента"
          labelSize="sm"
          variant="black-gray"
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
    <div className="flex flex-col gap-6 px-2 pt-4 h-full pb-40">
      <HeadText
        head="Редактирование клиента"
        label={`Обновите данные компании <strong>${clientName} (#${id})</strong>`}
        labelSize="sm"
        variant="black-gray"
      />

      <UpdateClientForm clientData={data.data} />
    </div>
  );
};
