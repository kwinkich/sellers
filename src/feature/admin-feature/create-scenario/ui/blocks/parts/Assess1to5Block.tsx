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
import { create1to5Scale } from "@/shared/lib/scaleUtils";
import type { ScaleOption } from "@/entities/scenarios/model/types/scenarios.types";

interface Assess1to5BlockProps {
  id: string;
  onDelete?: () => void;
  prebuiltSkills?: number[];
  selectedSkills?: number[];
  scaleOptionsMulti?: ScaleOption[];
  onDataChange?: (data: {
    selectedSkills: number[];
    scaleOptionsMulti: ScaleOption[];
  }) => void;
}

export function Assess1to5Block({ 
  id, 
  onDelete, 
  prebuiltSkills, 
  selectedSkills: initialSelectedSkills = [], 
  scaleOptionsMulti: initialScaleOptions = create1to5Scale(["плохо", "хорошо", "отлично"]),
  onDataChange 
}: Assess1to5BlockProps) {
  const isPrebuilt = id.includes('prebuilt');
  
  // Scale options with normalized values
  const [scaleOptions, setScaleOptions] = useState<ScaleOption[]>(initialScaleOptions);
  
  // Skills selection
  const { data } = useQuery(skillsQueryOptions.list());
  const skillOptions = useMemo(() => data?.data?.map((s) => ({ value: String(s.id), label: s.name })) ?? [], [data]);
  
  // Initialize with prebuilt skills if provided
  const [selectedSkills, setSelectedSkills] = useState<string[]>(() => {
    if (prebuiltSkills && prebuiltSkills.length > 0) {
      return prebuiltSkills.map(id => String(id));
    }
    if (initialSelectedSkills.length > 0) {
      return initialSelectedSkills.map(id => String(id));
    }
    return [];
  });

  const addSkill = () => {
    const updatedSkills = [...selectedSkills, ""];
    setSelectedSkills(updatedSkills);
    onDataChange?.({
      selectedSkills: updatedSkills.filter(Boolean).map(id => parseInt(id)),
      scaleOptionsMulti: scaleOptions
    });
  };

  const removeSkill = (idx: number) => {
    const updatedSkills = selectedSkills.filter((_, i) => i !== idx);
    setSelectedSkills(updatedSkills);
    onDataChange?.({
      selectedSkills: updatedSkills.filter(Boolean).map(id => parseInt(id)),
      scaleOptionsMulti: scaleOptions
    });
  };

  const updateSkill = (idx: number, value: string) => {
    const updatedSkills = selectedSkills.map((v, i) => (i === idx ? value : v));
    setSelectedSkills(updatedSkills);
    onDataChange?.({
      selectedSkills: updatedSkills.filter(Boolean).map(id => parseInt(id)),
      scaleOptionsMulti: scaleOptions
    });
  };

  const taken = new Set(selectedSkills.filter(Boolean));

  const addScalePoint = () => {
    if (scaleOptions.length < 5) {
      const newLabel = `Опция ${scaleOptions.length + 1}`;
      const newScale = create1to5Scale([...scaleOptions.map(opt => opt.label), newLabel]);
      setScaleOptions(newScale);
      onDataChange?.({
        selectedSkills: selectedSkills.filter(Boolean).map(id => parseInt(id)),
        scaleOptionsMulti: newScale
      });
    }
  };

  const removeScalePoint = () => {
    if (scaleOptions.length > 1) {
      const newScale = scaleOptions.slice(0, -1);
      setScaleOptions(newScale);
      onDataChange?.({
        selectedSkills: selectedSkills.filter(Boolean).map(id => parseInt(id)),
        scaleOptionsMulti: newScale
      });
    }
  };

  const updateScaleLabel = (index: number, label: string) => {
    const updatedScale = scaleOptions.map((opt, i) => 
      i === index ? { ...opt, label } : opt
    );
    setScaleOptions(updatedScale);
    onDataChange?.({
      selectedSkills: selectedSkills.filter(Boolean).map(id => parseInt(id)),
      scaleOptionsMulti: updatedScale
    });
  };

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
          {/* 1) Scale editor */}
          <div className="space-y-2">
            <Label className="text-sm">Система оценивания</Label>
            <div className="space-y-2">
              {scaleOptions.map((option, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-[20px] text-xs text-muted-foreground">{idx + 1}.</span>
                  <Input
                    value={option.label}
                    onChange={(e) => updateScaleLabel(idx, e.target.value)}
                    className="h-10 flex-1"
                    placeholder="Название опции"
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end pt-1">
              <ButtonGroup aria-label="Изменить размер шкалы" className="border rounded-lg overflow-hidden">
                <Button
                  variant="ghost"
                  size="2s"
                  onClick={removeScalePoint}
                  disabled={scaleOptions.length <= 1}
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
                  disabled={scaleOptions.length >= 5}
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
                    options={skillOptions.filter((o) => o.value === val || !taken.has(o.value))}
                  />
                  <Button size="2s" variant="ghost" onClick={() => removeSkill(idx)} aria-label="Удалить">
                    <Trash2 className="h-4 w-4 text-black" />
                  </Button>
                </div>
              ))}
            </div>
            <Button type="button" variant="second" onClick={addSkill} className="h-12 gap-2 w-full text-center">
              <Plus className="h-4 w-4" /> Добавить навык
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}