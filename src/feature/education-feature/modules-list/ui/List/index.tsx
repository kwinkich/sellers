import { Skeleton } from "@/components/ui/skeleton";
import { ModuleCard, modulesQueryOptions } from "@/entities";
import { useQuery } from "@tanstack/react-query";

export const ModulesList = () => {
	const {
		data: modulesData,
		isLoading,
		error,
	} = useQuery(modulesQueryOptions.list());

	if (isLoading) {
		return (
			<div className="flex flex-col gap-2">
				{Array(3)
					.fill(null)
					.map((_, idx) => (
						<Skeleton
							key={idx}
							className="h-32 w-full bg-gray-700 rounded-lg"
						/>
					))}
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center text-red-500 py-4">
				Ошибка загрузки модулей: {error.message}
			</div>
		);
	}

	if (!modulesData?.data?.length) {
		return (
			<div className="text-center text-gray-500 py-4">Модули не найдены</div>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			{modulesData.data.map((module) => (
				<ModuleCard
					key={module.id}
					module={module}
					isOpen={module.unlockRule === "ALL" || module.progressPercent > 0}
				/>
			))}
		</div>
	);
};
