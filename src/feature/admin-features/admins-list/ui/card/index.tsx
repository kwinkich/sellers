import { adminsMutationOptions, type Admin } from "@/entities";
import { CreateAdminIcon } from "@/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
import type { FC } from "react";
import { toast } from "sonner";

export const AdminCard: FC<{ data: Admin }> = ({ data }) => {
	const queryClient = useQueryClient();

	const { mutate: deleteAdmin } = useMutation({
		...adminsMutationOptions.delete(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admins"] });
			toast.success("Админ успешно удален");
		},
		onError: (error) => {
			console.error("Ошибка при удалении админа:", error);
			toast.error("Ошибка при удалении админа");
		},
	});

	const handleDelete = (id: number) => {
		deleteAdmin(id);
	};

	return (
		<div className="flex items-center p-3 bg-base-bg rounded-2xl gap-3">
			<CreateAdminIcon size={36} fill="#06935F" />

			<div className="flex flex-col flex-1 items-start gap-1">
				<p className="text-lg font-medium text-white leading-[100%]">
					{data.displayName}
				</p>
				<p className="text-xs text-base-gray leading-[100%] ">
					{data.telegramUsername}
				</p>
			</div>

			<div onClick={() => handleDelete(data.id)}>
				<XIcon size={20} color="#FFF" fill="#FFF" />
			</div>
		</div>
	);
};
