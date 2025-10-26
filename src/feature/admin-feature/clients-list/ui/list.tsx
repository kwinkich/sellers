import type { ClientListItem } from "@/entities";
import { ClientsAPI } from "@/entities";
import type { ClientType } from "@/pages/admin/clients-list";
import { useInfiniteScroll, InfiniteScrollList } from "@/shared";
import { ClientCard } from "./card";

interface ClientsListProps {
  type: ClientType;
  searchQuery: string;
}

export const ClientsList = ({ type, searchQuery }: ClientsListProps) => {
  const {
    items: clients,
    isLoading,
    isError,
    error,
    hasNextPage,
    sentinelRef,
    isFetchingNextPage,
  } = useInfiniteScroll<ClientListItem>({
    queryKey: ["clients", type],
    queryFn: (page, limit) => {
      if (type === "active") {
        return ClientsAPI.getActiveClients({ page, limit });
      } else if (type === "expired") {
        return ClientsAPI.getExpiredClients({ page, limit });
      } else {
        return ClientsAPI.getExpiringClients({ page, limit, days: 7 });
      }
    },
    limit: 20,
  });

  const filteredClients = clients.filter(
    (client) =>
      client.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.tgUsername.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.id.toString().includes(searchQuery)
  );

  const emptyMessages = {
    active: "Нет активных клиентов",
    expired: "Нет клиентов с истекшими лицензиями",
    expiring: "Нет клиентов с истекающими лицензиями",
  };

  return (
    <InfiniteScrollList
      items={filteredClients}
      renderItem={(client) => <ClientCard key={client.id} data={client} />}
      isLoading={isLoading}
      isError={isError}
      error={error}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      sentinelRef={sentinelRef}
      emptyMessage={searchQuery ? "Ничего не найдено" : emptyMessages[type]}
      loadingMessage="Загрузка клиентов..."
      errorMessage="Ошибка загрузки клиентов"
      className="flex flex-col gap-2 p-2"
    />
  );
};
