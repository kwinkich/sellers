import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { ScaleOption, FormBlockItem } from "@/entities/scenarios/model/types/scenarios.types";

interface ViewAssess1to5BlockProps {
  selectedSkills?: number[];
  items?: FormBlockItem[];
  scaleOptions?: ScaleOption[];
}

export function ViewAssess1to5Block({ 
  items = [], 
  scaleOptions = []
}: ViewAssess1to5BlockProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-2 px-4">
        <CardTitle>Оценка по шкале</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

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
