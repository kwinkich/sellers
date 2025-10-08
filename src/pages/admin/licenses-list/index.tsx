import { AdminLicencesList } from "@/feature";
import { HeadText } from "@/shared";
import { useParams } from "react-router-dom";

export const AdminLicensesListPage = () => {
	const { clientId } = useParams<{ clientId: string }>();

	return (
		<div className="flex flex-col bg-second-bg min-h-full pb-24 gap-6 px-2 pt-4">
			<HeadText
				head="Лицензии клиента"
				label={`Список всех лицензий клиента #${clientId}`}
				className="px-2"
			/>

			<AdminLicencesList />
		</div>
	);
};
