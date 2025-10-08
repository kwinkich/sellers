import { Card, CardContent } from "@/components/ui/card";

interface Option {
  id?: number;
  ord: number;
  label: string;
  value: number;
}

export const ScaleMultiReportBlock = ({
  items,
  options,
  answers,
}: {
  items: { id?: number; title?: string; position: number; skillId: number | null }[];
  options: Option[];
  answers: Array<{ scaleItemId?: number | null; selectedOptionId?: number | null }>;
}) => {
  // Create a proper mapping: scaleItemId -> selectedOptionId
  const answerMap = new Map<number, number>();
  answers.forEach((answer) => {
    if (answer.scaleItemId != null && answer.selectedOptionId != null) {
      answerMap.set(answer.scaleItemId, answer.selectedOptionId);
    }
  });

  // Create option lookup by ID for efficient matching
  const optionById = new Map<number, Option>();
  options.forEach((opt) => {
    if (opt.id != null) {
      optionById.set(opt.id, opt);
    }
  });

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="mb-3 text-sm font-bold text-gray-800">Оценивание нескольких навыков</h3>
        
        <div className="space-y-4">
          {items.map((item) => {
            // Only process items that have valid IDs
            if (item.id == null) {
              console.warn('Item missing ID:', item);
              return null;
            }

            const selectedOptionId = answerMap.get(item.id);

            return (
              <div key={item.id} className="flex flex-col gap-3">
                <h4 className="text-sm font-medium text-gray-800">{item.title || "Неизвестный навык"}</h4>

                <div className="space-y-2">
                  {options.map((option) => {
                    const isSelected = selectedOptionId === option.id;
                    return (
                      <div 
                        key={option.ord} 
                        className="flex items-center justify-start gap-3 cursor-pointer p-2 rounded-lg transition-colors"
                      >
                        <input
                          type="radio"
                          className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                          checked={isSelected}
                          readOnly
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};


