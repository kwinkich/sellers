// pages/module/ModuleEditPage.tsx
import { Button } from "@/components/ui/button";
import { lessonsQueryOptions, modulesQueryOptions } from "@/entities";
import { Badge, Box, HeadText } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { Edit, Loader2, Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export const ModuleEditPage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const moduleId = parseInt(id!);

	const {
		data: moduleData,
		isLoading: moduleLoading,
		error: moduleError,
	} = useQuery(modulesQueryOptions.byId(moduleId));

	const {
		data: lessonsData,
		isLoading: lessonsLoading,
		error: lessonsError,
	} = useQuery(lessonsQueryOptions.byModule(moduleId));

	const module = moduleData?.data;
	const lessons = lessonsData?.data || [];

	if (moduleLoading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (moduleError) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="text-center">
					<h2 className="text-lg font-semibold mb-2">Ошибка загрузки модуля</h2>
					<p className="text-gray-500 mb-4">
						{moduleError instanceof Error
							? moduleError.message
							: "Неизвестная ошибка"}
					</p>
					<Button onClick={() => window.location.reload()}>
						Попробовать снова
					</Button>
				</div>
			</div>
		);
	}

	if (!module) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="text-center">
					<h2 className="text-lg font-semibold mb-2">Модуль не найден</h2>
					<Button onClick={() => navigate("/admin/courses")}>
						Вернуться к курсам
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-full pb-24">
			{/* Шапка с названием модуля */}
			<div className="w-full bg-base-bg rounded-b-3xl px-3 py-4 mb-6">
				<HeadText
					head={module.title}
					label="Редактирование модуля"
					className="px-2 mb-6"
				/>
				<Button
					onClick={() => navigate(`/admin/module/${moduleId}/lesson/create`)}
					className="w-full"
					size="xs"
					text="dark"
				>
					<Plus className="h-4 w-4 mr-2" />
					Добавить урок
				</Button>
			</div>

			{/* Список уроков */}
			<div className="px-4">
				<h3 className="text-lg font-semibold mb-4">Уроки модуля</h3>

				{lessonsLoading ? (
					<div className="flex justify-center py-8">
						<Loader2 className="h-6 w-6 animate-spin" />
					</div>
				) : lessonsError ? (
					<div className="text-center py-8">
						<p className="text-red-500 mb-2">Ошибка загрузки уроков</p>
						<Button size="sm" onClick={() => window.location.reload()}>
							Обновить
						</Button>
					</div>
				) : lessons.length === 0 ? (
					<div className="text-center py-8 text-gray-500">
						Уроков пока нет. Добавьте первый урок.
					</div>
				) : (
					<div className="space-y-3">
						{lessons.map((lesson) => (
							<Box
								variant="white"
								align="start"
								key={lesson.id}
								className="p-3"
							>
								<div className="flex w-full items-center justify-between mb-3">
									<Badge
										variant="gray-opacity"
										label={`Урок ${lesson.orderIndex}`}
									/>
									<Badge
										variant="gray-opacity"
										label={`${lesson.contentBlocks?.length || 0} блоков`}
									/>
								</div>
								<div className="flex flex-col items-start gap-1 mb-4">
									<h4 className="text-lg font-medium text-black leading-[100%]">
										{lesson.title}
									</h4>
									<p className="text-xs leading-[100%] text-base-gray">
										{lesson.shortDesc}
									</p>
								</div>

								<div className="flex gap-2 w-full">
									<Button
										size="2s"
										variant="second"
										className="flex-1"
										onClick={() => navigate(`/admin/lesson/${lesson.id}/edit`)}
									>
										<Edit className="h-4 w-4 mr-2" />
										Редактировать
									</Button>
									{module.testVariant !== "NONE" && (
										<Button
											size="2s"
											className="flex-1"
											onClick={() =>
												navigate(`/admin/lesson/${lesson.id}/quiz/create`)
											}
										>
											Тест
										</Button>
									)}
								</div>
							</Box>
						))}
					</div>
				)}
			</div>
		</div>
	);
};
