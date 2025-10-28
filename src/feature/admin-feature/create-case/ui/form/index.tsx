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
import { casesMutationOptions, type CreateCaseRequest } from "@/entities";
import { useUserRole } from "@/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { createCaseSchema, type CreateCaseFormData } from "../../model";
import { handleFormSuccess, handleFormError, ERROR_MESSAGES } from "@/shared";

export function CreateCaseForm() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { userId } = useUserRole();

  const { mutate: createCase, isPending } = useMutation({
    ...casesMutationOptions.create(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });

      handleFormSuccess("Кейс успешно создан");

      form.reset();
      // Navigate to cases list
      navigate("/admin/content/cases");
    },
    onError: (error: any) => {
      console.error("Ошибка при создании кейса:", error);

      const errorMessage = handleFormError(error, ERROR_MESSAGES.CREATE);

      // Handle unique constraint violation (409 Conflict) - set form field error
      if (error?.status === 409 || error?.error?.code === "CONFLICT") {
        form.setError("title", {
          type: "manual",
          message: errorMessage,
        });
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

  const onSubmit = (formData: CreateCaseFormData) => {
    if (!userId) {
      handleFormError("Ошибка авторизации", "Необходимо войти в систему");
      return;
    }

    const requestData: CreateCaseRequest = {
      title: formData.title,
      recommendedSellerLevel: formData.recommendedSellerLevel,
      situation: formData.situation,
      sellerLegend: formData.sellerLegend,
      buyerLegend: formData.buyerLegend,
      sellerTask: formData.sellerTask,
      buyerTask: formData.buyerTask,
    };

    createCase(requestData);
  };

  // Get current admin ID from context
  const currentAdminId = userId;

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
      </form>
    </Form>
  );
}
