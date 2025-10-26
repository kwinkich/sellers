import {
  ClientMopCard,
  ClientsAPI,
  clientsMutationOptions,
  type ClientMop,
} from "@/entities";
import {
  ConfirmationDialog,
  useInfiniteScroll,
  InfiniteScrollList,
} from "@/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export const ClientMopsList = () => {
  const queryClient = useQueryClient();
  const [refreshToken, setRefreshToken] = useState(0);
  const [excludeIds, setExcludeIds] = useState<number[]>([]);
  const [blockDialog, setBlockDialog] = useState<{
    isOpen: boolean;
    mop: ClientMop | null;
  }>({ isOpen: false, mop: null });

  const {
    items: mops,
    isLoading,
    isError,
    error,
    hasNextPage,
    sentinelRef,
    isFetchingNextPage,
  } = useInfiniteScroll<ClientMop>({
    queryKey: ["clients", "mop-profiles"],
    queryFn: (page, limit) => ClientsAPI.getClientMopProfiles({ page, limit }),
    limit: 20,
    resetKey: refreshToken,
    excludeIds,
  });

  const { mutate: blockMop, isPending: isBlocking } = useMutation({
    ...clientsMutationOptions.blockMopProfile(),
    onSuccess: (_, deletedId) => {
      // Instant hide the deleted item
      setExcludeIds((prev) => [...prev, deletedId]);

      // Reset accumulation to rebuild from page 1
      setRefreshToken((t) => t + 1);

      // Invalidate queries for eventual consistency
      queryClient.invalidateQueries({ queryKey: ["clients", "mop-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["clients", "profile"] });

      toast.success("МОП успешно удален");
      setBlockDialog({ isOpen: false, mop: null });
    },
    onError: (error) => {
      console.error("Ошибка при удалении МОПа:", error);
      toast.error("Ошибка при удалении МОПа");
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

  return (
    <>
      <InfiniteScrollList
        items={mops}
        getKey={(mop) => mop.id}
        renderItem={(mop) => (
          <ClientMopCard
            data={mop}
            onDelete={handleBlockMop}
            isDeleting={isBlocking}
          />
        )}
        isLoading={isLoading}
        isError={isError}
        error={error}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        sentinelRef={sentinelRef}
        emptyMessage="Нет добавленных МОПов"
        loadingMessage="Загрузка МОПов..."
        errorMessage="Ошибка загрузки МОПов"
        className="flex flex-col gap-2"
      />

      <ConfirmationDialog
        isOpen={blockDialog.isOpen}
        onClose={() => setBlockDialog({ isOpen: false, mop: null })}
        onConfirm={handleConfirmBlock}
        title="Удаление МОПа"
        description={`Вы уверены, что хотите удалить МОПа${
          blockDialog.mop?.displayName ? ` ${blockDialog.mop.displayName}` : ""
        }? После удаления он не сможет использовать приложение.`}
        confirmText="Удалить"
        cancelText="Отмена"
        isLoading={isBlocking}
        userName={blockDialog.mop?.displayName}
        showCancelButton={false}
      />
    </>
  );
};
