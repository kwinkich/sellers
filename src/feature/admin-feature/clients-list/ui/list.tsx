import type { ClientListItem } from "@/entities";
import { clientsQueryOptions } from "@/entities";
import type { ClientType } from "@/pages/admin/clients-list";
import { useQuery } from "@tanstack/react-query";
import { ClientCard } from "./card";

interface ClientsListProps {
	type: ClientType;
	searchQuery: string;
}

export const ClientsList = ({ type, searchQuery }: ClientsListProps) => {
	const { data, isLoading, error } = useQuery(
		type === "active"
			? clientsQueryOptions.activeList()
			: type === "expired"
			? clientsQueryOptions.expiredList()
			: clientsQueryOptions.expiringList({ days: 7 })
	);

	if (isLoading) {
		return <div className="text-center py-8">Загрузка клиентов...</div>;
	}

	if (error) {
		return (
			<div className="text-center py-8 text-destructive">
				Ошибка: {error.message}
			</div>
		);
	}

	const clients: ClientListItem[] = data?.data ?? [];

	const filteredClients = clients.filter(
		(client) =>
			client.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			client.tgUsername.toLowerCase().includes(searchQuery.toLowerCase()) ||
			client.id.toString().includes(searchQuery)
	);

	if (filteredClients.length === 0) {
		const emptyMessages = {
			active: "Нет активных клиентов",
			expired: "Нет клиентов с истекшими лицензиями",
			expiring: "Нет клиентов с истекающими лицензиями",
		};

		return (
			<div className="text-center py-8 text-muted-foreground">
				{searchQuery ? "Ничего не найдено" : emptyMessages[type]}
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2 p-2">
			{filteredClients.map((client) => (
				<ClientCard key={client.id} data={client} />
			))}
		</div>
	);
};
