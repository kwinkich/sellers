import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SelectFloatingLabel } from "@/components/ui/selectFloating";
import { useQuery } from "@tanstack/react-query";
import { SkillsAPI } from "@/entities/skill/model/api/skill.api";
import { useMemo } from "react";
import type { ScaleOption, FormBlockItem } from "@/entities/scenarios/model/types/scenarios.types";

interface ViewAssessYN50BlockProps {
  selectedSkillId?: number;
  questions?: FormBlockItem[];
  scaleOptions?: ScaleOption[];
}

export function ViewAssessYN50Block({ 
  selectedSkillId = 0, 
  questions = [], 
  scaleOptions = []
}: ViewAssessYN50BlockProps) {
  // Fetch selected skill by ID to ensure correct name even if not in options
  const skillQuery = useQuery({
    queryKey: ["skills", "detail", selectedSkillId],
    queryFn: () => SkillsAPI.getSkillById(selectedSkillId),
    enabled: selectedSkillId > 0,
  });
  const selectedSkillName = skillQuery.data?.data?.name ?? (selectedSkillId > 0 ? `Навык #${selectedSkillId}` : "");
  const skillOptions = useMemo(
    () => (selectedSkillId > 0 ? [{ value: String(selectedSkillId), label: selectedSkillName }] : []),
    [selectedSkillId, selectedSkillName]
  );
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-2 px-4">
        <CardTitle>Оценка Да/Нет/50 на 50</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Skill */}
        <div className="space-y-2">
          <SelectFloatingLabel
            className="disabled:opacity-100"
            placeholder="Выберите навык"
            value={String(selectedSkillId)}
            onValueChange={() => {}} // No-op for read-only
            options={skillOptions}
            disabled={true}
          />
        </div>

         {/* Scale Options */}
         {scaleOptions.length > 0 && (
           <div className="space-y-2">
             <Label className="text-sm">Система оценивания:</Label>
             <div className="space-y-2">
               {scaleOptions.map((option, idx) => (
                 <div key={idx} className="flex items-center gap-2">
                   <span className="w-[20px] text-xs text-muted-foreground">{idx + 1}.</span>
                   <div className="flex-1 p-2 bg-gray-50 rounded-xl border">
                     <span className="text-sm font-medium">{option.label}</span>
                   </div>
                 </div>
               ))}
             </div>
           </div>
         )}

        {/* Questions */}
        {questions.length > 0 && (
          <div className="space-y-2">
            <Label>Вопросы:</Label>
            <div className="space-y-2">
              {questions.map((question, index) => (
                <div key={question.id || index} className="p-3 bg-gray-50 rounded-xl border">
                  <div className="flex items-start space-x-2">
                    <span className="text-sm">{question.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
