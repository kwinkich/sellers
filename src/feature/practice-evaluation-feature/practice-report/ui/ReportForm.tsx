import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ReportTabs } from "./ReportTabs";
import { ScaleSingleReportBlock } from "./blocks/ScaleSingleReportBlock";
import { ScaleMultiReportBlock } from "./blocks/ScaleMultiReportBlock";
import type { EvaluationForm as ApiEvaluationForm, EvaluationAnswer } from "@/entities/practice-evaluation/model/types/practice-evaluation.types";
import { ReportHeader } from "./ReportHeader";
import { ReportFooter } from "./ReportFooter";
import { QAReportBlock } from "./blocks";
import { useEffect, useState } from "react";

// Extended type for forms with answers
type FormWithAnswers = ApiEvaluationForm & {
  answers: EvaluationAnswer[];
};

export const ReportForm = ({ formsData = [] }: { formsData?: FormWithAnswers[] }) => {
  const [activeTab, setActiveTab] = useState<string>("");

  // MOCK combined forms + answers (example structure)
  const evaluationData = {
    forms: formsData.map((f) => ({
      id: f.id,
      role: f.role,
      evaluatedUserId: f.evaluatedUserId,
      title: f.title ?? undefined,
      descr: f.descr ?? undefined,
      blocks: (f.blocks || []).map((b) => ({
        id: b.id,
        type: b.type as any,
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
      // Use real answers from submission data
      answers: f.answers || [],
    })),
  };

  useEffect(() => {
    if (evaluationData.forms.length > 0 && !activeTab) setActiveTab(evaluationData.forms[0].role);
  }, [evaluationData, activeTab]);

  const isLast = activeTab === (evaluationData.forms[evaluationData.forms.length - 1]?.role || "");

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ReportHeader />
      <div className="bg-white px-4 py-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-gray-100 rounded-xl gap-0">
          <ReportTabs forms={evaluationData.forms} activeTab={activeTab} />

          {evaluationData.forms.map((form) => (
            <TabsContent key={form.role} value={form.role} className="mt-0 data-[state=inactive]:hidden" forceMount>
              <div className="h-full max-h-[calc(100vh-330px)] overflow-y-auto">
                <div className="p-2 space-y-4">
                  {form.blocks.map((b) => {
                    if (b.type === "QA") {
                      const ans = (form as any).answers.find((a: any) => a.blockId === b.id);
                      return <QAReportBlock key={b.id} title={b.title || "Вопрос"} answer={ans?.textAnswer || ""} />;
                    }
                    if (b.type === "SCALE_SKILL_SINGLE") {
                      const answers = (form as any).answers.filter((a: any) => a.blockId === b.id);
                      return (
                        <ScaleSingleReportBlock
                          key={b.id}
                          items={b.items || []}
                          options={b.scale?.options || []}
                          answers={answers}
                        />
                      );
                    }
                    if (b.type === "SCALE_SKILL_MULTI") {
                      const answers = (form as any).answers.filter((a: any) => a.blockId === b.id);
                      return (
                        <ScaleMultiReportBlock
                          key={b.id}
                          items={b.items || []}
                          options={b.scale?.options || []}
                          answers={answers}
                        />
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <ReportFooter 
        isLastTab={isLast}
        onNext={() => {
          const idx = evaluationData.forms.findIndex(f => f.role === activeTab);
          const next = evaluationData.forms[idx + 1];
          if (next) setActiveTab(next.role);
        }}
        onFinish={() => { /* noop for now */ }}
      />
    </div>
  );
};


