import { MopCard } from "@/entities";
import { HeadText } from "@/shared";

export const ClientListMopPage = () => {
	return (
		<div className="bg-second-bg px-2 pb-28">
			<HeadText
				className="gap-0.5 mb-8 pl-2 pt-2"
				head="Список МОП"
				label="Оттачивайте переговорные навыки"
			/>

			<div className="flex flex-col gap-2">
				{Array(20)
					.fill(null)
					.map((_, idx) => (
						<MopCard key={idx} />
					))}
			</div>
		</div>
	);
};
