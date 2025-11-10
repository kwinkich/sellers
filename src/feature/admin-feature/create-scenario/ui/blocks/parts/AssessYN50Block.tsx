import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SelectFloatingLabel } from "@/components/ui/selectFloating";
import { useQuery } from "@tanstack/react-query";
import { skillsQueryOptions } from "@/entities/skill/model/api/skill.api";
import { useMemo, useState } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { createYN50Scale } from "@/shared/lib/scaleUtils";
import type { ScaleOption } from "@/entities/scenarios/model/types/scenarios.types";
import { cn } from "@/lib/utils";

interface AssessYN50BlockProps {
  id: string;
  onDelete?: () => void;
  selectedSkillId?: number;
  questions?: Array<{ id: string; text: string; skillId: number }>;
  scaleOptions?: ScaleOption[];
  showValidation?: boolean;
  onDataChange?: (data: {
    selectedSkillId: number;
    questions: Array<{ id: string; text: string; skillId: number }>;
    scaleOptions: ScaleOption[];
  }) => void;
}

export function AssessYN50Block({
  id,
  onDelete,
  selectedSkillId = 0,
  questions = [],
  scaleOptions: initialScaleOptions = createYN50Scale(),
  showValidation = false,
  onDataChange,
}: AssessYN50BlockProps) {
  // Use warmed all-skills cache
  const { data: allSkillsResp } = useQuery(
    skillsQueryOptions.all({ by: "name", order: "asc" })
  );
  const skillOptions = useMemo(
    () =>
      (allSkillsResp?.data ?? []).map((s) => ({
        value: String(s.id),
        label: s.name,
      })),
    [allSkillsResp]
  );

  // Scale options with normalized values
  const [scaleOptions, setScaleOptions] =
    useState<ScaleOption[]>(initialScaleOptions);

  // Questions with skill assignment
  const [questionsState, setQuestionsState] =
    useState<Array<{ id: string; text: string; skillId: number }>>(questions);

  const [selectedSkill, setSelectedSkill] = useState(selectedSkillId);

  const addQuestion = () => {
    const newQuestion = {
      id: `${id}-q-${Date.now()}`,
      text: "",
      skillId: selectedSkill,
    };
    const updatedQuestions = [...questionsState, newQuestion];
    setQuestionsState(updatedQuestions);
    onDataChange?.({
      selectedSkillId: selectedSkill,
      questions: updatedQuestions,
      scaleOptions,
    });
  };

  const removeQuestion = (questionId: string) => {
    const updatedQuestions = questionsState.filter((q) => q.id !== questionId);
    setQuestionsState(updatedQuestions);
    onDataChange?.({
      selectedSkillId: selectedSkill,
      questions: updatedQuestions,
      scaleOptions,
    });
  };

  const updateQuestion = (
    questionId: string,
    field: "text" | "skillId",
    value: string | number
  ) => {
    const updatedQuestions = questionsState.map((q) =>
      q.id === questionId ? { ...q, [field]: value } : q
    );
    setQuestionsState(updatedQuestions);
    onDataChange?.({
      selectedSkillId: selectedSkill,
      questions: updatedQuestions,
      scaleOptions,
    });
  };

  const updateScaleLabel = (index: number, label: string) => {
    const updatedScale = scaleOptions.map((opt, i) =>
      i === index ? { ...opt, label } : opt
    );
    setScaleOptions(updatedScale);
    onDataChange?.({
      selectedSkillId: selectedSkill,
      questions: questionsState,
      scaleOptions: updatedScale,
    });
  };

  const handleSkillChange = (skillId: number) => {
    setSelectedSkill(skillId);
    // Update all questions to use the new skill
    const updatedQuestions = questionsState.map((q) => ({ ...q, skillId }));
    setQuestionsState(updatedQuestions);
    onDataChange?.({
      selectedSkillId: skillId,
      questions: updatedQuestions,
      scaleOptions,
    });
  };

  // Validation: skill must be selected and at least 1 question with text
  const isValid = useMemo(() => {
    const hasSkill = selectedSkill > 0;
    const hasValidQuestions = questionsState.some(
      (q) => q.text && q.text.trim().length > 0
    );
    return hasSkill && hasValidQuestions;
  }, [selectedSkill, questionsState]);

  const validationMessage = useMemo(() => {
    if (!selectedSkill || selectedSkill === 0) {
      return "Необходимо выбрать навык";
    }
    if (!questionsState.some((q) => q.text && q.text.trim().length > 0)) {
      return "Необходимо добавить хотя бы один вопрос с текстом";
    }
    return null;
  }, [selectedSkill, questionsState]);

  return (
    <Card
      data-block-id={id}
      className={cn(
        "transition-colors",
        !isValid && showValidation && "border-amber-500 border-1"
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Оценка Нет/50на50/Да/?</CardTitle>
        <Button
          size="2s"
          variant="ghost"
          onClick={onDelete}
          aria-label="Удалить блок"
        >
          <X className="h-5 w-5 text-black" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {validationMessage && showValidation && (
            <div className="text-sm text-amber-700 bg-amber-50 p-2 rounded-md">
              {validationMessage}
            </div>
          )}
          {/* 1) Skill selector */}
          <div className="space-y-2">
            <Label className="text-sm">Навык</Label>
            <SelectFloatingLabel
              placeholder="Выберите навык"
              value={String(selectedSkill)}
              onValueChange={(value) => handleSkillChange(parseInt(value))}
              options={skillOptions}
              className="cursor-pointer"
            />
          </div>

          {/* 2) Scale editor */}
          <div className="space-y-2">
            <Label className="text-sm">Система оценивания</Label>
            <div className="flex gap-2">
              {scaleOptions.map((option, idx) => (
                <Input
                  key={idx}
                  value={option.label}
                  onChange={(e) => updateScaleLabel(idx, e.target.value)}
                  className="h-10 flex-1 disabled:opacity-100 text-center p-0"
                  placeholder="Название опции"
                  disabled={true}
                />
              ))}
            </div>
          </div>

          {/* 3) Questions */}
          <div className="space-y-2">
            <Label className="text-sm">Вопросы</Label>
            <div className="space-y-2">
              {questionsState.map((question) => (
                <div key={question.id} className="flex items-center gap-2">
                  <Input
                    value={question.text}
                    onChange={(e) =>
                      updateQuestion(question.id, "text", e.target.value)
                    }
                    placeholder="Введите вопрос"
                    className="h-10 flex-1"
                  />
                  <Button
                    size="2s"
                    variant="ghost"
                    onClick={() => removeQuestion(question.id)}
                    aria-label="Удалить вопрос"
                  >
                    <Trash2 className="h-4 w-4 text-black" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="second"
              onClick={addQuestion}
              className="h-12 gap-2 w-full text-center"
            >
              <Plus className="h-4 w-4" /> Добавить вопрос
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
