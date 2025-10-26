import { Button } from "@/components/ui/button";
import InputFloatingLabel from "@/components/ui/inputFloating";
import { SelectFloatingLabel } from "@/components/ui/selectFloating";
import { Textarea } from "@/components/ui/textarea";
import { modulesMutationOptions, modulesQueryOptions } from "@/entities";
import { HeadText } from "@/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const ModuleDetailEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const moduleId = parseInt(id!);

  const { data: moduleData, isLoading: isModuleLoading } = useQuery(
    modulesQueryOptions.byId(moduleId)
  );

  const [formData, setFormData] = useState({
    title: "",
    shortDesc: "",
    testVariant: "NONE" as "NONE" | "QUIZ",
    unlockRule: "ALL" as "ALL" | "LEVEL_3" | "LEVEL_4" | "AFTER_PREV_MODULE",
  });

	useEffect(() => {
		if (moduleData?.data) {
			const incomingVariant = moduleData.data.testVariant;
			const normalizedVariant = incomingVariant === "QUIZ" ? "QUIZ" : "NONE";
			setFormData({
				title: moduleData.data.title,
				shortDesc: moduleData.data.shortDesc,
				testVariant: normalizedVariant,
				unlockRule: moduleData.data.unlockRule,
			});
		}
	}, [moduleData?.data]);

  const updateModuleMutation = useMutation({
    ...modulesMutationOptions.update(),
    onSuccess: () => {
      navigate(
        `/admin/content/courses/${module.courseId}/modules/${moduleId}/edit`
      );
    },
  });

  const handleChange = (field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const testVariantOptions = [
    { value: "NONE", label: "Нет тестирования" },
    { value: "QUIZ", label: "Тест (квиз)" },
  ];

  const unlockRuleOptions = [
    { value: "ALL", label: "Всем" },
    { value: "LEVEL_3", label: "От уровня 3 и выше" },
    { value: "LEVEL_4", label: "От уровня 4 и выше" },
    {
      value: "AFTER_PREV_MODULE",
      label: "После прохождения предыдущего модуля",
    },
  ];

  const isFormValid =
    formData.title.trim() &&
    formData.shortDesc.trim() &&
    formData.shortDesc.length <= 1000;

  const remainingChars = 1000 - formData.shortDesc.length;
  const isNearLimit = remainingChars <= 20;
  const isOverLimit = remainingChars < 0;

  if (isModuleLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-2 min-h-full flex flex-col pb-24 pt-6 gap-6">
      <HeadText
        head="Редактирование деталей модуля"
        label="Обновите данные модуля"
        variant="black-gray"
        className="px-2"
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateModuleMutation.mutate({
            id: moduleId,
            data: {
              title: formData.title,
              shortDesc: formData.shortDesc,
              testVariant: formData.testVariant,
              unlockRule: formData.unlockRule,
            },
          });
        }}
        className="flex flex-col flex-1 gap-6 h-full"
      >
        <div className="flex flex-col gap-6 flex-1">
          <InputFloatingLabel
            type="text"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Введите название модуля"
            className="w-full"
            required
          />

          <div className="relative">
            <Textarea
              value={formData.shortDesc}
              onChange={(e) => handleChange("shortDesc", e.target.value)}
              placeholder="Введите описание модуля"
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
						placeholder="Выберите вариант тестирования"
						value={String(formData.testVariant)}
						onValueChange={(value) => {
							if (value === "NONE" || value === "QUIZ") {
								handleChange("testVariant", value);
							}
						}}
						options={testVariantOptions}
						variant="default"
						className="w-full"
					/>

          <SelectFloatingLabel
            placeholder="Выберите правило доступа"
            value={formData.unlockRule}
            onValueChange={(value) => handleChange("unlockRule", value)}
            options={unlockRuleOptions}
            variant="default"
            className="w-full"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={!isFormValid || updateModuleMutation.isPending}
        >
          {updateModuleMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Сохранение...
            </>
          ) : (
            "Сохранить"
          )}
        </Button>
      </form>
    </div>
  );
};
