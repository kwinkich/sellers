import { Button } from "@/components/ui/button";
import InputFloatingLabel from "@/components/ui/inputFloating";
import MultiSelectChips from "@/components/ui/multi-select-chips";
import { SelectFloatingLabel } from "@/components/ui/selectFloating";
import { Textarea } from "@/components/ui/textarea";
import { clientsQueryOptions, coursesMutationOptions } from "@/entities";
import type { ClientListItem } from "@/entities/client/model/types/client.types";
import { HeadText } from "@/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export const CreateCoursePage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    shortDesc: "",
    accessScope: "ALL" as "ALL" | "CLIENTS_LIST",
    clientIds: [] as number[],
  });

  // Запросы для получения всех типов клиентов
  const { data: activeClientsData, isLoading: isLoadingActive } = useQuery({
    ...clientsQueryOptions.activeList(),
  });

  const { data: expiredClientsData, isLoading: isLoadingExpired } = useQuery({
    ...clientsQueryOptions.expiredList(),
  });

  const { data: expiringClientsData, isLoading: isLoadingExpiring } = useQuery({
    ...clientsQueryOptions.expiringList(),
  });

  // Объединяем всех клиентов в один список
  const allClients = useMemo(() => {
    const activeClients =
      (activeClientsData?.data as unknown as ClientListItem[]) || [];
    const expiredClients =
      (expiredClientsData?.data as unknown as ClientListItem[]) || [];
    const expiringClients =
      (expiringClientsData?.data as unknown as ClientListItem[]) || [];

    const clients: ClientListItem[] = [
      ...activeClients,
      ...expiredClients,
      ...expiringClients,
    ];

    // Убираем дубликаты по ID
    const uniqueClients = clients.reduce((acc, client) => {
      if (!acc.find((c) => c.id === client.id)) {
        acc.push(client);
      }
      return acc;
    }, [] as ClientListItem[]);

    return uniqueClients;
  }, [
    activeClientsData?.data,
    expiredClientsData?.data,
    expiringClientsData?.data,
  ]);

  // Преобразуем клиентов в опции для селекта
  const clientOptions = useMemo(
    () =>
      allClients.map((client) => ({
        value: client.id.toString(),
        label: `${client.companyName} (${client.tgUsername})`,
      })),
    [allClients]
  );

  const isLoadingClients =
    isLoadingActive || isLoadingExpired || isLoadingExpiring;

  const createCourseMutation = useMutation({
    ...coursesMutationOptions.create(),
    onSuccess: (result) => {
      navigate(`/admin/content/courses/${result.data.id}/edit`);
    },
    onError: (error) => {
      console.error("Error creating course:", error);
      alert("Произошла ошибка при создании курса. Попробуйте еще раз.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Создаем объект для отправки
    const submitData: any = {
      title: formData.title,
      shortDesc: formData.shortDesc,
      accessScope: formData.accessScope,
    };

    if (formData.accessScope === "CLIENTS_LIST") {
      submitData.clientIds = formData.clientIds;
    }

    createCourseMutation.mutate(submitData);
  };

  const handleChange = (field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClientSelection = (selectedValues: (string | number)[]) => {
    // Преобразуем значения обратно в числа
    const selectedIds = selectedValues.map((value) => parseInt(String(value)));
    setFormData((prev) => ({
      ...prev,
      clientIds: selectedIds,
    }));
  };

  const accessScopeOptions = [
    { value: "ALL", label: "Доступно всем клиентам" },
    { value: "CLIENTS_LIST", label: "Только выбранным клиентам" },
  ];

  const isFormValid =
    formData.title.trim() &&
    formData.shortDesc.trim() &&
    formData.shortDesc.length <= 1000 &&
    (formData.accessScope === "ALL" ||
      (formData.accessScope === "CLIENTS_LIST" &&
        formData.clientIds.length > 0));

  const remainingChars = 1000 - formData.shortDesc.length;
  const isNearLimit = remainingChars <= 20;
  const isOverLimit = remainingChars < 0;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] pb-3 pt-6 gap-6 px-2">
      <HeadText
        head="Создание курса"
        label="Заполните основные данные"
        variant="black-gray"
        className="px-2"
      />

      <form
        onSubmit={handleSubmit}
        className="flex flex-col flex-1 gap-6 h-full"
      >
        <div className="flex flex-col gap-6 flex-1 overflow-auto">
          <InputFloatingLabel
            type="text"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Введите название курса"
            className="w-full"
            required
          />

          <div className="relative">
            <Textarea
              value={formData.shortDesc}
              onChange={(e) => handleChange("shortDesc", e.target.value)}
              placeholder="Введите описание курса"
              className={`w-full resize-none pr-16 ${
                isOverLimit ? "border-red-300 focus:border-red-500" : ""
              }`}
              rows={4}
              maxLength={1000}
              required
            />
            <div
              className={`absolute bottom-2 right-2 text-xs ${
                isOverLimit
                  ? "text-red-500 font-semibold"
                  : isNearLimit
                  ? "text-amber-500"
                  : "text-gray-400"
              }`}
            >
              {remainingChars}
            </div>
          </div>
          {isOverLimit && (
            <p className="text-xs text-red-500 mt-1">
              Превышено максимальное количество символов
            </p>
          )}

          <SelectFloatingLabel
            placeholder="Выберите уровень доступа"
            value={formData.accessScope}
            onValueChange={(value) => handleChange("accessScope", value)}
            options={accessScopeOptions}
            variant="default"
            className="w-full"
          />

          {/* MultiSelect для выбора клиентов */}
          {formData.accessScope === "CLIENTS_LIST" && (
            <div>
              {isLoadingClients ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Загрузка клиентов...
                </div>
              ) : (
                <MultiSelectChips
                  options={clientOptions}
                  value={formData.clientIds.map((id) => id.toString())}
                  onChange={handleClientSelection}
                  placeholder="Выберите клиентов"
                  className="w-full"
                />
              )}
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={
            !isFormValid ||
            createCourseMutation.isPending ||
            (formData.accessScope === "CLIENTS_LIST" && isLoadingClients)
          }
        >
          {createCourseMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Создание...
            </>
          ) : (
            "Создать курс"
          )}
        </Button>
      </form>
    </div>
  );
};
