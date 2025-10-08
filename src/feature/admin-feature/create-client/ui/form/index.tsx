import { Button } from "@/components/ui/button";
import { DatePickerFloatingLabel } from "@/components/ui/datePickerFloating";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import InputFloatingLabel from "@/components/ui/inputFloating";
import { SelectFloatingLabel } from "@/components/ui/selectFloating";
import { clientsMutationOptions, type CreateClientRequest } from "@/entities";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createClientSchema, type CreateClientFormData } from "../../model";

export function CreateClientForm() {
	const queryClient = useQueryClient();

	const { mutate: createClient, isPending } = useMutation({
		...clientsMutationOptions.create(),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["clients"] });

			toast.success("Клиент успешно создан", {
				description: `Компания "${data.data.inn}" добавлена в систему`,
			});

			form.reset();
		},
		onError: (error) => {
			console.error("Ошибка при создании клиента:", error);
			toast.error("Ошибка при создании клиента", {
				description:
					"Пожалуйста, проверьте введенные данные и попробуйте снова",
			});
		},
	});

	const form = useForm<CreateClientFormData>({
		resolver: zodResolver(createClientSchema),
		defaultValues: {
			level: undefined,
			telegramUsername: "",
			companyName: "",
			inn: "",
			licenseCount: 1,
		},
	});

	const onSubmit = (formData: CreateClientFormData) => {
		const requestData: CreateClientRequest = {
			level: formData.level,
			telegramUsername: formData.telegramUsername,
			companyName: formData.companyName,
			inn: formData.inn,
			licenseCount: formData.licenseCount,
			licenseExpiresAt: formData.licenseExpiresAt.toISOString(),
		};

		console.log("Данные для отправки:", requestData);
		createClient(requestData);
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="companyName"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<InputFloatingLabel
									placeholder="Введите название компании"
									{...field}
									disabled={isPending}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="telegramUsername"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<InputFloatingLabel
									placeholder="Введите @username администратора"
									{...field}
									disabled={isPending}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="licenseCount"
					render={({ field }) => (
						<FormItem>
							<SelectFloatingLabel
								placeholder="Выберите количество лицензий"
								value={field.value.toString()}
								onValueChange={(value) => field.onChange(parseInt(value))}
								options={Array.from({ length: 12 }, (_, i) => i + 1).map(
									(number) => ({
										value: number.toString(),
										label: `${number} ${
											number === 1
												? "лицензия"
												: number < 5
												? "лицензии"
												: "лицензий"
										}`,
									})
								)}
								disabled={isPending}
							/>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="licenseExpiresAt"
					render={({ field }) => (
						<FormItem>
							<DatePickerFloatingLabel
								placeholder="Дата окончания лицензии"
								value={field.value}
								onValueChange={field.onChange}
								disabled={isPending}
							/>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="level"
					render={({ field }) => (
						<FormItem>
							<SelectFloatingLabel
								placeholder="Уровень компании"
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

				<FormField
					control={form.control}
					name="inn"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<InputFloatingLabel
									placeholder="Добавьте ИНН компании"
									{...field}
									maxLength={10}
									disabled={isPending}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" className="w-full" disabled={isPending}>
					{isPending ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Добавление клиента...
						</>
					) : (
						"Добавить"
					)}
				</Button>
			</form>
		</Form>
	);
}
