import { ModuleCard, modulesQueryOptions } from "@/entities";
import { useQuery } from "@tanstack/react-query";

export const ModulesList = () => {
	const {
		data: modulesData,
		isLoading,
		error,
	} = useQuery(modulesQueryOptions.list());

	console.log("Modules data:", modulesData);
	console.log("Loading:", isLoading);
	console.log("Error:", error);

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
