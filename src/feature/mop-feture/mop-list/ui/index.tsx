import {
	MopCard,
	mopProfilesMutationOptions,
	type MopProfile,
} from "@/entities";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MOCK_MOPS } from "../mock";

const USE_MOCK_DATA = true;

export const ClientMopsList = () => {
	const queryClient = useQueryClient();

	const mops = USE_MOCK_DATA ? MOCK_MOPS : [];

	const { mutate: deleteMop, isPending: isDeleting } = useMutation({
		...mopProfilesMutationOptions.delete(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["mop-profiles"] });
			queryClient.invalidateQueries({ queryKey: ["clients", "profile"] });
			toast.success("МОП успешно удален");
		},
		onError: (error) => {
			console.error("Ошибка при удалении МОП:", error);
			toast.error("Ошибка при удалении МОП");
		},
	});

	const handleDeleteMop = (mop: MopProfile) => {
		if (
			confirm(`Вы уверены, что хотите удалить МОП ${mop.mopUser?.displayName}?`)
		) {
			deleteMop(mop.id);
		}
	};

	if (mops.length === 0) {
		return (
			<div className="text-center py-8 text-base-gray">Нет добавленных МОП</div>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			{mops.map((mop) => (
				<MopCard
					key={mop.id}
					data={mop}
					onDelete={handleDeleteMop}
					isDeleting={isDeleting}
				/>
			))}
		</div>
	);
};
