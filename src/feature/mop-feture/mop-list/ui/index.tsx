import {
	ClientMopCard,
	clientsQueryOptions,
	mopProfilesMutationOptions,
	type ClientMop,
} from "@/entities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const ClientMopsList = () => {
	const queryClient = useQueryClient();

	const { data, isLoading, error } = useQuery(clientsQueryOptions.mopProfiles());

	const { mutate: deleteMop, isPending: isDeleting } = useMutation({
		...mopProfilesMutationOptions.delete(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["clients", "mop-profiles"] });
			queryClient.invalidateQueries({ queryKey: ["clients", "profile"] });
			toast.success("МОП успешно удален");
		},
		onError: (error) => {
			console.error("Ошибка при удалении МОП:", error);
			toast.error("Ошибка при удалении МОП");
		},
	});

	const handleDeleteMop = (mop: ClientMop) => {
		if (
			confirm(`Вы уверены, что хотите удалить МОП ${mop.displayName}?`)
		) {
			deleteMop(mop.id);
		}
	};

	if (isLoading) {
		return (
			<div className="text-center py-8 text-base-gray">Загрузка МОП...</div>
		);
	}

	if (error) {
		return (
			<div className="text-center py-8 text-destructive">
				Ошибка загрузки: {error.message}
			</div>
		);
	}

	const mops = data?.data ?? [];

	if (mops.length === 0) {
		return (
			<div className="text-center py-8 text-base-gray">Нет добавленных МОП</div>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			{mops.map((mop) => (
				<ClientMopCard
					key={mop.id}
					data={mop}
					onDelete={handleDeleteMop}
					isDeleting={isDeleting}
				/>
			))}
		</div>
	);
};
