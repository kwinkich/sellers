import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { skillsQueryOptions } from "@/entities/skill/model/api/skill.api";

interface Option {
  id?: number;
  ord: number;
  label: string;
  value: number;
}

export const ScaleSingleReportBlock = ({
  items,
  options,
  results,
}: {
  items: {
    id?: number;
    title?: string;
    position: number;
    skillId: number | null;
  }[];
  options: Option[];
  results: Array<
    { avgValue: number; closestOptionId: number; n: number } | null | undefined
  >;
}) => {
  // Create option lookup by ID for efficient matching
  const optionById = new Map<number, Option>();
  options.forEach((opt) => {
    if (opt.id != null) {
      optionById.set(opt.id, opt);
    }
  });

  const firstSkillId = items?.[0]?.skillId;

  const { data: skillRes } = useQuery({
    ...skillsQueryOptions.byId(firstSkillId as number),
    enabled: !!firstSkillId,
  });

  const skillName =
    skillRes?.data?.name ?? items?.[0]?.title ?? "Неизвестный навык";

  // Color maps copied from evaluation block for consistent styling
  const textColorsByOrd: Record<number, string> = {
    0: "text-rose-600",
    1: "text-amber-600",
    2: "text-emerald-600",
    3: "text-slate-600",
  };
  const selectedBgByOrd: Record<number, string> = {
    0: "bg-rose-100",
    1: "bg-amber-100",
    2: "bg-emerald-100",
    3: "bg-slate-300",
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="mb-3 text-sm font-bold text-gray-800">
          Навык: {skillName}
        </h3>
        <div className="space-y-3">
          {items.map((item, index) => {
            // Only process items that have valid IDs
            if (item.id == null) {
              console.warn("Item missing ID:", item);
              return null;
            }

            const result = results[index];
            const selectedOptionId = result?.closestOptionId;

            return (
              <div key={item.id} className="flex flex-col gap-2">
                <div className="text-sm font-medium text-gray-800">
                  {item.title}
                </div>
                <div className="flex gap-2">
                  {options.map((opt) => {
                    const isSelected = selectedOptionId === opt.id;
                    const base =
                      "flex-1 text-center rounded-xl px-0 py-2 transition-colors";
                    const textColor =
                      textColorsByOrd[opt.ord] ?? "text-foreground/80";
                    const selectedBg = selectedBgByOrd[opt.ord] ?? "bg-muted";
                    const className = isSelected
                      ? `${base} ${selectedBg} ${textColor}`
                      : `${base} bg-muted ${textColor}`;
                    return (
                      <div key={opt.ord} className={className}>
                        {opt.label}
                      </div>
                    );
                  })}
                </div>
                {result == null ? (
                  <div className="text-sm text-amber-600 mt-1">Нет оценок</div>
                ) : (
                  <div className="text-xs text-gray-500 mt-1">
                    Ответов: {result.n}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
