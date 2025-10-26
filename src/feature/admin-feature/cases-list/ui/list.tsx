import type { CaseListItem } from "@/entities";
import { casesQueryOptions, CasesAPI } from "@/entities";
import { ConfirmationDialog } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

  const { data, isLoading, error } = useQuery(casesQueryOptions.list());

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

  if (isLoading) {
    return <div className="text-center py-8">Загрузка кейсов...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        Ошибка: {error.message}
      </div>
    );
  }

  const cases: CaseListItem[] = data?.data ?? [];

  const filteredCases = cases.filter(
    (caseItem) =>
      caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.id.toString().includes(searchQuery)
  );

  if (filteredCases.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {searchQuery ? "Ничего не найдено" : "Нет кейсов"}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2 p-2">
        {filteredCases.map((caseItem) => (
          <CaseCard
            key={caseItem.id}
            data={caseItem}
            onDelete={(id) => handleDelete(id, caseItem.title)}
          />
        ))}
      </div>

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
