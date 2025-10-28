import type { ScenarioListItem } from "@/entities";
import { ScenariosAPI } from "@/entities";
import {
  ConfirmationDialog,
  useInfiniteScroll,
  InfiniteScrollList,
} from "@/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { ScenarioCard } from "./card";

interface ScenariosListProps {
  searchQuery: string;
  skillIds?: number[];
}

export const ScenariosList = ({
  searchQuery,
  skillIds,
}: ScenariosListProps) => {
  const queryClient = useQueryClient();
  const [refreshToken, setRefreshToken] = useState(0);
  const [excludeIds, setExcludeIds] = useState<number[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    scenarioId: number | null;
    scenarioTitle: string;
  }>({
    isOpen: false,
    scenarioId: null,
    scenarioTitle: "",
  });

  // Stabilize the query key to prevent infinite re-renders
  const queryKey = useMemo(
    () => ["scenarios", "list", { skillIds }],
    [skillIds]
  );

  const {
    items: scenarios,
    isLoading,
    isError,
    error,
    hasNextPage,
    sentinelRef,
    isFetchingNextPage,
  } = useInfiniteScroll<ScenarioListItem>({
    queryKey,
    queryFn: (page, limit) =>
      ScenariosAPI.getScenarios({
        page,
        limit,
        by: "createdAt",
        order: "desc",
        skillIds: skillIds?.length ? skillIds : undefined,
      }),
    limit: 20,
    resetKey: refreshToken,
    excludeIds,
  });

  const deleteScenarioMutation = useMutation({
    mutationFn: (id: number) => ScenariosAPI.deleteScenario(id),
    onSuccess: (_, deletedId) => {
      // Instant hide the deleted item
      setExcludeIds((prev) => [...prev, deletedId]);

      // Reset accumulation to rebuild from page 1
      setRefreshToken((t) => t + 1);

      // Invalidate queries for eventual consistency
      queryClient.invalidateQueries({
        queryKey: ["scenarios", "list"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["scenarios", "detail", deletedId],
      });

      setDeleteDialog({ isOpen: false, scenarioId: null, scenarioTitle: "" });
    },
  });

  const handleDelete = (id: number, title: string) => {
    setDeleteDialog({
      isOpen: true,
      scenarioId: id,
      scenarioTitle: title,
    });
  };

  const confirmDelete = () => {
    if (deleteDialog.scenarioId) {
      deleteScenarioMutation.mutate(deleteDialog.scenarioId);
    }
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, scenarioId: null, scenarioTitle: "" });
  };

  const filteredScenarios = scenarios.filter(
    (scenario) =>
      scenario.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scenario.id.toString().includes(searchQuery)
  );

  return (
    <>
      <InfiniteScrollList
        items={filteredScenarios}
        getKey={(scenario) => scenario.id}
        renderItem={(scenario) => (
          <ScenarioCard
            data={scenario}
            onDelete={(id) => handleDelete(id, scenario.title)}
          />
        )}
        isLoading={isLoading}
        isError={isError}
        error={error}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        sentinelRef={sentinelRef}
        emptyMessage={searchQuery ? "Ничего не найдено" : "Нет сценариев"}
        loadingMessage="Загрузка сценариев..."
        errorMessage="Ошибка загрузки сценариев"
      />

      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title="Удаление сценария"
        description={`Вы уверены, что хотите удалить сценарий ${deleteDialog.scenarioTitle}? Это действие нельзя отменить.`}
        confirmText="Удалить"
        isLoading={deleteScenarioMutation.isPending}
        userName={deleteDialog.scenarioTitle}
        showCancelButton={false}
        severity="destructive"
      />
    </>
  );
};
