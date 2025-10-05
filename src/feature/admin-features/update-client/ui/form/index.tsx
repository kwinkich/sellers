// features/update-client-form.tsx
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
import {
	clientsMutationOptions,
	type ClientDetail,
	type UpdateClientRequest,
} from "@/entities";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import {
	updateClientSchema,
	type UpdateClientFormData,
} from "../../model/index";
import { AddLicensesDrawer } from "../update-drawer";

interface UpdateClientFormProps {
	clientData: ClientDetail;
}

export function UpdateClientForm({ clientData }: UpdateClientFormProps) {
	const queryClient = useQueryClient();
	const { clientId } = useParams<{ clientId: string }>();

	const { mutate: updateClient, isPending: isUpdating } = useMutation({
		...clientsMutationOptions.update(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["clients"] });
			queryClient.invalidateQueries({
				queryKey: ["clients", "detail", clientId],
			});

			toast.success("Данные клиента обновлены", {
				description: `Компания "${clientData.displayName}" успешно обновлена`,
			});
		},
		onError: (error) => {
			console.error("Ошибка при обновлении клиента:", error);
			toast.error("Ошибка при обновлении клиента", {
				description:
					"Пожалуйста, проверьте введенные данные и попробуйте снова",
			});
		},
	});

	const { mutate: addLicenses, isPending: isAddingLicenses } = useMutation({
		...clientsMutationOptions.addLicenses(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["clients"] });
			queryClient.invalidateQueries({
				queryKey: ["clients", "detail", clientId],
			});

			toast.success("Лицензии добавлены");
		},
		onError: (error) => {
			console.error("Ошибка при добавлении лицензий:", error);
			toast.error("Ошибка при добавлении лицензий");
		},
	});

	const form = useForm<UpdateClientFormData>({
		resolver: zodResolver(updateClientSchema),
		defaultValues: {
			level: clientData.level,
			telegramUsername: clientData.telegramUsername,
			companyName: clientData.displayName,
			inn: clientData.inn,
			licenseCount: clientData.numberOfLicenses,
			licenseExpiresAt: new Date(clientData.closestLicenseExpiresAt),
		},
	});

	const onSubmit = (formData: UpdateClientFormData) => {
		if (!clientId) return;

		const requestData: UpdateClientRequest = {
			level: formData.level,
			telegramUsername: formData.telegramUsername,
			companyName: formData.companyName,
			inn: formData.inn,
		};

		updateClient({ id: parseInt(clientId), data: requestData });
	};

	const handleAddLicenses = (licenseCount: number, licenseExpiresAt: Date) => {
		if (!clientId) return;

		addLicenses({
			id: parseInt(clientId),
			data: {
				licenseCount,
				licenseExpiresAt: format(licenseExpiresAt, "yyyy-MM-dd"),
			},
		});
	};

	const isPending = isUpdating || isAddingLicenses;

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col h-full"
			>
				<div className="w-full flex flex-col gap-4 flex-1">
					<FormField
						control={form.control}
						name="companyName"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<InputFloatingLabel
										placeholder="Название компании"
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
										placeholder="Telegram username администратора"
										{...field}
										disabled={isPending}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="flex items-center bg-white-gray rounded-2xl gap-2">
						<div className="flex-1">
							<FormField
								control={form.control}
								name="licenseCount"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<InputFloatingLabel
												placeholder="Количество лицензий"
												value={field.value.toString()}
												onChange={(e) =>
													field.onChange(parseInt(e.target.value) || 0)
												}
												disabled
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<AddLicensesDrawer
							onSave={handleAddLicenses}
							currentLicenseCount={form.watch("licenseCount")}
							disabled={isPending}
						/>
					</div>

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
										placeholder="ИНН компании"
										{...field}
										maxLength={10}
										disabled={isPending}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<Button type="submit" className="w-full" disabled={isPending}>
					{isPending ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Сохранение...
						</>
					) : (
						"Сохранить изменения"
					)}
				</Button>
			</form>
		</Form>
	);
}
