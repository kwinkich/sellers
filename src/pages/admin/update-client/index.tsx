import { clientsQueryOptions } from "@/entities";
import { UpdateClientForm } from "@/feature";
import { HeadText } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const MOCK_CLIENT_DATA = {
	id: 1,
	displayName: "ООО Ромашка",
	telegramUsername: "@romashka_company",
	level: "LEVEL_3" as const,
	inn: "1234567890",
	numberOfLicenses: 5,
	closestLicenseExpiresAt: "2024-12-31",
};

const USE_MOCK_DATA = false;

export const AdminUpdateClientPage = () => {
	const { clientId } = useParams<{ clientId: string }>();
	const [mockLoading, setMockLoading] = useState(USE_MOCK_DATA);

	useEffect(() => {
		if (USE_MOCK_DATA) {
			const timer = setTimeout(() => {
				setMockLoading(false);
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, []);

	const mockQuery = {
		data: USE_MOCK_DATA ? { data: MOCK_CLIENT_DATA } : undefined,
		isLoading: USE_MOCK_DATA ? mockLoading : false,
		error: null,
	};

	const realQuery = useQuery(clientsQueryOptions.byId(parseInt(clientId!)));

	const { data, isLoading, error } = USE_MOCK_DATA ? mockQuery : realQuery;

	if (isLoading) {
		return (
			<div className="flex flex-col gap-6 px-2 pt-4">
				<HeadText
					head="Редактирование клиента"
					label="Загрузка данных..."
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
					variant="black-gray"
				/>
				<div className="text-center py-8 text-destructive">
					{error?.message || "Клиент не найден"}
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6 px-2 pt-4 h-full pb-24">
			<HeadText
				head="Редактирование клиента"
				label="Обновите данные компании"
				variant="black-gray"
			/>

			<UpdateClientForm clientData={data.data} />
		</div>
	);
};
