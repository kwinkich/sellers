import InputFloatingLabel from "@/components/ui/inputFloating";
import { SelectFloatingLabel } from "@/components/ui/selectFloating";
import TextareaFloatingLabel from "@/components/ui/textareaFloating";
import { Button } from "@/components/ui/button";
import { casesQueryOptions } from "@/entities";
import { useUserRole } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ViewCaseFormProps {
  caseId?: number;
}

export function ViewCaseForm({ caseId }: ViewCaseFormProps) {
  const { userId } = useUserRole();
  const navigate = useNavigate();

  // Fetch case data
  const {
    data: caseData,
    isLoading,
    isError,
  } = useQuery({
    ...casesQueryOptions.byId(caseId!),
    enabled: !!caseId,
  });

  const handleExit = () => {
    navigate("/admin/content/cases");
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

  const caseInfo = caseData.data;

  return (
    <div className="space-y-4">
      {/* 1. Название */}
      <div className="space-y-2">
        <InputFloatingLabel
          placeholder="Название"
          value={caseInfo.title}
          disabled={true}
        />
      </div>

      {/* 2. Администратор */}
      <div className="space-y-2">
        <InputFloatingLabel
          placeholder="Администратор"
          value={currentAdminId ? currentAdminId.toString() : ""}
          disabled={true}
        />
      </div>

      {/* 3. Рекомендуемый уровень продавца */}
      <div className="space-y-2">
        <SelectFloatingLabel
          placeholder="Рекомендуемый уровень продавца"
          value={caseInfo.recommendedSellerLevel}
          onValueChange={() => {}} // No-op for read-only
          options={[
            { value: "LEVEL_3", label: "Уровень 3" },
            { value: "LEVEL_4", label: "Уровень 4" },
          ]}
          disabled={true}
        />
      </div>

      {/* 4. Ситуация */}
      <div className="space-y-2">
        <TextareaFloatingLabel
          placeholder="Ситуация"
          value={caseInfo.situation}
          disabled={true}
        />
      </div>

      {/* 5. Легенда продавца */}
      <div className="space-y-2">
        <TextareaFloatingLabel
          placeholder="Легенда продавца"
          value={caseInfo.sellerLegend}
          disabled={true}
        />
      </div>

      {/* 6. Легенда покупателя */}
      <div className="space-y-2">
        <TextareaFloatingLabel
          placeholder="Легенда покупателя"
          value={caseInfo.buyerLegend}
          disabled={true}
        />
      </div>

      {/* 7. Задача продавца */}
      <div className="space-y-2">
        <TextareaFloatingLabel
          placeholder="Задача продавца"
          value={caseInfo.sellerTask}
          disabled={true}
        />
      </div>

      {/* 8. Задача покупателя */}
      <div className="space-y-2">
        <TextareaFloatingLabel
          placeholder="Задача покупателя"
          value={caseInfo.buyerTask}
          disabled={true}
        />
      </div>

      {/* Exit button */}
      <Button
        onClick={handleExit}
        className="w-full mt-2 h-12"
        variant="second"
      >
        Назад к списку кейсов
      </Button>
    </div>
  );
}
