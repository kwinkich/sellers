import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { EvaluationForm as ApiEvaluationForm } from "@/entities/practice-evaluation/model/types/practice-evaluation.types";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { EvaluationHeader } from "./index";
import { EvaluationTabs } from "./index";
import { EvaluationBlocks } from "./index";
import { EvaluationFooter } from "./index";
import type { EvaluationSubmission } from "@/entities/practice-evaluation/model/types/practice-evaluation.types";
import { useMutation } from "@tanstack/react-query";
import { practiceEvaluationMutationOptions } from "@/entities/practice-evaluation/model/api/practice-evaluation.api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Types for the evaluation page
export interface EvaluationFormData {
  id: number;
  role: "SELLER" | "BUYER" | "MODERATOR";
  evaluatedUserId: number;
  title?: string;
  descr?: string;
  blocks: EvaluationBlock[];
}



export interface EvaluationBlock {
  id?: number;
  type: "TEXT" | "QA" | "SCALE_SKILL_SINGLE" | "SCALE_SKILL_MULTI";
  title?: string;
  required: boolean;
  position: number;
  scale?: {
    id?: number;
    options: Array<{
      id?: number;
      ord: number;
      label: string;
      value: number;
      countsTowardsScore: boolean;
    }>;
  };
  items?: Array<{
    id?: number;
    title?: string;
    position: number;
    skillId: number | null;
  }>;
}

export interface EvaluationResponse {
  forms: EvaluationFormData[];
}

