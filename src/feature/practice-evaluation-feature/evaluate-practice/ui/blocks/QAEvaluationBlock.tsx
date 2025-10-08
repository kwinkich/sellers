import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import type { EvaluationBlock } from "../EvaluationForm";

interface QAEvaluationBlockProps {
  block: EvaluationBlock;
  formRole: string;
  onChange?: (data: { position: number; value: string }) => void;
}

export const QAEvaluationBlock = ({ block, formRole, onChange }: QAEvaluationBlockProps) => {
  const [value, setValue] = useState("");

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          {block.title || `Вопрос про ${formRole.toLowerCase()}`}
        </h3>
        <input
          type="text"
          placeholder={`Ваш ответ`}
          className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            setValue(v);
          }}
          onBlur={() => onChange?.({ position: block.position, value })}
        />
      </CardContent>
    </Card>
  );
};
