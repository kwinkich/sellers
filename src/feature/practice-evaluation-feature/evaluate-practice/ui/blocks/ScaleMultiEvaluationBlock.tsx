import { Card, CardContent } from "@/components/ui/card";
import * as React from "react";
import type { EvaluationBlock } from "../EvaluationForm";

interface ScaleMultiEvaluationBlockProps {
  block: EvaluationBlock;
  formRole: string;
  onChange?: (data: { position: number; values: Record<number, number> }) => void;
  showValidation?: boolean;
  isInvalid?: boolean;
  readOnly?: boolean;
}

export const ScaleMultiEvaluationBlock = ({
  block,
  formRole,
  onChange,
  showValidation,
  isInvalid,
  readOnly = false,
}: ScaleMultiEvaluationBlockProps) => {
  // Controlled selection per skill
  const [answers, setAnswers] = React.useState<Record<number, number>>({});

  // Notify parent AFTER render commit when answers change
  React.useEffect(() => {
    if (onChange) onChange({ position: block.position, values: answers });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers]);

  const cardHighlight = showValidation && isInvalid ? "border-red-400 ring-2 ring-red-200" : "";

  return (
    <Card className={[cardHighlight, readOnly ? "opacity-100" : ""].filter(Boolean).join(" ")}>
      <CardContent className="p-4">
        <h3 className="mb-3 text-sm font-bold text-gray-800">
          Оценка по шкале
        </h3>
        
        <div className="space-y-4">
          {block.items?.map((item, itemIndex) => {
            const groupName = `${formRole}-skill-${item.skillId}`;
            const selected = answers[item.skillId ?? 0];

            return (
              <div key={itemIndex} className="flex flex-col gap-3">
                <h4 className="text-sm font-medium text-gray-800">{item.title || "Неизвестный навык"}</h4>

                <div className="space-y-2">
                  {block.scale?.options.map((option) => (
                    <label
                      key={option.ord}
                      className={`flex items-center justify-start gap-3 p-2 rounded-lg transition-colors ${
                        readOnly ? "cursor-default" : "cursor-pointer hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={groupName}
                        value={option.value}
                        className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                        checked={selected === option.value}
                        disabled={readOnly}
                        onChange={() => {
                          if (readOnly) return;
                          setAnswers((prev) => ({ ...prev, [item.skillId ?? 0]: option.value }));
                        }}
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {showValidation && isInvalid && (
          <p className="mt-3 text-sm text-red-500">
            Выберите оценку для каждого навыка
          </p>
        )}
      </CardContent>
    </Card>
  );
};
