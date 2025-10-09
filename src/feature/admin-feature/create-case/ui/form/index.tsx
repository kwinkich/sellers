import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import InputFloatingLabel from "@/components/ui/inputFloating";
import { SelectFloatingLabel } from "@/components/ui/selectFloating";
import TextareaFloatingLabel from "@/components/ui/textareaFloating";
import {
  casesMutationOptions,
  scenariosQueryOptions,
  type CreateCaseRequest,
} from "@/entities";
import { useUserRole } from "@/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createCaseSchema, type CreateCaseFormData } from "../../model";

export function CreateCaseForm() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { userId } = useUserRole();

  // Fetch scenarios for dropdown with pagination
  const { data: scenariosData, isLoading: scenariosLoading } = useQuery(
    scenariosQueryOptions.list({ limit: 100 })
  );

  // Multi-scenario selection state (dynamic selectors)
  const [scenarioSelects, setScenarioSelects] = useState<Array<number | null>>([
    null,
  ]);

  // Build final selected ids (non-null)
  const selectedScenarioIds = useMemo(
    () => scenarioSelects.filter((v): v is number => typeof v === "number"),
    [scenarioSelects]
  );

  const { mutate: createCase, isPending } = useMutation({
    ...casesMutationOptions.create(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });

      toast.success("Кейс успешно создан ", {
        description: `Кейс "${data.data.title}" добавлен в систему`,
      });

      form.reset();
      // Navigate to cases list or back to admin
      navigate("/admin/home");
    },
    onError: (error) => {
      console.error("Ошибка при создании кейса:", error);
      toast.error("Ошибка при создании кейса", {
        description:
          "Пожалуйста, проверьте введенные данные и попробуйте снова",
      });
    },
  });

  const form = useForm<CreateCaseFormData>({
    resolver: zodResolver(createCaseSchema),
    defaultValues: {
      title: "",
      recommendedSellerLevel: "",
      situation: "",
      sellerLegend: "",
      buyerLegend: "",
      sellerTask: "",
      buyerTask: "",
    },
  });

  const onSubmit = (formData: CreateCaseFormData) => {
    if (!userId) {
      toast.error("Ошибка авторизации", {
        description: "Не удалось получить ID пользователя",
      });
      return;
    }

    // If no scenarios selected, go to scenarios/create
    if (selectedScenarioIds.length === 0) {
      navigate("/admin/scenarios/create");
      return;
    }

    const requestData: CreateCaseRequest = {
      title: formData.title,
      scenarioIds: selectedScenarioIds,
      recommendedSellerLevel: formData.recommendedSellerLevel,
      situation: formData.situation,
      sellerLegend: formData.sellerLegend,
      buyerLegend: formData.buyerLegend,
      sellerTask: formData.sellerTask,
      buyerTask: formData.buyerTask,
    };

    createCase(requestData);
  };

  // Prepare scenario options for dropdown
  const scenarioOptions =
    scenariosData?.data?.map((scenario) => ({
      value: scenario.id.toString(),
      label: scenario.title,
    })) || [];

  // Track taken scenario ids for filtering (keeps current value visible)
  const takenScenarioIds = useMemo(
    () => new Set(selectedScenarioIds),
    [selectedScenarioIds]
  );

  // Get current admin ID from context
  const currentAdminId = userId;

  // Determine button text and behavior based on multi-select
  const isScenarioSelected = selectedScenarioIds.length > 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* 1. Введите название */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <InputFloatingLabel
                  placeholder="Введите название"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 2. Администратор - disabled field with admin ID */}
        <div className="space-y-2">
          <InputFloatingLabel
            placeholder="Администратор"
            value={currentAdminId ? currentAdminId.toString() : ""}
            disabled={true}
          />
        </div>

        {/* 3. Выберите рекомендуемый уровень продавца */}
        <FormField
          control={form.control}
          name="recommendedSellerLevel"
          render={({ field }) => (
            <FormItem>
              <SelectFloatingLabel
                placeholder="Выберите рекомендуемый уровень продавца"
                value={field.value}
                onValueChange={field.onChange}
                options={[
                  { value: "LEVEL_3", label: "Уровень 3" },
                  { value: "LEVEL_4", label: "Уровень 4" },
                ]}
                disabled={isPending}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 4. Опишите ситуацию */}
        <FormField
          control={form.control}
          name="situation"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <TextareaFloatingLabel
                  placeholder="Опишите ситуацию"
                  {...field}
                  disabled={isPending}
                  maxLength={1000}
                  showCharCount={true}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 5. Опишите легенду продавца */}
        <FormField
          control={form.control}
          name="sellerLegend"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <TextareaFloatingLabel
                  placeholder="Опишите легенду продавца"
                  {...field}
                  disabled={isPending}
                  maxLength={1000}
                  showCharCount={true}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 6. Опишите легенду покупателя */}
        <FormField
          control={form.control}
          name="buyerLegend"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <TextareaFloatingLabel
                  placeholder="Опишите легенду покупателя"
                  {...field}
                  disabled={isPending}
                  maxLength={1000}
                  showCharCount={true}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 7. Опишите задачу продавца */}
        <FormField
          control={form.control}
          name="sellerTask"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <TextareaFloatingLabel
                  placeholder="Опишите задачу продавца"
                  {...field}
                  disabled={isPending}
                  maxLength={1000}
                  showCharCount={true}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 8. Опишите задачу покупателя */}
        <FormField
          control={form.control}
          name="buyerTask"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <TextareaFloatingLabel
                  placeholder="Опишите задачу покупателя"
                  {...field}
                  disabled={isPending}
                  maxLength={1000}
                  showCharCount={true}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 9. Выберите сценарий(и) - dynamic selectors */}
        <div className="space-y-2">
          {scenarioSelects.map((val, idx) => (
            <div key={idx}>
              <SelectFloatingLabel
                placeholder={
                  idx === 0
                    ? "Выберите сценарий"
                    : "Добавьте ещё один сценарий (опционально)"
                }
                value={val ? String(val) : ""}
                onValueChange={(value) => {
                  const num = parseInt(value);
                  setScenarioSelects((prev) => {
                    const next = [...prev];
                    next[idx] = Number.isNaN(num) ? null : num;
                    // If this is the last selector and user selected a value, append a new empty selector
                    if (idx === prev.length - 1 && !Number.isNaN(num)) {
                      next.push(null);
                    }
                    return next;
                  });
                }}
                options={scenarioOptions.filter((o) => {
                  // allow currently selected value for this selector
                  if (val && String(val) === o.value) return true;
                  // otherwise filter out already taken ids
                  const id = parseInt(o.value);
                  return !takenScenarioIds.has(id);
                })}
                disabled={isPending || scenariosLoading}
              />
            </div>
          ))}
        </div>

        {isScenarioSelected ? (
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {"Создание кейса..."}
              </>
            ) : (
              "Создать кейс"
            )}
          </Button>
        ) : (
          <Button
            type="button"
            className="w-full"
            onClick={() => navigate("/admin/scenarios/create")}
          >
            Создать сценарий
          </Button>
        )}
      </form>
    </Form>
  );
}
