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
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
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
	const navigate = useNavigate();

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

			navigate("/admin/home", { replace: true });
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

	// Normalize level coming from API (could be 3/4 or "LEVEL_3"/"LEVEL_4")
	const normalizeLevel = (level: unknown) => {
		if (level === "LEVEL_3" || level === "LEVEL_4") return level as UpdateClientFormData["level"];
		if (level === 3 || level === "3") return "LEVEL_3" as UpdateClientFormData["level"];
		if (level === 4 || level === "4") return "LEVEL_4" as UpdateClientFormData["level"];
		return "LEVEL_3" as UpdateClientFormData["level"];
	};

	const form = useForm<UpdateClientFormData>({
		resolver: zodResolver(updateClientSchema),
		defaultValues: {
			level: normalizeLevel(clientData.level as unknown),
			telegramUsername: clientData.telegramUsername,
			companyName: clientData.displayName,
			inn: clientData.inn,
			licenseCount: clientData.numberOfLicenses,
			licenseExpiresAt: new Date(clientData.closestLicenseExpiresAt),
		},
	});

	const onSubmit = (formData: UpdateClientFormData) => {
		const targetId = clientId ? parseInt(clientId) : (clientData as any)?.id;
		if (!targetId || Number.isNaN(targetId)) return;

		const requestData: UpdateClientRequest = {
			level: formData.level,
			telegramUsername: formData.telegramUsername,
			companyName: formData.companyName,
			inn: formData.inn,
		};

		// debug: verify submit fires
		console.debug("UpdateClientForm submit", { targetId, requestData });
		updateClient({ id: targetId, data: requestData });
	};

	const handleAddLicenses = (licenseCount: number, licenseExpiresAt: Date) => {
		if (!clientId) return;

		const previousCount = form.getValues("licenseCount");
		const nextCount = previousCount + licenseCount;

		// Optimistically update the UI
		form.setValue("licenseCount", nextCount);

		addLicenses(
			{
				id: parseInt(clientId),
				data: {
					licenseCount,
					licenseExpiresAt: licenseExpiresAt.toISOString(),
				},
			},
			{
				onError: () => {
					// Rollback on error
					form.setValue("licenseCount", previousCount);
				},
			}
		);
	};

	const isMutating = isUpdating || isAddingLicenses;

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
										disabled={isMutating}
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
										disabled={isMutating}
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
							disabled={isMutating}
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
									disabled={isMutating}
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
										disabled={isMutating}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<Button type="submit" className="w-full" disabled={isUpdating}>
					{isUpdating ? (
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
