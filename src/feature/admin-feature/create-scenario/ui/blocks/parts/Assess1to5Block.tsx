import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SelectFloatingLabel } from "@/components/ui/selectFloating";
import { useQuery } from "@tanstack/react-query";
import { skillsQueryOptions } from "@/entities/skill/model/api/skill.api";
import { useMemo, useState } from "react";
import { Plus, Minus, X, Trash2 } from "lucide-react";
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group";

export function Assess1to5Block({ id, onDelete, prebuiltSkills }: { id: string; onDelete?: () => void; prebuiltSkills?: number[] }) {
  const isPrebuilt = id.includes('prebuilt');
  // editable scale labels
  const [scale, setScale] = useState<string[]>(["плохо", "хорошо", "отлично"]); // up to 5

  const addScalePoint = () => {
    setScale((prev) => (prev.length < 5 ? [...prev, String(prev.length + 1)] : prev));
  };
  const updateScalePoint = (idx: number, v: string) => {
    setScale((prev) => prev.map((s, i) => (i === idx ? v : s)));
  };

  // unique skills selection list
  const { data } = useQuery(skillsQueryOptions.list());
  const options = useMemo(() => data?.data?.map((s) => ({ value: String(s.id), label: s.name })) ?? [], [data]);
  
  // Initialize with prebuilt skills if provided
  const [selectedSkills, setSelectedSkills] = useState<string[]>(() => {
    if (prebuiltSkills && prebuiltSkills.length > 0) {
      return prebuiltSkills.map(id => String(id));
    }
    return [];
  });

  const addSkill = () => setSelectedSkills((prev) => [...prev, ""]);
  const removeSkill = (idx: number) => setSelectedSkills((prev) => prev.filter((_, i) => i !== idx));
  const updateSkill = (idx: number, value: string) =>
    setSelectedSkills((prev) => prev.map((v, i) => (i === idx ? value : v)));

  const taken = new Set(selectedSkills.filter(Boolean));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {isPrebuilt ? "Предустановленная оценка" : "Оценка по шкале"}
        </CardTitle>
        <Button size="2s" variant="ghost" onClick={onDelete} aria-label="Удалить блок">
          <X className="h-5 w-5 text-black" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 1) Scale editor (1..5, default 1..3) */}
          <div className="space-y-2">
            <Label className="text-sm">Система оценивания</Label>
            <div className="space-y-2">
              {scale.map((s, idx) => (
                <div key={`${idx}-${id}`} className="flex items-center gap-2">
                  <span className="w-[20px] text-xs text-muted-foreground">{idx + 1}.</span>
                  <Input
                    value={s}
                    onChange={(e) => updateScalePoint(idx, e.target.value)}
                    className="h-10 flex-1"
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end pt-1">
              <ButtonGroup aria-label="Изменить размер шкалы" className="border rounded-lg overflow-hidden">
                <Button
                  variant="ghost"
                  size="2s"
                  onClick={() => setScale((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev))}
                  aria-label="Уменьшить шкалу"
                  className="h-6"
                >
                  <Minus className="text-black" />
                </Button>
                <ButtonGroupSeparator />
                <Button
                  variant="ghost"
                  size="2s"
                  onClick={addScalePoint}
                  disabled={scale.length >= 5}
                  aria-label="Увеличить шкалу"
                  className="h-6"
                >
                  <Plus className="text-black" />
                </Button>
              </ButtonGroup>
            </div>
          </div>

          {/* 2) Skills (unique) */}
          <div className="space-y-2">
            <Label className="text-sm">Навыки</Label>
            <div className="space-y-2">
              {selectedSkills.map((val, idx) => (
                <div key={`${idx}-${id}`} className="flex items-center gap-2">
                  <SelectFloatingLabel
                    placeholder="Выберите навык"
                    value={val}
                    onValueChange={(v) => updateSkill(idx, v)}
                    options={options.filter((o) => o.value === val || !taken.has(o.value))}
                  />
                  <Button size="2s" variant="ghost" onClick={() => removeSkill(idx)} aria-label="Удалить">
                    <Trash2 className="h-4 w-4 text-black" />
                  </Button>
                </div>
              ))}
            </div>
            <Button type="button" onClick={addSkill} className="h-12 gap-2 w-full text-center">
              <Plus className="h-4 w-4" /> Добавить навык
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



