import { adminsQueryOptions } from "@/entities";
import { HeadText } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { AdminCard } from "./card";

export const AdminsList = () => {
	const { data, isLoading, error } = useQuery(adminsQueryOptions.list());

	if (isLoading) {
		return <div className="text-center py-4">Загрузка списка админов...</div>;
	}

	if (error) {
		return (
			<div className="text-center py-4 text-destructive">
				Ошибка загрузки: {error.message}
			</div>
		);
	}

	const admins = data?.data ?? [];

	if (admins.length === 0) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				Нет добавленных администраторов
			</div>
		);
	}

	return (
		<div className="space-y-3 px-2">
			<HeadText
				head="Список администраторов"
				label="Все пользователи с правами управления"
				className="px-2"
			/>
			<div className="space-y-2">
				{admins.map((admin) => (
					<AdminCard key={admin.id} data={admin} />
				))}
			</div>
		</div>
	);
};
