import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import InputFloatingLabel from "@/components/ui/inputFloating";
import { SelectFloatingLabel } from "@/components/ui/selectFloating";
import TextareaFloatingLabel from "@/components/ui/textareaFloating";
import { casesMutationOptions, scenariosQueryOptions, type CreateCaseRequest } from "@/entities";
import { getUserIdFromToken } from "@/shared/lib/getAuthToken";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createCaseSchema, type CreateCaseFormData } from "../../model";

export function CreateCaseForm() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	// Fetch scenarios for dropdown
	const { data: scenariosData, isLoading: scenariosLoading } = useQuery(
		scenariosQueryOptions.options()
	);

	const { mutate: createCase, isPending } = useMutation({
		...casesMutationOptions.create(),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["cases"] });

			toast.success("Кейс успешно создан ", {
				description: `Кейс "${data.data.title}" добавлен в систему`,
			});

			form.reset();
			// Navigate to cases list or back to admin
			navigate("/admin/home");
		},
		onError: (error) => {
			console.error("Ошибка при создании кейса:", error);
			toast.error("Ошибка при создании кейса", {
				description:
					"Пожалуйста, проверьте введенные данные и попробуйте снова",
			});
		},
	});

	const form = useForm<CreateCaseFormData>({
		resolver: zodResolver(createCaseSchema),
		defaultValues: {
			title: "",
			recommendedSellerLevel: "",
			situation: "",
			sellerLegend: "",
			buyerLegend: "",
			sellerTask: "",
			buyerTask: "",
			scenarioId: undefined,
		},
	});

	const onSubmit = (formData: CreateCaseFormData) => {
		const userId = getUserIdFromToken();
		if (!userId) {
			toast.error("Ошибка авторизации", {
				description: "Не удалось получить ID пользователя из токена",
			});
			return;
		}

		// Check if scenario is selected
		if (!formData.scenarioId) {
			// Redirect to scenario creation page (placeholder for now)
			toast.info("Переход к созданию сценария", {
				description: "Функция будет реализована в следующем этапе",
			});
			return;
		}

		const requestData: CreateCaseRequest = {
			title: formData.title,
			scenarioId: formData.scenarioId,
			recommendedSellerLevel: formData.recommendedSellerLevel,
			situation: formData.situation,
			sellerLegend: formData.sellerLegend,
			buyerLegend: formData.buyerLegend,
			sellerTask: formData.sellerTask,
			buyerTask: formData.buyerTask,
		};

		createCase(requestData);
	};

	// Prepare scenario options for dropdown
	const scenarioOptions = scenariosData?.data?.map((scenario) => ({
		value: scenario.id.toString(),
		label: scenario.title,
	})) || [];

	// Get current admin ID from JWT token
	const currentAdminId = getUserIdFromToken();

	// Watch scenarioId to determine button text and behavior
	const selectedScenarioId = form.watch("scenarioId");
	const isScenarioSelected = !!selectedScenarioId;

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				{/* 1. Введите название */}
				<FormField
					control={form.control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<InputFloatingLabel
									placeholder="Введите название"
									{...field}
									disabled={isPending}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* 2. Администратор - disabled field with admin ID */}
				<div className="space-y-2">
					<InputFloatingLabel
						placeholder="Администратор"
						value={currentAdminId ? currentAdminId.toString() : ""}
						disabled={true}
					/>
				</div>

				{/* 3. Выберите рекомендуемый уровень продавца */}
				<FormField
					control={form.control}
					name="recommendedSellerLevel"
					render={({ field }) => (
						<FormItem>
							<SelectFloatingLabel
								placeholder="Выберите рекомендуемый уровень продавца"
								value={field.value}
								onValueChange={field.onChange}
								options={[
									{ value: "LEVEL_3", label: "Уровень 3" },
									{ value: "LEVEL_4", label: "Уровень 4" },
								]}
								disabled={isPending}
							/>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* 4. Опишите ситуацию */}
				<FormField
					control={form.control}
					name="situation"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<TextareaFloatingLabel
									placeholder="Опишите ситуацию"
									{...field}
									disabled={isPending}
									maxLength={1000}
									showCharCount={true}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* 5. Опишите легенду продавца */}
				<FormField
					control={form.control}
					name="sellerLegend"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<TextareaFloatingLabel
									placeholder="Опишите легенду продавца"
									{...field}
									disabled={isPending}
									maxLength={1000}
									showCharCount={true}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* 6. Опишите легенду покупателя */}
				<FormField
					control={form.control}
					name="buyerLegend"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<TextareaFloatingLabel
									placeholder="Опишите легенду покупателя"
									{...field}
									disabled={isPending}
									maxLength={1000}
									showCharCount={true}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* 7. Опишите задачу продавца */}
				<FormField
					control={form.control}
					name="sellerTask"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<TextareaFloatingLabel
									placeholder="Опишите задачу продавца"
									{...field}
									disabled={isPending}
									maxLength={1000}
									showCharCount={true}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* 8. Опишите задачу покупателя */}
				<FormField
					control={form.control}
					name="buyerTask"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<TextareaFloatingLabel
									placeholder="Опишите задачу покупателя"
									{...field}
									disabled={isPending}
									maxLength={1000}
									showCharCount={true}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* 9. Выберите сценарий - last field */}
				<FormField
					control={form.control}
					name="scenarioId"
					render={({ field }) => (
						<FormItem>
							<SelectFloatingLabel
								placeholder="Выберите сценарий"
								value={field.value?.toString() || ""}
								onValueChange={(value) => field.onChange(parseInt(value))}
								options={scenarioOptions}
								disabled={isPending || scenariosLoading}
							/>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" className="w-full" disabled={isPending || scenariosLoading}>
					{isPending ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							{isScenarioSelected ? "Создание кейса..." : "Создание сценария..."}
						</>
					) : (
						isScenarioSelected ? "Создать кейс" : "Создать сценарий"
					)}
				</Button>
			</form>
		</Form>
	);
}
