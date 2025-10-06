import { ModuleCard } from "@/entities";

export const ModulesList = () => {
	return (
		<div className="flex flex-col gap-2">
			{Array(10)
				.fill(null)
				.map((_, idx) => (
					<ModuleCard key={idx} />
				))}
		</div>
	);
};
