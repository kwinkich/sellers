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
  casesQueryOptions,
  type UpdateCaseRequest,
} from "@/entities";
import { useUserRole } from "@/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/shared";
import {
  createCaseSchema,
  type CreateCaseFormData,
} from "../../../create-case/model";

interface UpdateCaseFormProps {
  caseId?: number;
  onFormChange?: (hasChanges: boolean) => void;
}

export function UpdateCaseForm({ caseId, onFormChange }: UpdateCaseFormProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { userId } = useUserRole();

  // State for tracking changes and dialogs
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const originalDataRef = useRef<CreateCaseFormData | null>(null);

  // Fetch case data
  const {
    data: caseData,
    isLoading,
    isError,
  } = useQuery({
    ...casesQueryOptions.byId(caseId!),
    enabled: !!caseId,
  });

  const { mutate: updateCase, isPending } = useMutation({
    ...casesMutationOptions.update(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });

      toast.success("Кейс успешно обновлен");

      // Navigate back to cases list
      navigate("/admin/content/cases");
    },
    onError: (error: any) => {
      console.error("Ошибка при обновлении кейса:", error);

      // Handle unique constraint violation (409 Conflict)
      if (error?.status === 409 || error?.error?.code === "CONFLICT") {
        const errorMessage =
          error?.error?.message || "Кейс с таким названием уже существует";
        form.setError("title", {
          type: "manual",
          message: errorMessage,
        });
        toast.error(errorMessage);
      } else {
        // Handle other errors
        const errorMessage =
          error?.error?.message || "Ошибка при обновлении кейса";
        toast.error(errorMessage);
      }
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

  // Populate form with case data when loaded
  useEffect(() => {
    if (caseData?.data) {
      const caseInfo = caseData.data;
      const formData = {
        title: caseInfo.title,
        recommendedSellerLevel: caseInfo.recommendedSellerLevel,
        situation: caseInfo.situation,
        sellerLegend: caseInfo.sellerLegend,
        buyerLegend: caseInfo.buyerLegend,
        sellerTask: caseInfo.sellerTask,
        buyerTask: caseInfo.buyerTask,
      };

      // Use setValue for each field to ensure proper updates
      form.setValue("title", formData.title);
      form.setValue("recommendedSellerLevel", formData.recommendedSellerLevel);
      form.setValue("situation", formData.situation);
      form.setValue("sellerLegend", formData.sellerLegend);
      form.setValue("buyerLegend", formData.buyerLegend);
      form.setValue("sellerTask", formData.sellerTask);
      form.setValue("buyerTask", formData.buyerTask);

      originalDataRef.current = formData;
      setHasChanges(false);
      onFormChange?.(false);
    }
  }, [caseData, form, onFormChange]);

  // Track form changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (originalDataRef.current) {
        const hasFormChanges =
          JSON.stringify(value) !== JSON.stringify(originalDataRef.current);
        setHasChanges(hasFormChanges);
        onFormChange?.(hasFormChanges);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, onFormChange]);

  const onSubmit = (formData: CreateCaseFormData) => {
    if (!userId || !caseId) {
      toast.error("Ошибка авторизации");
      return;
    }

    const requestData: UpdateCaseRequest = {
      title: formData.title,
      recommendedSellerLevel: formData.recommendedSellerLevel,
      situation: formData.situation,
      sellerLegend: formData.sellerLegend,
      buyerLegend: formData.buyerLegend,
      sellerTask: formData.sellerTask,
      buyerTask: formData.buyerTask,
    };

    updateCase({ id: caseId, data: requestData });
  };

  const handleSubmit = () => {
    setShowSubmitDialog(true);
  };

  const confirmSubmit = () => {
    setShowSubmitDialog(false);
    const formData = form.getValues();
    onSubmit(formData);
  };

  const cancelSubmit = () => {
    setShowSubmitDialog(false);
  };

  const handleClose = () => {
    if (hasChanges) {
      setShowCloseDialog(true);
    } else {
      navigate("/admin/content/cases");
    }
  };

  const confirmClose = () => {
    setShowCloseDialog(false);
    navigate("/admin/cases");
  };

  const cancelClose = () => {
    setShowCloseDialog(false);
  };

  // Get current admin ID from context
  const currentAdminId = userId;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Загрузка кейса...</span>
      </div>
    );
  }

  if (isError || !caseData?.data) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Ошибка загрузки кейса</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                key={`level-select-${field.value}`}
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

        {/* Dual buttons */}
        <div className="flex gap-2 mt-6">
          <Button
            type="button"
            onClick={handleClose}
            variant="second"
            className="flex-1 h-12"
          >
            Назад к списку кейсов
          </Button>
          <Button
            type="submit"
            className="flex-1 h-12"
            disabled={isPending || !hasChanges}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {"Обновление..."}
              </>
            ) : (
              "Обновить кейс"
            )}
          </Button>
        </div>
      </form>

      {/* Close Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showCloseDialog}
        onClose={cancelClose}
        onConfirm={confirmClose}
        title="Несохраненные изменения"
        description="У вас есть несохраненные изменения. Если вы закроете страницу, все изменения будут потеряны."
        confirmText="Закрыть"
        isLoading={false}
        showCancelButton={false}
        severity="destructive"
      />

      {/* Submit Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showSubmitDialog}
        onClose={cancelSubmit}
        onConfirm={confirmSubmit}
        title="Подтверждение обновления"
        description="Вы уверены, что хотите обновить кейс? Все изменения будут сохранены."
        confirmText="Обновить"
        isLoading={isPending}
        showCancelButton={false}
        severity="constructive"
      />
    </Form>
  );
}
