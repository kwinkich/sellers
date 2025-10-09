import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ReportTabs } from "./ReportTabs";
import { ScaleSingleReportBlock } from "./blocks/ScaleSingleReportBlock";
import { ScaleMultiReportBlock } from "./blocks/ScaleMultiReportBlock";
import type { FinalEvaluationForm } from "@/entities/practice-evaluation/model/types/practice-evaluation.types";
import { ReportHeader } from "./ReportHeader";
import { ReportFooter } from "./ReportFooter";
import { QAReportBlock } from "./blocks";
import { useEffect, useState } from "react";

export const ReportForm = ({ formsData = [] }: { formsData?: FinalEvaluationForm[] }) => {
  const [activeTab, setActiveTab] = useState<string>("");
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Process final evaluation forms with embedded results
  const evaluationData = {
    forms: formsData.map((f) => ({
      id: f.id,
      role: f.role,
      evaluatedUserId: f.evaluatedUserId,
      title: f.title ?? undefined,
      descr: f.descr ?? undefined,
      blocks: f.blocks.map((b) => {
        const baseBlock = {
          id: b.id,
          type: b.type,
          title: b.title ?? undefined,
          required: b.required,
          position: b.position,
        };

        if (b.type === "QA") {
          return {
            ...baseBlock,
            qaAnswer: (b as any).qaAnswer,
          };
        }

        if (b.type === "SCALE_SKILL_SINGLE" || b.type === "SCALE_SKILL_MULTI") {
          return {
            ...baseBlock,
            scale: b.scale ? {
              id: b.scale.id,
              options: b.scale.options.map((opt: any) => ({
                id: opt.id,
                ord: opt.ord,
                label: opt.label,
                value: opt.value,
                countsTowardsScore: opt.countsTowardsScore,
              })),
            } : undefined,
            items: b.items.map((it: any) => ({
              id: it.id,
              title: it.title,
              position: it.position,
              skillId: it.skillId ?? null,
              result: it.result, // This contains the aggregated results
            })),
          };
        }

        return baseBlock;
      }),
    })),
  };

  useEffect(() => {
    if (evaluationData.forms.length > 0 && !activeTab) setActiveTab(evaluationData.forms[0].role);
  }, [evaluationData, activeTab]);

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

  const isLast = activeTab === (evaluationData.forms[evaluationData.forms.length - 1]?.role || "");

  return (
    <div 
      className="min-h-screen bg-white flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <ReportHeader />
      <div className="bg-white px-4 py-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-gray-100 rounded-xl gap-0">
          <ReportTabs forms={evaluationData.forms} activeTab={activeTab} />

          {evaluationData.forms.map((form) => (
            <TabsContent key={form.role} value={form.role} className="mt-0 data-[state=inactive]:hidden" forceMount>
              <div className="h-full max-h-[calc(100vh-330px)] overflow-y-auto">
                <div className="p-2 space-y-4">
                  {form.blocks.map((b: any) => {
                    if (b.type === "QA") {
                      return <QAReportBlock key={b.id} title={b.title || "Вопрос"} answer={b.qaAnswer || ""} />;
                    }
                    if (b.type === "SCALE_SKILL_SINGLE") {
                      return (
                        <ScaleSingleReportBlock
                          key={b.id}
                          items={b.items || []}
                          options={b.scale?.options || []}
                          results={b.items.map((item: any) => item.result)}
                        />
                      );
                    }
                    if (b.type === "SCALE_SKILL_MULTI") {
                      return (
                        <ScaleMultiReportBlock
                          key={b.id}
                          items={b.items || []}
                          options={b.scale?.options || []}
                          results={b.items.map((item: any) => item.result)}
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


