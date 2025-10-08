// pages/lesson/CreateLessonPage.tsx
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { FileUploadBlock } from "@/components/ui/file-upload-block";
import InputFloatingLabel from "@/components/ui/inputFloating";
import { Textarea } from "@/components/ui/textarea";
import type { ContentBlock } from "@/entities";
import {
	lessonsMutationOptions,
	lessonsQueryOptions,
	modulesQueryOptions,
} from "@/entities";
import { Box, HeadText } from "@/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import { File, FileText, Image, Loader2, Plus, Video, X } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const CreateLessonPage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const moduleId = parseInt(id!);

	const { data: moduleData } = useQuery(modulesQueryOptions.byId(moduleId));
	const { data: lessonsData } = useQuery(
		lessonsQueryOptions.byModule(moduleId)
	);

	const module = moduleData?.data;
	const lessons = lessonsData?.data || [];

	// Автоматически определяем порядковый номер
	const nextOrderIndex = lessons.length + 1;

	const [formData, setFormData] = useState({
		title: "",
		shortDesc: "",
	});

	const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [createdLessonId, setCreatedLessonId] = useState<number | null>(null);

	const createLessonMutation = useMutation({
		...lessonsMutationOptions.create(),
		onSuccess: (result) => {
			if (result.success && result.data) {
				setCreatedLessonId(result.data.id);
			} else {
				alert("Не удалось создать урок. Попробуйте еще раз.");
			}
		},
		onError: (error) => {
			console.error("Error creating lesson:", error);
			alert("Произошла ошибка при создании урока. Попробуйте еще раз.");
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const submitData = {
			...formData,
			moduleId,
			quizId: 0,
			contentBlocks,
			orderIndex: nextOrderIndex,
		};

		createLessonMutation.mutate(submitData);
	};

	const handleCreateTest = (): void => {
		if (createdLessonId) {
			navigate(`/admin/lesson/${createdLessonId}/quiz/create`);
		}
	};

	const handleChange = (field: string, value: unknown) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const addContentBlock = (type: ContentBlock["type"]): void => {
		const newBlock: ContentBlock = {
			orderIndex: contentBlocks.length + 1,
			type,
			textContent: "",
			storageObjectId: 0,
		};
		setContentBlocks((prev) => [...prev, newBlock]);
	};

	const updateContentBlock = (
		index: number,
		field: string,
		value: unknown
	): void => {
		setContentBlocks((prev) =>
			prev.map((block, i) =>
				i === index ? { ...block, [field]: value } : block
			)
		);
	};

	const removeContentBlock = (index: number): void => {
		setContentBlocks((prev) => prev.filter((_, i) => i !== index));
	};

	const openDrawer = (): void => setIsDrawerOpen(true);
	const closeDrawer = (): void => setIsDrawerOpen(false);

	const handleContentTypeSelect = (type: ContentBlock["type"]): void => {
		addContentBlock(type);
		closeDrawer();
	};

	const isFormValid = formData.title.trim() && formData.shortDesc.trim();

	const contentTypes = [
		{
			type: "TEXT" as const,
			label: "Текстовый блок",
			icon: FileText,
			description: "Добавить текстовый контент",
		},
		{
			type: "IMAGE" as const,
			label: "Изображение",
			icon: Image,
			description: "Загрузить изображение",
		},
		{
			type: "VIDEO" as const,
			label: "Видео",
			icon: Video,
			description: "Загрузить видео файл",
		},
		{
			type: "FILE" as const,
			label: "PDF документ",
			icon: File,
			description: "Загрузить PDF файл",
		},
	];

	// Если урок создан, показываем кнопку для создания теста
	if (createdLessonId) {
		return (
			<div className="min-h-full flex flex-col pb-24 gap-6 px-2">
				<div className="w-full bg-base-bg rounded-2xl px-3 py-6 mt-6">
					<HeadText
						head="Урок создан!"
						label="Что вы хотите сделать дальше?"
						className="px-2 mb-6 text-center"
					/>
				</div>

				<div className="flex flex-col gap-4 flex-1 justify-center">
					{/* Кнопка создания теста */}
					{module?.testVariant !== "NONE" && (
						<Button className="w-full" onClick={handleCreateTest}>
							Создать тест для урока
						</Button>
					)}

					{/* Кнопка возврата к модулю */}
					<Button
						className="w-full"
						onClick={() => navigate(`/admin/module/${moduleId}/edit`)}
					>
						Вернуться к модулю
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-full flex flex-col pb-24 gap-6">
			{/* Шапка с полями названия и описания */}
			<div className="w-full bg-base-bg rounded-b-2xl px-3 py-4">
				<HeadText
					head="Создание урока"
					label={`Для модуля: ${module?.title}`}
					className="px-2 mb-6"
				/>

				<div className="flex flex-col gap-4">
					<InputFloatingLabel
						type="text"
						value={formData.title}
						onChange={(e) => handleChange("title", e.target.value)}
						placeholder="Введите название урока"
						className="w-full"
						required
						variant="second"
					/>

					<Textarea
						value={formData.shortDesc}
						onChange={(e) => handleChange("shortDesc", e.target.value)}
						placeholder="Введите описание урока"
						className="w-full resize-none"
						rows={3}
						variant="second"
						required
					/>
				</div>
			</div>

			<form
				onSubmit={handleSubmit}
				className="flex flex-col flex-1 gap-6 h-full px-2"
			>
				{contentBlocks.length > 0 && (
					<div className="flex flex-col flex-1">
						{/* Блоки контента */}
						<div className="space-y-4 mb-4">
							{contentBlocks.map((block, index) => (
								<Box
									key={index}
									variant="white"
									align="start"
									className="p-4 border-2"
								>
									<div className="flex items-center w-full justify-between mb-4">
										<span className="text-sm font-medium text-gray-700 capitalize">
											{block.type === "TEXT" && "Текстовый блок"}
											{block.type === "AUDIO" && "Аудио блок"}
											{block.type === "IMAGE" && "Блок изображения"}
											{block.type === "VIDEO" && "Видео блок"}
											{block.type === "FILE" && "Блок файла"}
										</span>
										<Button
											type="button"
											variant="link"
											size="link"
											className="text-base-red"
											onClick={() => removeContentBlock(index)}
										>
											Удалить
										</Button>
									</div>

									{block.type === "TEXT" && (
										<Textarea
											value={block.textContent || ""}
											onChange={(e) =>
												updateContentBlock(index, "textContent", e.target.value)
											}
											placeholder="Введите текст контента..."
											rows={6}
											className="w-full bg-white rounded-2xl"
										/>
									)}

									{(block.type === "IMAGE" ||
										block.type === "VIDEO" ||
										block.type === "FILE") && (
										<FileUploadBlock
											block={block}
											index={index}
											onUpdate={updateContentBlock}
											onRemove={removeContentBlock}
										/>
									)}
								</Box>
							))}
						</div>
					</div>
				)}

				<Button
					variant="bordered"
					type="button"
					text="main"
					className="w-full"
					onClick={openDrawer}
				>
					<Plus className="h-4 w-4 mr-2" />
					Добавить раздел
				</Button>

				<Button
					type="submit"
					className="w-full"
					disabled={!isFormValid || createLessonMutation.isPending}
				>
					{createLessonMutation.isPending ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin mr-2" />
							Создание...
						</>
					) : (
						"Создать урок"
					)}
				</Button>
			</form>

			{/* Drawer для выбора типа контента */}
			<Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
				<DrawerContent className="max-h-[80vh]">
					<DrawerHeader className="text-left">
						<DrawerTitle>Выберите тип контента</DrawerTitle>
						<DrawerClose asChild>
							<Button
								variant="ghost"
								className="absolute right-4 top-4"
								size="sm"
							>
								<X className="h-4 w-4" />
							</Button>
						</DrawerClose>
					</DrawerHeader>
					<div className="p-4 pb-6">
						<div className="space-y-2">
							{contentTypes.map((item) => {
								const IconComponent = item.icon;
								return (
									<Button
										key={item.type}
										className="w-full justify-start h-16 px-4"
										onClick={() => handleContentTypeSelect(item.type)}
									>
										<div className="flex items-center gap-3 w-full">
											<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
												<IconComponent className="h-5 w-5 text-blue-600" />
											</div>
											<div className="flex flex-col items-start">
												<span className="text-sm font-medium">
													{item.label}
												</span>
												<span className="text-xs text-gray-500">
													{item.description}
												</span>
											</div>
										</div>
									</Button>
								);
							})}
						</div>
					</div>
				</DrawerContent>
			</Drawer>
		</div>
	);
};
