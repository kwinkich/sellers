import { clientsQueryOptions } from "@/entities";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { LicenseCard } from "./ui";

export const AdminLicencesList = () => {
	const { clientId } = useParams<{ clientId: string }>();

	const { data, isLoading, error } = useQuery(
		clientsQueryOptions.licenses(parseInt(clientId!))
	);

	if (isLoading) {
		return (
			<div className="flex justify-center py-8">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
					<p className="text-base-gray">Загрузка лицензий...</p>
				</div>
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="text-center py-8 text-destructive">
				{error?.message || "Ошибка загрузки лицензий"}
			</div>
		);
	}

	const licenses = data.data;

	if (licenses.length === 0) {
		return (
			<div className="text-center py-8 text-base-gray">
				Нет лицензий для этого клиента
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			{licenses.map((license) => (
				<LicenseCard key={license.id} data={license} />
			))}
		</div>
	);
};
