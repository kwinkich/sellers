import { lessonsQueryOptions } from "@/entities";
import { useQuery } from "@tanstack/react-query";

export const useModuleLessonsCount = (moduleId: number) => {
	const { data: lessonsData } = useQuery(
		lessonsQueryOptions.byModule(moduleId)
	);

	return {
		lessonsCount: lessonsData?.data?.length || 0,
		isLoading: !lessonsData,
	};
};
