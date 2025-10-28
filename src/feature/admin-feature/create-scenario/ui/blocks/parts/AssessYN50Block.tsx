import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SelectFloatingLabel } from "@/components/ui/selectFloating";
import { SkillsAPI } from "@/entities/skill/model/api/skill.api";
import { useEffect, useMemo, useState } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { createYN50Scale } from "@/shared/lib/scaleUtils";
import type { ScaleOption } from "@/entities/scenarios/model/types/scenarios.types";

interface AssessYN50BlockProps {
  id: string;
  onDelete?: () => void;
  selectedSkillId?: number;
  questions?: Array<{ id: string; text: string; skillId: number }>;
  scaleOptions?: ScaleOption[];
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
  onDataChange,
}: AssessYN50BlockProps) {
  // Skills selection (load all pages in background)
  const [allSkills, setAllSkills] = useState<
    Array<{ id: number; name: string }>
  >([]);
  useEffect(() => {
    let isActive = true;
    const limit = 50;
    async function loadAll() {
      try {
        let page = 1;
        let aggregated: Array<{ id: number; name: string }> = [];
        while (true) {
          const res = await SkillsAPI.getSkillsPaged({ page, limit });
          const items = Array.isArray((res as any)?.data)
            ? ((res as any).data as Array<{ id: number; name: string }>)
            : [];
          aggregated = aggregated.concat(items);
          const pag = (res as any)?.meta?.pagination;
          const currentPage = pag?.currentPage ?? page;
          const totalPages = pag?.totalPages ?? page;
          if (!isActive) return;
          setAllSkills(aggregated);
          if (
            typeof currentPage !== "number" ||
            typeof totalPages !== "number" ||
            currentPage >= totalPages
          )
            break;
          page = currentPage + 1;
        }
      } catch (e) {
        // noop
      }
    }
    loadAll();
    return () => {
      isActive = false;
    };
  }, []);
  const skillOptions = useMemo(
    () => allSkills.map((s) => ({ value: String(s.id), label: s.name })),
    [allSkills]
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Оценка Да/Нет/50 на 50</CardTitle>
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
          {/* 1) Skill selector */}
          <div className="space-y-2">
            <Label className="text-sm">Навык</Label>
            <SelectFloatingLabel
              placeholder="Выберите навык"
              value={String(selectedSkill)}
              onValueChange={(value) => handleSkillChange(parseInt(value))}
              options={skillOptions}
            />
          </div>

          {/* 2) Scale editor */}
          <div className="space-y-2">
            <Label className="text-sm">Система оценивания</Label>
            <div className="space-y-2">
              {scaleOptions.map((option, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-[20px] text-xs text-muted-foreground">
                    {idx + 1}.
                  </span>
                  <Input
                    value={option.label}
                    onChange={(e) => updateScaleLabel(idx, e.target.value)}
                    className="h-10 flex-1"
                    placeholder="Название опции"
                  />
                </div>
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
