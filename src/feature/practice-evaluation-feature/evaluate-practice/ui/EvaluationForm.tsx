import { useState, useEffect, useCallback, useMemo } from "react";
import type { EvaluationForm as ApiEvaluationForm } from "@/entities/practice-evaluation/model/types/practice-evaluation.types";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { EvaluationHeader } from "./index";
import { EvaluationTabs } from "./index";
import { EvaluationBlocks } from "./index";
import { EvaluationFooter } from "./index";
import type {
  EvaluationSubmission,
  EvaluationBatchSubmission,
} from "@/entities/practice-evaluation/model/types/practice-evaluation.types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { practiceEvaluationMutationOptions } from "@/entities/practice-evaluation/model/api/practice-evaluation.api";
import { handleFormSuccess, handleFormError } from "@/shared";
import { useNavigate } from "react-router-dom";
import { PracticesAPI } from "@/entities/practices/model/api/practices.api";
import { useUploadRecordingStore } from "@/feature/practice-feature/model/uploadRecording.store";
import { useEdgeSwipeGuard, useTelegramVerticalSwipes } from "@/shared";

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

export const EvaluationForm = ({
  formsData = [],
  practiceId,
}: {
  formsData?: ApiEvaluationForm[];
  practiceId: number;
}) => {
  const [activeTab, setActiveTab] = useState<string>("");
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, Record<number, any>>>(
    {}
  );
  const [roleFilled, setRoleFilled] = useState<Record<string, boolean>>({});
  const [validationTriggered, setValidationTriggered] = useState<
    Record<string, boolean>
  >({});
  const [invalidBlocks, setInvalidBlocks] = useState<
    Record<string, Set<number>>
  >({});

  const navigate = useNavigate();
  const showUploadModal = useUploadRecordingStore((s) => s.show);
  const guardRef = useEdgeSwipeGuard();

  // Disable Telegram vertical swipes to prevent accidental app close during evaluation
  useTelegramVerticalSwipes(true);

  const { data: practiceData } = useQuery({
    queryKey: ["practices", "detail", practiceId],
    queryFn: () => PracticesAPI.getPracticeById(practiceId),
  });

  // Build evaluation data from real forms
  const forms: EvaluationFormData[] = useMemo(
    () =>
      (formsData || []).map((f) => ({
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
    [formsData]
  );

  const isBlockValid = useCallback(
    (
      block: EvaluationBlock,
      roleAnswers: Record<number, any>
    ): boolean => {
      if (!block.required) return true;

      const answerPayload = roleAnswers?.[block.position];

      switch (block.type) {
        case "QA": {
          const value = answerPayload?.value;
          return !!value && String(value).trim().length > 0;
        }
        case "SCALE_SKILL_SINGLE": {
          const itemsCount = block.items?.length ?? 0;
          if (itemsCount === 0) return true;
          const values =
            (answerPayload?.values as Record<number, number>) || {};
          for (let idx = 0; idx < itemsCount; idx++) {
            const val = values[idx];
            if (val === undefined || val === null) {
              return false;
            }
          }
          return true;
        }
        case "SCALE_SKILL_MULTI": {
          const items = block.items ?? [];
          if (items.length === 0) return true;
          const values =
            (answerPayload?.values as Record<number, number>) || {};
          return items.every((item, index) => {
            const key = item.skillId ?? index;
            const val = values[key];
            return val !== undefined && val !== null;
          });
        }
        default:
          return true;
      }
    },
    []
  );

  const calculateInvalidBlocks = useCallback(
    (form: EvaluationFormData, roleAnswers: Record<number, any>) => {
      const invalid = new Set<number>();
      form.blocks.forEach((block) => {
        if (!isBlockValid(block, roleAnswers || {})) {
          invalid.add(block.position);
        }
      });
      return invalid;
    },
    [isBlockValid]
  );

  // Set initial active tab when data loads
  useEffect(() => {
    if (forms.length > 0 && !activeTab) {
      setActiveTab(forms[0].role);
    }
  }, [forms, activeTab]);

  useEffect(() => {
    if (forms.length === 0) return;

    const initialValidation: Record<string, boolean> = {};
    const initialInvalid: Record<string, Set<number>> = {};
    const initialFilled: Record<string, boolean> = {};

    forms.forEach((form) => {
      initialValidation[form.role] = false;
      const invalid = calculateInvalidBlocks(form, {});
      initialInvalid[form.role] = invalid;
      initialFilled[form.role] = invalid.size === 0;
    });

    setValidationTriggered(initialValidation);
    setInvalidBlocks(initialInvalid);
    setRoleFilled(initialFilled);
  }, [forms, calculateInvalidBlocks]);

  const handleNext = useCallback(() => {
    const currentIndex = forms.findIndex((form) => form.role === activeTab);
    if (currentIndex === -1) return;

    const currentForm = forms[currentIndex];
    const roleAnswers = answers[currentForm.role] || {};
    const invalid = calculateInvalidBlocks(currentForm, roleAnswers);

    setInvalidBlocks((prev) => ({ ...prev, [currentForm.role]: invalid }));

    if (invalid.size > 0) {
      setValidationTriggered((prev) => ({
        ...prev,
        [currentForm.role]: true,
      }));
      setRoleFilled((prev) => ({
        ...prev,
        [currentForm.role]: false,
      }));

      const firstInvalid = Array.from(invalid)[0];
      if (firstInvalid !== undefined) {
        requestAnimationFrame(() => {
          const el = document.querySelector(
            `[data-eval-block="${currentForm.role}-${firstInvalid}"]`
          );
          if (el instanceof HTMLElement) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        });
      }
      return;
    }

    setRoleFilled((prev) => ({
      ...prev,
      [currentForm.role]: true,
    }));
    setValidationTriggered((prev) => ({
      ...prev,
      [currentForm.role]: false,
    }));

    if (currentIndex < forms.length - 1) {
      setActiveTab(forms[currentIndex + 1].role);
    }
  }, [activeTab, answers, forms, calculateInvalidBlocks]);

  const handleTabChange = useCallback(
    (value: string) => {
      if (value === activeTab) return;

      const currentIndex = forms.findIndex((form) => form.role === activeTab);
      const targetIndex = forms.findIndex((form) => form.role === value);

      if (currentIndex === -1 || targetIndex === -1) {
        setActiveTab(value);
        return;
      }

      if (targetIndex > currentIndex) {
        const currentForm = forms[currentIndex];
        const roleAnswers = answers[currentForm.role] || {};
        const invalid = calculateInvalidBlocks(currentForm, roleAnswers);

        setInvalidBlocks((prev) => ({ ...prev, [currentForm.role]: invalid }));

        if (invalid.size > 0) {
          setValidationTriggered((prev) => ({
            ...prev,
            [currentForm.role]: true,
          }));
          setRoleFilled((prev) => ({
            ...prev,
            [currentForm.role]: false,
          }));

          const firstInvalid = Array.from(invalid)[0];
          if (firstInvalid !== undefined) {
            requestAnimationFrame(() => {
              const el = document.querySelector(
                `[data-eval-block="${currentForm.role}-${firstInvalid}"]`
              );
              if (el instanceof HTMLElement) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            });
          }
          return;
        }

        setRoleFilled((prev) => ({
          ...prev,
          [currentForm.role]: true,
        }));
        setValidationTriggered((prev) => ({
          ...prev,
          [currentForm.role]: false,
        }));
      }

      setActiveTab(value);
    },
    [activeTab, answers, forms, calculateInvalidBlocks]
  );

  // Swipe handling functions
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      const currentIndex = forms.findIndex((form) => form.role === activeTab);
      if (currentIndex > 0) {
        setActiveTab(forms[currentIndex - 1].role);
      }
    }
  };

  if (forms.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Нет доступных форм для оценки</p>
        </div>
      </div>
    );
  }

  // Build single-form submission from collected answers
  const buildSubmissionForForm = (
    form: EvaluationFormData
  ): EvaluationSubmission => {
    const roleAns = answers[form.role] || {};
    const answersArr: any[] = [];
    for (const block of form.blocks) {
      if (block.type === "SCALE_SKILL_SINGLE") {
        const vals =
          (roleAns[block.position]?.values as Record<number, number>) || {};
        const optByValue: Record<number, number | undefined> = {};
        (block.scale?.options || []).forEach((opt) => {
          if (opt?.id != null) optByValue[opt.value] = opt.id;
        });
        (block.items || []).forEach((it, idx) => {
          const value = vals[idx];
          if (value == null) return;
          answersArr.push({
            blockId: block.id!,
            itemId: it.id!,
            selectedOptionId: optByValue[value]!,
            targetSkillId: it.skillId ?? null,
          });
        });
      } else if (block.type === "SCALE_SKILL_MULTI") {
        const vals =
          (roleAns[block.position]?.values as Record<number, number>) || {};
        const optByValue: Record<number, number | undefined> = {};
        (block.scale?.options || []).forEach((opt) => {
          if (opt?.id != null) optByValue[opt.value] = opt.id;
        });
        (block.items || []).forEach((it) => {
          const chosen = vals[it.skillId ?? 0];
          if (chosen == null) return;
          answersArr.push({
            blockId: block.id!,
            itemId: it.id!,
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

  const { mutateAsync: submitEvaluation, isPending: isSubmitting } =
    useMutation(practiceEvaluationMutationOptions.submit());

  return (
    <div className="h-svh overflow-hidden grid grid-rows-[auto,1fr,auto] bg-white">
      {/* Header */}
      <EvaluationHeader />

      {/* Dynamic Tabs - Single scroller */}
      <div
        ref={guardRef}
        className="min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y [-webkit-overflow-scrolling:touch]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="bg-white px-4 py-0">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="bg-gray-100 rounded-xl gap-0"
          >
            <EvaluationTabs forms={forms} activeTab={activeTab} />

            {/* Tab Contents */}
            {forms.map((form) => {
              const handleAnswersChange = useCallback(
                (payload: any) => {
                  setAnswers((prev) => {
                    const byRole = prev[form.role]
                      ? { ...prev[form.role] }
                      : {};
                    byRole[payload.position] = payload;
                    const next = { ...prev, [form.role]: byRole };

                    const invalid = calculateInvalidBlocks(form, byRole);
                    setInvalidBlocks((prevInvalid) => ({
                      ...prevInvalid,
                      [form.role]: invalid,
                    }));
                    setRoleFilled((prevFlags) => ({
                      ...prevFlags,
                      [form.role]: invalid.size === 0,
                    }));
                    if (invalid.size === 0) {
                      setValidationTriggered((prevTriggers) => ({
                        ...prevTriggers,
                        [form.role]: false,
                      }));
                    }

                    return next;
                  });
                },
                [form, calculateInvalidBlocks]
              );

              return (
                <TabsContent
                  key={form.role}
                  value={form.role}
                  className="mt-0 data-[state=inactive]:hidden"
                  forceMount
                >
                  <div className="p-2 space-y-4">
                    <EvaluationBlocks
                      blocks={form.blocks}
                      formRole={form.role}
                      onAnswersChange={handleAnswersChange}
                      showValidation={validationTriggered[form.role]}
                      invalidPositions={invalidBlocks[form.role]}
                    />
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </div>

      {/* Footer CTA */}
      <EvaluationFooter
        isLastTab={
          activeTab === forms[forms.length - 1].role
        }
        canFinish={forms.every((f) => roleFilled[f.role])}
        loading={isSubmitting}
        onNext={handleNext}
        onFinish={() => {
          (async () => {
            try {
              const submissions = forms.map((form) =>
                buildSubmissionForForm(form)
              );
              console.log(submissions);
              const payload: EvaluationBatchSubmission = { submissions };
              console.log(payload);
              await submitEvaluation({ practiceId, data: payload });
              handleFormSuccess("Оценка отправлена");

              const userRole = practiceData?.data?.myRole;
              if (userRole === "MODERATOR") {
                navigate("/");
                setTimeout(() => {
                  showUploadModal(practiceId);
                }, 100);
              } else {
                navigate(`/practice?tab=past`);
              }
            } catch (e) {
              handleFormError(e, "Не удалось отправить оценку");
            }
          })();
        }}
      />
    </div>
  );
};
