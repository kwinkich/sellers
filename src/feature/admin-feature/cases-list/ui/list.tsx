import type { CaseListItem } from "@/entities";
import { CasesAPI } from "@/entities";
import {
  ConfirmationDialog,
  useInfiniteScroll,
  InfiniteScrollList,
} from "@/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CaseCard } from "./card";

interface CasesListProps {
  searchQuery: string;
}

export const CasesList = ({ searchQuery }: CasesListProps) => {
  const queryClient = useQueryClient();
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    caseId: number | null;
    caseTitle: string;
  }>({
    isOpen: false,
    caseId: null,
    caseTitle: "",
  });

  const {
    items: cases,
    isLoading,
    isError,
    error,
    hasNextPage,
    sentinelRef,
    isFetchingNextPage,
  } = useInfiniteScroll<CaseListItem>({
    queryKey: ["cases", "list"],
    queryFn: (page, limit) => CasesAPI.getCases({ page, limit }),
    limit: 20,
  });

  const deleteCaseMutation = useMutation({
    mutationFn: (id: number) => CasesAPI.deleteCase(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      setDeleteDialog({ isOpen: false, caseId: null, caseTitle: "" });
    },
  });

  const handleDelete = (id: number, title: string) => {
    setDeleteDialog({
      isOpen: true,
      caseId: id,
      caseTitle: title,
    });
  };

  const confirmDelete = () => {
    if (deleteDialog.caseId) {
      deleteCaseMutation.mutate(deleteDialog.caseId);
    }
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, caseId: null, caseTitle: "" });
  };

  const filteredCases = cases.filter(
    (caseItem) =>
      caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.id.toString().includes(searchQuery)
  );

  return (
    <>
      <InfiniteScrollList
        items={filteredCases}
        renderItem={(caseItem) => (
          <CaseCard
            key={caseItem.id}
            data={caseItem}
            onDelete={(id) => handleDelete(id, caseItem.title)}
          />
        )}
        isLoading={isLoading}
        isError={isError}
        error={error}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        sentinelRef={sentinelRef}
        emptyMessage={searchQuery ? "Ничего не найдено" : "Нет кейсов"}
        loadingMessage="Загрузка кейсов..."
        errorMessage="Ошибка загрузки кейсов"
      />

      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title="Удаление кейса"
        description={`Вы уверены, что хотите удалить кейс ${deleteDialog.caseTitle}? Это действие нельзя отменить.`}
        confirmText="Удалить"
        cancelText="Отмена"
        isLoading={deleteCaseMutation.isPending}
        userName={deleteDialog.caseTitle}
        showCancelButton={false}
      />
    </>
  );
};
