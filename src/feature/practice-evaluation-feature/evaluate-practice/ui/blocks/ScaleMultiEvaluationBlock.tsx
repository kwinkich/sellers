import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { skillsQueryOptions } from "@/entities/skill/model/api/skill.api";
import * as React from "react";
import type { EvaluationBlock } from "../EvaluationForm";

interface ScaleMultiEvaluationBlockProps {
  block: EvaluationBlock;
  formRole: string;
  onChange?: (data: { position: number; values: Record<number, number> }) => void;
}

export const ScaleMultiEvaluationBlock = ({ block, formRole, onChange }: ScaleMultiEvaluationBlockProps) => {
  // Fetch skills data to get skill names
  const { data: skillsData } = useQuery(skillsQueryOptions.list());
  
  // Controlled selection per skill
  const [answers, setAnswers] = React.useState<Record<number, number>>({});

  // Notify parent AFTER render commit when answers change
  React.useEffect(() => {
    if (onChange) onChange({ position: block.position, values: answers });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers]);

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="mb-3 text-sm font-bold text-gray-800">
          Оценивание нескольких навыков
        </h3>
        
        <div className="space-y-4">
          {block.items?.map((item, itemIndex) => {
            const skill = skillsData?.data?.find(s => s.id === item.skillId);
            const groupName = `${formRole}-skill-${item.skillId}`;
            const selected = answers[item.skillId];

            return (
              <div key={itemIndex} className="flex flex-col gap-3">
                <h4 className="text-sm font-medium text-gray-800">
                  {skill?.name || "Неизвестный навык"}
                </h4>

                <div className="space-y-2">
                  {block.scale?.options.map((option) => (
                    <label key={option.ord} className="flex items-center justify-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                      <input
                        type="radio"
                        name={groupName}
                        value={option.value}
                        className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                        checked={selected === option.value}
                        onChange={() =>
                          setAnswers((prev) => ({ ...prev, [item.skillId]: option.value }))
                        }
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
