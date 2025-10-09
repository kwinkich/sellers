import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { skillsQueryOptions } from "@/entities/skill/model/api/skill.api";
import * as React from "react";
import type { EvaluationBlock } from "../EvaluationForm";

interface ScaleSingleEvaluationBlockProps {
  block: EvaluationBlock;
  formRole: string;
  onChange?: (data: { position: number; values: Record<number, number> }) => void;
}

// default text colors by ord: 0→rose, 1→amber, 2→emerald, 3→slate
const textColorsByOrd: Record<number, string> = {
  0: "text-rose-600",
  1: "text-amber-600", 
  2: "text-emerald-600",
  3: "text-slate-600",
};

// selected background colors by ord
const selectedByOrd: Record<number, string> = {
  0: "peer-checked:bg-rose-100 peer-checked:border-rose-300",
  1: "peer-checked:bg-amber-100 peer-checked:border-amber-300",
  2: "peer-checked:bg-emerald-100 peer-checked:border-emerald-300",
  3: "peer-checked:bg-slate-300 peer-checked:border-slate-400",
};

export const ScaleSingleEvaluationBlock = ({
  block,
  formRole,
  onChange,
}: ScaleSingleEvaluationBlockProps) => {
  // Resolve skill name by skillId of the first item
  const firstSkillId = block.items?.[0]?.skillId;

  const { data: skillRes } = useQuery({
    ...skillsQueryOptions.byId(firstSkillId as number),
    enabled: !!firstSkillId,
  });

  const skillTitle = skillRes?.data?.name ?? block.items?.[0]?.title ?? "Неизвестный навык";

  // controlled selection per item index (no default check)
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
          Навык: {skillTitle}
        </h3>

        <div className="space-y-3">
          {block.items?.map((item, itemIndex) => {
            const groupName = `${formRole}-scale-${block.position}-${itemIndex}`;
            const selected = answers[itemIndex];

            return (
              <div key={itemIndex} className="flex flex-col gap-3">
                <h4 className="text-sm font-medium text-gray-800">{item.title}</h4>

                <div className="flex gap-2 items-stretch">
                  {block.scale?.options.map((option) => (
                    <label key={option.ord} className="relative flex-1 min-w-0">
                      <input
                        type="radio"
                        name={groupName}
                        value={option.value}
                        className="peer absolute inset-0 h-0 w-0 opacity-0 pointer-events-none appearance-none"
                        checked={selected === option.value}
                        onChange={() =>
                          setAnswers((prev) => ({ ...prev, [itemIndex]: option.value }))
                        }
                      />
                       <div
                         className={[
                           // base unselected "chip"
                           "select-none rounded-xl px-0 py-2 text-center transition-colors",
                           "bg-muted hover:bg-muted/80 border border-transparent box-border",
                           // default text color by ord
                           textColorsByOrd[option.ord] ?? "text-foreground/80",
                           // selected background colors by ord
                           selectedByOrd[option.ord] ?? "peer-checked:bg-muted",
                           // focus ring when navigating by keyboard
                           "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-emerald-400",
                         ].join(" ")}
                       >
                        {option.label}
                      </div>
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
