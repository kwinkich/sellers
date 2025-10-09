import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Course } from "@/entities";
import { Badge, Box } from "@/shared";
import type { FC } from "react";
import { useNavigate } from "react-router-dom";

export const CourseCard: FC<{ data: Course }> = ({ data }) => {
	const navigate = useNavigate();

	const getAccessScopeLabel = (scope: "ALL" | "SELECTED") => {
		return scope === "ALL" ? "Доступ всем" : "Выборочный доступ";
	};

	return (
		<Box variant="dark" className="gap-3 p-4" justify="start" align="start">
			<Badge variant="gray-opacity" label={`${data.id} курс`} />
			<p className="text-lg font-medium leading-[100%] text-white">
				{data.title}
			</p>
			<p className="text-xs text-base-gray leading-[100%]">{data.shortDesc}</p>
			<div className="flex items-center gap-2">
				<Badge
					variant="gray-opacity"
					label={getAccessScopeLabel(data.accessScope)}
				/>
			</div>
			<Separator className="bg-[#FFFFFF1A]" />

			<Button
				variant="second"
				className="w-full"
				size="2s"
				onClick={() => navigate(`/admin/course/${data.id}/edit`)}
			>
				Редактировать
			</Button>
		</Box>
	);
};
