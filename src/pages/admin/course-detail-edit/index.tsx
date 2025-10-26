import { Button } from "@/components/ui/button";
import InputFloatingLabel from "@/components/ui/inputFloating";
import { MultiSelect } from "@/components/ui/multiSelect";
import { SelectFloatingLabel } from "@/components/ui/selectFloating";
import { Textarea } from "@/components/ui/textarea";
import { clientsQueryOptions, coursesMutationOptions, coursesQueryOptions } from "@/entities";
import { HeadText } from "@/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const CourseDetailEditPage = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const courseId = Number(id);

	const { data: courseData, isLoading: isCourseLoading } = useQuery(
		coursesQueryOptions.byId(courseId)
	);

	const [formData, setFormData] = useState({
		title: "",
		shortDesc: "",
		accessScope: "ALL" as "ALL" | "CLIENTS_LIST",
		clientIds: [] as number[],
	});

	useEffect(() => {
		if (courseData?.data) {
			const incomingScope = courseData.data.accessScope;
			const normalizedScope = incomingScope === "CLIENTS_LIST" ? "CLIENTS_LIST" : "ALL";
			setFormData((prev) => ({
				...prev,
				title: courseData.data.title,
				shortDesc: courseData.data.shortDesc,
				accessScope: normalizedScope,
				clientIds: Array.isArray(courseData.data.clientIds) ? courseData.data.clientIds : [],
			}));
		}
	}, [courseData?.data]);

	const { data: activeClientsData, isLoading: isLoadingActive } = useQuery({
		...clientsQueryOptions.activeList(),
	});

	const { data: expiredClientsData, isLoading: isLoadingExpired } = useQuery({
		...clientsQueryOptions.expiredList(),
	});

	const { data: expiringClientsData, isLoading: isLoadingExpiring } = useQuery({
		...clientsQueryOptions.expiringList(),
	});

	const allClients = useMemo(() => {
		const clients = [
			...(activeClientsData?.data || []),
			...(expiredClientsData?.data || []),
			...(expiringClientsData?.data || []),
		];

		const uniqueClients = clients.reduce((acc, client) => {
			if (!acc.find((c) => c.id === client.id)) {
				acc.push(client);
			}
			return acc;
		}, [] as any[]);

		return uniqueClients;
	}, [
		activeClientsData?.data,
		expiredClientsData?.data,
		expiringClientsData?.data,
	]);

	const clientOptions = useMemo(
		() =>
			allClients.map((client) => ({
				value: client.id.toString(),
				label: `${client.companyName} (${client.tgUsername})`,
			})),
		[allClients]
	);

	const isLoadingClients =
		isLoadingActive || isLoadingExpired || isLoadingExpiring;

	const updateCourseMutation = useMutation({
		...coursesMutationOptions.update(),
		onSuccess: () => {
			navigate(`/admin/course/${courseId}/edit`);
		},
	});

	const handleChange = (field: string, value: unknown) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleClientSelection = (selectedValues: string[]) => {
		const selectedIds = selectedValues.map((value) => parseInt(value));
		setFormData((prev) => ({
			...prev,
			clientIds: selectedIds,
		}));
	};

	const accessScopeOptions = [
		{ value: "ALL", label: "Доступно всем клиентам" },
		{ value: "CLIENTS_LIST", label: "Только выбранным клиентам" },
	];

	const isFormValid =
		formData.title.trim() &&
		formData.shortDesc.trim() &&
		formData.shortDesc.length <= 1000 &&
		(formData.accessScope === "ALL" ||
			(formData.accessScope === "CLIENTS_LIST" && formData.clientIds.length > 0));

	const remainingChars = 1000 - formData.shortDesc.length;
	const isNearLimit = remainingChars <= 20;
	const isOverLimit = remainingChars < 0;

	if (isCourseLoading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<div className="px-2 min-h-full flex flex-col pb-24 pt-6 gap-6">
			<HeadText
				head="Редактирование деталей курса"
				label="Обновите основные данные"
				variant="black-gray"
				className="px-2"
			/>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					const submitData: any = {
						title: formData.title,
						shortDesc: formData.shortDesc,
						accessScope: formData.accessScope,
					};
					if (formData.accessScope === "CLIENTS_LIST") {
						submitData.clientIds = formData.clientIds;
					}
					updateCourseMutation.mutate({ id: courseId, data: submitData });
				}}
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
							maxLength={1000}
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
						value={String(formData.accessScope)}
						onValueChange={(value) => {
							if (value === "ALL" || value === "CLIENTS_LIST") {
								handleChange("accessScope", value);
							}
						}}
						options={accessScopeOptions}
						variant="default"
						className="w-full"
					/>

					{formData.accessScope === "CLIENTS_LIST" && (
						<div>
							{isLoadingClients ? (
								<div className="flex items-center justify-center py-4">
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
									Загрузка клиентов...
								</div>
							) : (
								<MultiSelect
									label="Выберите клиентов"
									values={formData.clientIds.map((id) => id.toString())}
									onValuesChange={handleClientSelection}
									options={clientOptions}
									variant="default"
									className="w-full"
								/>
							)}
						</div>
					)}
				</div>

				<Button
					type="submit"
					className="w-full"
					disabled={!isFormValid || updateCourseMutation.isPending || (formData.accessScope === "CLIENTS_LIST" && isLoadingClients)}
				>
					{updateCourseMutation.isPending ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin mr-2" />
							Сохранение...
						</>
					) : (
						"Сохранить"
					)}
				</Button>
			</form>
		</div>
	);
};


