import type { ScenarioListItem } from "@/entities";
import { scenariosQueryOptions, ScenariosAPI } from "@/entities";
import { ConfirmationDialog } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ScenarioCard } from "./card";

interface ScenariosListProps {
  searchQuery: string;
}

export const ScenariosList = ({ searchQuery }: ScenariosListProps) => {
  const queryClient = useQueryClient();
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    scenarioId: number | null;
    scenarioTitle: string;
  }>({
    isOpen: false,
    scenarioId: null,
    scenarioTitle: "",
  });

  const { data, isLoading, error } = useQuery(scenariosQueryOptions.list());

  const deleteScenarioMutation = useMutation({
    mutationFn: (id: number) => ScenariosAPI.deleteScenario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scenarios"] });
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

  if (isLoading) {
    return <div className="text-center py-8">Загрузка сценариев...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        Ошибка: {error.message}
      </div>
    );
  }

  const scenarios: ScenarioListItem[] = data?.data ?? [];

  // TODO: Replace with real API data when backend includes skills in list response
  // For now, using mock skills for demonstration
  const scenariosWithSkills = scenarios.map((scenario) => ({
    ...scenario,
    skills: [
      { id: 1, name: "Коммуникация" },
      { id: 2, name: "Управление процессом" },
      { id: 3, name: "Анализ" },
      { id: 4, name: "Тайминг" },
      { id: 5, name: "Обаяние" },
    ].slice(0, Math.floor(Math.random() * 3) + 1), // Random 1-3 skills
  }));

  const filteredScenarios = scenariosWithSkills.filter(
    (scenario) =>
      scenario.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scenario.id.toString().includes(searchQuery)
  );

  if (filteredScenarios.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {searchQuery ? "Ничего не найдено" : "Нет сценариев"}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2 p-2">
        {filteredScenarios.map((scenario) => (
          <ScenarioCard
            key={scenario.id}
            data={scenario}
            onDelete={(id) => handleDelete(id, scenario.title)}
          />
        ))}
      </div>

      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title="Удаление сценария"
        description={`Вы уверены, что хотите удалить сценарий ${deleteDialog.scenarioTitle}? Это действие нельзя отменить.`}
        confirmText="Удалить"
        cancelText="Отмена"
        isLoading={deleteScenarioMutation.isPending}
        userName={deleteDialog.scenarioTitle}
        showCancelButton={false}
      />
    </>
  );
};
