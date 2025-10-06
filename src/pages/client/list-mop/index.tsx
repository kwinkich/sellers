import { ClientMopsList } from "@/feature";
import { HeadText } from "@/shared";

export const ClientListMopPage = () => {
	return (
		<div className="bg-second-bg px-2 pb-28">
			<HeadText
				className="gap-0.5 mb-8 pl-2 pt-2"
				head="Список МОП"
				label="Оттачивайте переговорные навыки"
			/>

			<ClientMopsList />
		</div>
	);
};
