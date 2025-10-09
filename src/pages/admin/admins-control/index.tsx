import { Button } from "@/components/ui/button";
import InputFloatingLabel from "@/components/ui/inputFloating";
import { adminsMutationOptions } from "@/entities";
import { AdminsList } from "@/feature/admin-feature/admins-list/ui/list";
import { HeadText } from "@/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const AdminsControlPage = () => {
	const [username, setUsername] = useState<string>("");

	const queryClient = useQueryClient();

	const { mutate: createAdmin, isPending } = useMutation({
		...adminsMutationOptions.create(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admins"] });
			toast.success("Администратор успешно добавлен");
		},
		onError: (error) => {
			console.error("Ошибка при добавлении админа:", error);
			toast.error("Ошибка при добавлении админа");
		},
	});

	return (
		<div className="bg-second-bg min-h-full pb-24">
			<div className="bg-base-bg flex text-white flex-col  w-full rounded-b-3xl p-2 mb-6">
				<HeadText
					className="gap-0.5 mb-8 pl-2 pt-2"
					head="Добавление администратора"
					label="Назначайте ответственных за управление и контроль"
				/>

				<div className="flex flex-col gap-3">
					<InputFloatingLabel
						placeholder="Введите @username"
						onChange={(e) => setUsername(e.target.value)}
						value={username}
						variant="second"
						disabled={isPending}
					/>

					<Button
						type="submit"
						className="w-full"
						text="dark"
						disabled={isPending}
						onClick={() =>
							createAdmin({
								telegramUsername: username,
							})
						}
						size="xs"
					>
						{isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Добавление...
							</>
						) : (
							"Добавить"
						)}
					</Button>
				</div>
			</div>

			<AdminsList />
		</div>
	);
};
