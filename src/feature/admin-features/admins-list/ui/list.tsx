import { adminsQueryOptions } from "@/entities";
import { HeadText } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { MOCK_ADMINS } from "../mock";
import { AdminCard } from "./card";

const USE_MOCK_DATA = true;

export const AdminsList = () => {
	const admins = USE_MOCK_DATA ? MOCK_ADMINS : [];

	const realQuery = useQuery(adminsQueryOptions.list());

	const realAdmins = !USE_MOCK_DATA ? realQuery.data?.data ?? [] : [];

	if (!USE_MOCK_DATA && realQuery.isLoading) {
		return <div className="text-center py-4">Загрузка списка админов...</div>;
	}

	if (!USE_MOCK_DATA && realQuery.error) {
		return (
			<div className="text-center py-4 text-destructive">
				Ошибка загрузки: {realQuery.error.message}
			</div>
		);
	}

	const displayAdmins = USE_MOCK_DATA ? admins : realAdmins;

	if (displayAdmins.length === 0) {
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
				{displayAdmins.map((admin) => (
					<AdminCard key={admin.id} data={admin} />
				))}
			</div>
		</div>
	);
};
