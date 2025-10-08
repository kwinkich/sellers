// pages/course/CourseEditPage.tsx
import { Button } from "@/components/ui/button";
import { coursesQueryOptions, modulesQueryOptions } from "@/entities";
import { Badge, Box, HeadText } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export const CourseEditPage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const courseId = parseInt(id!);

	const {
		data: courseData,
		isLoading: courseLoading,
		error: courseError,
	} = useQuery(coursesQueryOptions.byId(courseId));

	const {
		data: modulesData,
		isLoading: modulesLoading,
		error: modulesError,
	} = useQuery(modulesQueryOptions.byCourse(courseId));

	const course = courseData?.data;
	const modules = modulesData?.data || [];

	if (courseLoading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (courseError) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="text-center">
					<h2 className="text-lg font-semibold mb-2">Ошибка загрузки курса</h2>
					<p className="text-gray-500 mb-4">
						{courseError instanceof Error
							? courseError.message
							: "Неизвестная ошибка"}
					</p>
					<Button onClick={() => window.location.reload()}>
						Попробовать снова
					</Button>
				</div>
			</div>
		);
	}

	if (!course) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="text-center">
					<h2 className="text-lg font-semibold mb-2">Курс не найден</h2>
					<Button onClick={() => navigate("/admin/courses")}>
						Вернуться к списку курсов
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-full pb-24">
			{/* Шапка с названием курса */}
			<div className="w-full bg-base-bg rounded-b-3xl px-3 py-4 mb-6">
				<HeadText
					head={course.title}
					label="Редактирование курса"
					className="px-2 mb-6"
				/>
				<Button
					onClick={() => navigate(`/admin/course/${courseId}/module/create`)}
					className="w-full"
					size="xs"
					text="dark"
				>
					<Plus className="h-4 w-4 mr-2" />
					Добавить модуль
				</Button>
			</div>

			{/* Список модулей */}
			<div className="px-4">
				<h3 className="text-lg font-semibold mb-4">Модули курса</h3>

				{modulesLoading ? (
					<div className="flex justify-center py-8">
						<Loader2 className="h-6 w-6 animate-spin" />
					</div>
				) : modulesError ? (
					<div className="text-center py-8">
						<p className="text-red-500 mb-2">Ошибка загрузки модулей</p>
						<Button size="sm" onClick={() => window.location.reload()}>
							Обновить
						</Button>
					</div>
				) : modules.length === 0 ? (
					<div className="text-center py-8 text-gray-500">
						Модулей пока нет. Добавьте первый модуль.
					</div>
				) : (
					<div className="space-y-3">
						{modules.map((module) => (
							<Box
								variant="white"
								align="start"
								key={module.id}
								className="p-3"
							>
								<div className="flex w-full items-center justify-between">
									<Badge
										variant="gray-opacity"
										label={`Модуль ${module.orderIndex}`}
									/>
									<Badge
										variant="gray-opacity"
										label={`${module.lessonsCount} урока`}
									/>
								</div>
								<div className="flex flex-col items-start gap-1 mb-4">
									<h4 className="text-lg font-medium text-black leading-[100%]">
										{module.title}
									</h4>
									<p className="text-xs leading-[100%] text-base-gray ">
										{module.shortDesc}
									</p>
								</div>

								<Button
									size="2s"
									variant="second"
									className="w-full"
									onClick={() => navigate(`/admin/module/${module.id}/edit`)}
								>
									Редактировать
								</Button>
							</Box>
						))}
					</div>
				)}
			</div>
		</div>
	);
};
