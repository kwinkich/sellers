import { Button } from "@/components/ui/button";
import InputFloatingLabel from "@/components/ui/inputFloating";
import { SelectFloatingLabel } from "@/components/ui/selectFloating";
import { Textarea } from "@/components/ui/textarea";
import { coursesMutationOptions } from "@/entities";
import { HeadText } from "@/shared";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const CreateCoursePage = () => {
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		title: "",
		shortDesc: "",
		accessScope: "ALL" as "ALL" | "SELECTED",
		clientIds: [] as number[],
	});

	const [clientIdsInput, setClientIdsInput] = useState("");

	const createCourseMutation = useMutation({
		...coursesMutationOptions.create(),
		onSuccess: (result) => {
			navigate(`/admin/course/${result.data.id}/edit`);
		},
		onError: (error) => {
			console.error("Error creating course:", error);
			alert("Произошла ошибка при создании курса. Попробуйте еще раз.");
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Парсим ID клиентов из строки
		const parsedClientIds = clientIdsInput
			.split(",")
			.map((id) => parseInt(id.trim()))
			.filter((id) => !isNaN(id) && id > 0);

		// Создаем объект для отправки
		const submitData: any = {
			title: formData.title,
			shortDesc: formData.shortDesc,
			accessScope: formData.accessScope,
		};

		if (formData.accessScope === "SELECTED") {
			submitData.clientIds = parsedClientIds;
		}

		createCourseMutation.mutate(submitData);
	};

	const handleChange = (field: string, value: unknown) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleClientIdsChange = (value: string) => {
		setClientIdsInput(value);
		const cleanValue = value.replace(/[^\d,]/g, "");
		setClientIdsInput(cleanValue);
	};

	const accessScopeOptions = [
		{ value: "ALL", label: "Доступно всем клиентам" },
		{ value: "SELECTED", label: "Только выбранным клиентам" },
	];

	const isFormValid =
		formData.title.trim() &&
		formData.shortDesc.trim() &&
		formData.shortDesc.length <= 120 &&
		(formData.accessScope === "ALL" ||
			(formData.accessScope === "SELECTED" && clientIdsInput.trim() !== ""));

	const remainingChars = 120 - formData.shortDesc.length;
	const isNearLimit = remainingChars <= 20;
	const isOverLimit = remainingChars < 0;

	return (
		<div className="px-2 min-h-full flex flex-col pb-24 pt-6 gap-6">
			<HeadText
				head="Создание курса"
				label="Заполните основные данные"
				variant="black-gray"
				className="px-2"
			/>

			<form
				onSubmit={handleSubmit}
				className="flex flex-col flex-1 gap-6 h-full"
			>
				<div className="flex flex-col gap-6 flex-1">
					<InputFloatingLabel
						type="text"
						value={formData.title}
						onChange={(e) => handleChange("title", e.target.value)}
						placeholder="Введите название курса"
						className="w-full"
						required
					/>

					<div className="relative">
						<Textarea
							value={formData.shortDesc}
							onChange={(e) => handleChange("shortDesc", e.target.value)}
							placeholder="Введите описание курса"
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
						<p className="text-xs text-red-500 mt-1">
							Превышено максимальное количество символов
						</p>
					)}

					<SelectFloatingLabel
						placeholder="Выберите уровень доступа"
						value={formData.accessScope}
						onValueChange={(value) => handleChange("accessScope", value)}
						options={accessScopeOptions}
						variant="default"
						className="w-full"
					/>

					{/* Поле для ID клиентов */}
					{formData.accessScope === "SELECTED" && (
						<div>
							<InputFloatingLabel
								type="text"
								value={clientIdsInput}
								onChange={(e) => handleClientIdsChange(e.target.value)}
								placeholder="ID клиентов через запятую (например: 1, 2, 3)"
								className="w-full"
								required
							/>
							<p className="text-xs text-gray-500 mt-1">
								Введите числовые ID клиентов, разделенные запятыми
							</p>
							{clientIdsInput && (
								<div className="mt-2">
									<p className="text-xs text-gray-600 mb-1">
										Распознанные ID:{" "}
										{clientIdsInput
											.split(",")
											.map((id) => parseInt(id.trim()))
											.filter((id) => !isNaN(id) && id > 0)
											.join(", ") || "нет"}
									</p>
								</div>
							)}
						</div>
					)}
				</div>

				<Button
					type="submit"
					className="w-full"
					disabled={!isFormValid || createCourseMutation.isPending}
				>
					{createCourseMutation.isPending ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin mr-2" />
							Создание...
						</>
					) : (
						"Создать курс"
					)}
				</Button>
			</form>
		</div>
	);
};
