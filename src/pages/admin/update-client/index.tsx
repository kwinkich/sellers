import { clientsQueryOptions } from "@/entities";
import { UpdateClientForm } from "@/feature";
import { HeadText } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useParams } from "react-router-dom";

export const AdminUpdateClientPage = () => {
	const { clientId } = useParams<{ clientId: string }>();

	const { data, isLoading, error } = useQuery(
		clientsQueryOptions.byId(parseInt(clientId!))
	);

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
