import InputFloatingLabel from "@/components/ui/inputFloating";
// Tabs are rendered on the page container, not here
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { createScenarioSchema, type CreateScenarioFormData } from "../../model";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

interface CreateScenarioFormProps {
  onFormDataChange?: (data: { title: string }) => void;
  titleError?: string;
  onTitleErrorClear?: () => void;
}

export function CreateScenarioForm({
  onFormDataChange,
  titleError,
  onTitleErrorClear,
}: CreateScenarioFormProps) {
  const form = useForm<CreateScenarioFormData>({
    resolver: zodResolver(createScenarioSchema),
    defaultValues: { title: "" },
  });

  // Watch form values and notify parent
  const title = form.watch("title");

  useEffect(() => {
    onFormDataChange?.({ title });
  }, [title, onFormDataChange]);

  // Set error when titleError prop changes
  useEffect(() => {
    if (titleError) {
      form.setError("title", {
        type: "manual",
        message: titleError,
      });
    } else {
      form.clearErrors("title");
    }
  }, [titleError, form]);

  // Clear title error when user starts typing (separate effect to avoid loops)
  useEffect(() => {
    if (titleError && title && onTitleErrorClear) {
      onTitleErrorClear();
    }
  }, [title, titleError, onTitleErrorClear]);

  return (
    <Form {...form}>
      <form className="space-y-4">
        {/* Header input */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <InputFloatingLabel
                  variant="dark"
                  placeholder="Введите название формы"
                  className="bg-second-bg"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tabs were moved outside, below the form on the page container */}

        {/* No actions here per spec */}
      </form>
    </Form>
  );
}
