// pages/module/CreateModulePage.tsx
import { Button } from "@/components/ui/button";
import InputFloatingLabel from "@/components/ui/inputFloating";
import { SelectFloatingLabel } from "@/components/ui/selectFloating";
import { Textarea } from "@/components/ui/textarea";
import { modulesMutationOptions, modulesQueryOptions } from "@/entities";
import { HeadText } from "@/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const CreateModulePage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const courseId = parseInt(id!);

	const { data: modulesData } = useQuery(
		modulesQueryOptions.byCourse(courseId)
	);

	const modules = modulesData?.data || [];

	const nextOrderIndex = modules.length + 1;

	const [formData, setFormData] = useState({
		title: "",
		shortDesc: "",
		testVariant: "NONE" as "NONE" | "QUIZ",
		unlockRule: "ALL" as "ALL" | "LEVEL_3" | "LEVEL_4",
	});

	const createModuleMutation = useMutation({
		...modulesMutationOptions.create(),
		onSuccess: (result) => {
			if (result.success && result.data) {
				navigate(`/admin/course/${courseId}/edit`);
			} else {
				// Обработка случая, когда API возвращает success: false
				alert("Не удалось создать модуль. Попробуйте еще раз.");
			}
		},
		onError: (error) => {
			console.error("Error creating module:", error);
			alert("Произошла ошибка при создании модуля. Попробуйте еще раз.");
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const submitData = {
			...formData,
			courseId,
			quizId: 0,
			orderIndex: nextOrderIndex,
		};

		createModuleMutation.mutate(submitData);
	};

	const handleChange = (field: string, value: unknown) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	// Опции для селектов
	const testVariantOptions = [
		{ value: "NONE", label: "Нет тестирования" },
		{ value: "QUIZ", label: "Тест (квиз)" },
	];

	const unlockRuleOptions = [
		{ value: "ALL", label: "Всем" },
		{ value: "LEVEL_3", label: "От уровня 3 и выше" },
		{ value: "LEVEL_4", label: "От уровня 4 и выше" },
    { value: "AFTER_PREV_MODULE", label: "После прохождения предыдущего модуля"}
	];

	const isFormValid =
		formData.title.trim() &&
		formData.shortDesc.trim() &&
		formData.shortDesc.length <= 120;

	const remainingChars = 120 - formData.shortDesc.length;
	const isNearLimit = remainingChars <= 20;
	const isOverLimit = remainingChars < 0;

	return (
		<div className="px-2 min-h-full flex flex-col pb-24 pt-6 gap-6">
			<HeadText
				head={`Создание модуля`}
				label="Заполните данные модуля"
				variant="black-gray"
				className="px-2"
			/>

			<form
				onSubmit={handleSubmit}
				className="flex flex-col flex-1 gap-6 h-full"
			>
				<div className="flex flex-col gap-6 flex-1">
					{/* Название модуля */}
					<InputFloatingLabel
						type="text"
						value={formData.title}
						onChange={(e) => handleChange("title", e.target.value)}
						placeholder="Введите название модуля"
						className="w-full"
						required
					/>

					{/* Описание */}
					<div className="relative">
						<Textarea
							value={formData.shortDesc}
							onChange={(e) => handleChange("shortDesc", e.target.value)}
							placeholder="Введите описание модуля"
							className={`w-full resize-none pr-16 ${
								isOverLimit ? "border-red-300 focus:border-red-500" : ""
							}`}
							rows={4}
							maxLength={120}
							required
						/>
						<div
							className={`absolute bottom-2 right-2 text-xs ${
								isOverLimit
									? "text-red-500 font-semibold"
									: isNearLimit
									? "text-amber-500"
									: "text-gray-400"
							}`}
						>
							{remainingChars}
						</div>
					</div>
					{isOverLimit && (
						<p className="text-xs text-red-500 -mt-4">
							Превышено максимальное количество символов
						</p>
					)}

					{/* Вариант тестирования */}
					<SelectFloatingLabel
						placeholder="Выберите вариант тестирования"
						value={formData.testVariant}
						onValueChange={(value) => handleChange("testVariant", value)}
						options={testVariantOptions}
						variant="default"
						className="w-full"
					/>

					{/* Уровень доступа */}
					<SelectFloatingLabel
						placeholder="Выберите уровень доступа"
						value={formData.unlockRule}
						onValueChange={(value) => handleChange("unlockRule", value)}
						options={unlockRuleOptions}
						variant="default"
						className="w-full"
					/>
				</div>

				<Button
					type="submit"
					className="w-full"
					disabled={!isFormValid || createModuleMutation.isPending}
				>
					{createModuleMutation.isPending ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin mr-2" />
							Создание...
						</>
					) : (
						"Создать модуль"
					)}
				</Button>
			</form>
		</div>
	);
};
