import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import type { EvaluationBlock } from "../EvaluationForm";

interface QAEvaluationBlockProps {
  block: EvaluationBlock;
  formRole: string;
  onChange?: (data: { position: number; value: string }) => void;
  showValidation?: boolean;
  isInvalid?: boolean;
}

export const QAEvaluationBlock = ({
  block,
  formRole,
  onChange,
  showValidation,
  isInvalid,
}: QAEvaluationBlockProps) => {
  const [value, setValue] = useState("");

  const borderClass = showValidation && isInvalid ? "border-red-400 ring-2 ring-red-200" : "border-gray-200";

  return (
    <Card className={showValidation && isInvalid ? "border-red-400" : undefined}>
      <CardContent className="p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          {block.title || `Вопрос про ${formRole.toLowerCase()}`}
        </h3>
        <input
          type="text"
          placeholder={`Ваш ответ`}
          className={`w-full p-3 bg-gray-100 border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow`}
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            setValue(v);
            onChange?.({ position: block.position, value: v });
          }}
        />
        {showValidation && isInvalid && (
          <p className="mt-2 text-sm text-red-500">
            Заполните ответ перед переходом
          </p>
        )}
      </CardContent>
    </Card>
  );
};
