import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { skillsQueryOptions } from "@/entities/skill/model/api/skill.api";
import { useMemo } from "react";
import type { ScaleOption, FormBlockItem } from "@/entities/scenarios/model/types/scenarios.types";

interface ViewAssess1to5BlockProps {
  selectedSkills?: number[];
  items?: FormBlockItem[];
  scaleOptions?: ScaleOption[];
}

export function ViewAssess1to5Block({ 
  selectedSkills = [], 
  items = [], 
  scaleOptions = []
}: ViewAssess1to5BlockProps) {
  const { data } = useQuery(skillsQueryOptions.list());
  const skillOptions = useMemo(() => data?.data?.map((s) => ({ value: String(s.id), label: s.name })) ?? [], [data]);
  
  const selectedSkillNames = selectedSkills
    .map(skillId => skillOptions.find(s => s.value === String(skillId))?.label)
    .filter(Boolean);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-2 px-4">
        <CardTitle>Оценка по шкале</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Skills */}
        {selectedSkills.length > 0 && (
          <div className="space-y-2">
            <Label>Выбранные навыки</Label>
            <div className="flex flex-wrap gap-2">
              {selectedSkillNames.map((skillName, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-lg">
                  {skillName}
                </span>
              ))}
            </div>
          </div>
        )}

         {/* Scale Options */}
         {scaleOptions.length > 0 && (
           <div className="space-y-2">
             <Label className="text-sm">Система оценивания</Label>
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

        {/* Skills/Items */}
        {items.length > 0 && (
          <div className="space-y-2">
            <Label>Навыки для оценки</Label>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={item.id || index} className="p-3 bg-gray-50 rounded-xl border">
                  <div className="flex items-start space-x-2">
                    <span className="text-sm font-medium text-gray-600 min-w-[20px]">
                      {index + 1}.
                    </span>
                    <span className="text-sm">{item.title}</span>
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
