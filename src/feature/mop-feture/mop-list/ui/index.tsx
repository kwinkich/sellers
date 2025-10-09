import {
	ClientMopCard,
	clientsQueryOptions,
	clientsMutationOptions,
	type ClientMop,
} from "@/entities";
import { BlockConfirmationDialog } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export const ClientMopsList = () => {
	const queryClient = useQueryClient();
	const [blockDialog, setBlockDialog] = useState<{
		isOpen: boolean;
		mop: ClientMop | null;
	}>({ isOpen: false, mop: null });

	const { data, isLoading, error } = useQuery(clientsQueryOptions.mopProfiles());

	const { mutate: blockMop, isPending: isBlocking } = useMutation({
		...clientsMutationOptions.blockMopProfile(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["clients", "mop-profiles"] });
			queryClient.invalidateQueries({ queryKey: ["clients", "profile"] });
			toast.success("МОП успешно удален");
			setBlockDialog({ isOpen: false, mop: null });
		},
		onError: (error) => {
			console.error("Ошибка при удалении МОП:", error);
			toast.error("Ошибка при удалении МОП");
		},
	});

	const handleBlockMop = (mop: ClientMop) => {
		setBlockDialog({ isOpen: true, mop });
	};

	const handleConfirmBlock = () => {
		if (blockDialog.mop) {
			blockMop(blockDialog.mop.id);
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
		<>
			<div className="flex flex-col gap-2">
				{mops.map((mop) => (
					<ClientMopCard
						key={mop.id}
						data={mop}
						onDelete={handleBlockMop}
						isDeleting={isBlocking}
					/>
				))}
			</div>

			<BlockConfirmationDialog
				isOpen={blockDialog.isOpen}
				onClose={() => setBlockDialog({ isOpen: false, mop: null })}
				onConfirm={handleConfirmBlock}
				title="Удалить МОП"
				description={`Вы уверены, что хотите удалить МОП ${blockDialog.mop?.displayName}? После удаления он не сможет войти в систему.`}
				confirmText="Удалить"
				cancelText="Отмена"
				isLoading={isBlocking}
				userName={blockDialog.mop?.displayName}
			/>
		</>
	);
};