export const EvaluationForm = ({ formsData = [], practiceId }: { formsData?: ApiEvaluationForm[]; practiceId: number }) => {
  const [activeTab, setActiveTab] = useState<string>("");
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  // aggregated answers per role -> per block position
  const [answers, setAnswers] = useState<Record<string, Record<number, any>>>({});
  // per-role completion flags
  const [roleFilled, setRoleFilled] = useState<Record<string, boolean>>({});

  // Build evaluation data from real forms
  const evaluationData: EvaluationResponse = {
    forms: formsData.map((f) => ({
      id: f.id,
      role: f.role,
      evaluatedUserId: f.evaluatedUserId,
      title: f.title ?? undefined,
      descr: f.descr ?? undefined,
      blocks: (f.blocks || []).map((b) => ({
        id: b.id,
        type: (b.type as any) ?? "TEXT",
        title: b.title ?? undefined,
        required: b.required,
        position: b.position,
        scale: b.scale?.options
          ? {
              id: b.scale!.id,
              options: b.scale!.options.map((opt) => ({
                id: opt.id,
                ord: opt.ord,
                label: opt.label,
                value: opt.value,
                countsTowardsScore: opt.countsTowardsScore,
              })),
            }
          : undefined,
        items: (b.items || []).map((it) => ({
          id: it.id,
          title: it.title,
          position: it.position,
          skillId: it.skillId ?? null,
        })),
      })),
    })),
  };
  const isLoading = false;

  // Set initial active tab when data loads
  useEffect(() => {
    if (evaluationData?.forms && evaluationData.forms.length > 0 && !activeTab) {
      setActiveTab(evaluationData.forms[0].role);
    }
  }, [evaluationData, activeTab]);

  // Swipe handling functions
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe || isRightSwipe) {
      const currentIndex = evaluationData?.forms.findIndex(form => form.role === activeTab) ?? 0;
      const totalForms = evaluationData?.forms.length ?? 0;
      
      if (isLeftSwipe && currentIndex < totalForms - 1) {
        // Swipe left - go to next tab
        const nextForm = evaluationData?.forms[currentIndex + 1];
        if (nextForm) setActiveTab(nextForm.role);
      } else if (isRightSwipe && currentIndex > 0) {
        // Swipe right - go to previous tab
        const prevForm = evaluationData?.forms[currentIndex - 1];
        if (prevForm) setActiveTab(prevForm.role);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка форм...</p>
        </div>
      </div>
    );
  }

  if (!evaluationData?.forms || evaluationData.forms.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Нет доступных форм для оценки</p>
        </div>
      </div>
    );
  }

  // Build single-form submission from collected answers
  const buildSubmissionForForm = (form: EvaluationFormData): EvaluationSubmission => {
    const roleAns = answers[form.role] || {};
    const answersArr: any[] = [];
    for (const block of form.blocks) {
      if (block.type === "SCALE_SKILL_SINGLE") {
        const vals = (roleAns[block.position]?.values as Record<number, number>) || {};
        const optByValue: Record<number, number | undefined> = {};
        (block.scale?.options || []).forEach((opt) => {
          if (opt?.id != null) optByValue[opt.value] = opt.id;
        });
        (block.items || []).forEach((it, idx) => {
          const value = vals[idx];
          if (value == null) return;
          answersArr.push({
            blockId: block.id!,
            scaleItemId: it.id!,
            selectedOptionId: optByValue[value]!,
            targetSkillId: it.skillId ?? null,
          });
        });
      } else if (block.type === "SCALE_SKILL_MULTI") {
        const vals = (roleAns[block.position]?.values as Record<number, number>) || {};
        const optByValue: Record<number, number | undefined> = {};
        (block.scale?.options || []).forEach((opt) => {
          if (opt?.id != null) optByValue[opt.value] = opt.id;
        });
        (block.items || []).forEach((it) => {
          const chosen = vals[it.skillId ?? 0];
          if (chosen == null) return;
          answersArr.push({
            blockId: block.id!,
            scaleItemId: it.id!,
            selectedOptionId: optByValue[chosen]!,
            targetSkillId: it.skillId ?? null,
          });
        });
      } else if (block.type === "QA") {
        const txt = roleAns[block.position]?.value as string | undefined;
        if (txt && txt.trim().length > 0) {
          answersArr.push({
            blockId: block.id!,
            textAnswer: txt,
          });
        }
      }
    }
    return { evaluatedUserId: form.evaluatedUserId, answers: answersArr };
  };

  // no actual submit yet; we will log built payloads to console on Finish
  const navigate = useNavigate();
  const { mutateAsync: submitEvaluation, isPending: isSubmitting } = useMutation(
    practiceEvaluationMutationOptions.submit()
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <EvaluationHeader />

      {/* Dynamic Tabs */}
      <div className="bg-white px-4 py-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-gray-100 rounded-xl gap-0">
          <EvaluationTabs forms={evaluationData.forms} activeTab={activeTab} />

          {/* Tab Contents */}
          {evaluationData.forms.map((form) => {
            const handleAnswersChange = useCallback((payload: any) => {
              setAnswers((prev) => {
                const byRole = prev[form.role] ? { ...prev[form.role] } : {};
                byRole[payload.position] = payload;
                const next = { ...prev, [form.role]: byRole };

                // Recompute filled flag for this role immediately
                const currentForm = evaluationData.forms.find((f) => f.role === form.role);
                const computeFilled = () => {
                  if (!currentForm) return false;
                  const roleAns = next[form.role] || {};
                  for (const block of currentForm.blocks) {
                    if (block.type === "QA") {
                      const a = roleAns[block.position]?.value ?? "";
                      if (!a || !String(a).trim()) return false;
                    } else if (block.type === "SCALE_SKILL_SINGLE") {
                      const vals = (roleAns[block.position]?.values as Record<number, number>) || {};
                      const itemsCount = block.items?.length ?? 0;
                      if (Object.keys(vals).length !== itemsCount) return false;
                    } else if (block.type === "SCALE_SKILL_MULTI") {
                      const vals = (roleAns[block.position]?.values as Record<number, number>) || {};
                      const itemsCount = block.items?.length ?? 0;
                      if (Object.keys(vals).length !== itemsCount) return false;
                    }
                  }
                  return true;
                };
                setRoleFilled((prevFlags) => ({ ...prevFlags, [form.role]: computeFilled() }));

                return next;
              });
            }, [evaluationData.forms, form.role]);

            return (
            <TabsContent 
              key={form.role} 
              value={form.role} 
              className="mt-0 data-[state=inactive]:hidden"
              forceMount
            >
              <div 
                className="h-full max-h-[calc(100vh-330px)] overflow-y-auto"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="p-2 space-y-4">
                  <EvaluationBlocks 
                    blocks={form.blocks} 
                    formRole={form.role}
                    onAnswersChange={handleAnswersChange}
                  />
                </div>
              </div>
            </TabsContent>
            );
          })}
        </Tabs>
      </div>

      {/* Footer CTA */}
      <EvaluationFooter 
        isLastTab={activeTab === evaluationData.forms[evaluationData.forms.length - 1].role}
        canFinish={evaluationData.forms.every(f => roleFilled[f.role])}
        loading={isSubmitting}
        onNext={() => {
          const currentIndex = evaluationData.forms.findIndex(f => f.role === activeTab);
          const next = evaluationData.forms[currentIndex + 1];
          if (next) setActiveTab(next.role);
        }}
        onFinish={() => {
          (async () => {
            try {
              for (const form of evaluationData.forms) {
                const submission = buildSubmissionForForm(form);
                await submitEvaluation({ practiceId, data: submission });
              }
              toast.success("Оценка отправлена");
              navigate(`/practice`);
            } catch (e) {
              toast.error("Не удалось отправить оценку");
            }
          })();
        }}
      />
    </div>
  );
};
