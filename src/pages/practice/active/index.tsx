import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Badge,
  ClientIcon,
  CopyButton,
  MiniGameIcon,
  PracticeNoCaseIcon,
  PracticeWithCaseIcon,
  TimerIcon,
  getRoleLabel,
} from "@/shared";
import { Loader2 } from "lucide-react";
import { getPracticeTypeLabel } from "@/shared/lib/getPracticeTypeLabel";
import { useActivePracticeStore } from "@/feature/practice-feature/model/activePractice.store";
import { practicesMutationOptions } from "@/entities/practices/model/api/practices.api";
import { scenariosQueryOptions } from "@/entities/scenarios/model/api/scenarios.api";
import { handleFormError, handleFormSuccess } from "@/shared";
import type { EvaluationBlock } from "@/feature/practice-evaluation-feature/evaluate-practice/ui/EvaluationForm";
import { EvaluationBlocks } from "@/feature/practice-evaluation-feature/evaluate-practice/ui";
import type {
  ScenarioForm,
  ScaleFormBlock,
} from "@/entities/scenarios/model/types/scenarios.types";

type PracticeFormRole = "SELLER" | "BUYER" | "MODERATOR";
type PracticeFormType = "SCENARIO" | "EVALUATION";

interface PracticeViewForm {
  id: number;
  role: PracticeFormRole;
  type: PracticeFormType;
  title?: string;
  descr?: string;
  blocks: EvaluationBlock[];
}

function PracticeInfoCard({
  data,
}: {
  data: any;
}) {
  const copyButtonRef = useRef<HTMLButtonElement>(null);
  const start = new Date(data.startAt);
  const date = start.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const time = start.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const icon =
    data.practiceType === "MINI" ? (
      <MiniGameIcon size={32} cn="text-base-main" />
    ) : data.practiceType === "WITH_CASE" ? (
      <PracticeWithCaseIcon size={32} cn="text-base-main" />
    ) : (
      <PracticeNoCaseIcon size={32} cn="text-base-main" />
    );

  const role = data.myRole ? getRoleLabel(data.myRole) : "—";

  return (
    <div className="text-black">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <Badge
          label={getPracticeTypeLabel(data.practiceType as any)}
          variant="gray"
          size="md"
          className="bg-gray-300 text-gray-700"
        />
      </div>
      <p className="text-lg font-semibold mb-1">{data.title}</p>
      {data.description && (
        <p className="text-xs text-second-gray mb-2">{data.description}</p>
      )}

      <div className="flex items-center justify-between text-xs text-base-gray">
        <div className="flex items-center gap-2">
          <ClientIcon size={16} fill="#A2A2A2" />
          <span className="text-black font-medium">
            {data.participantsCount}
          </span>
          <span>Участвуют</span>
        </div>
        <div className="flex items-center gap-1">
          <TimerIcon size={16} fill="#A2A2A2" />
          <span className="text-black font-medium">{date}</span>
          <span>в</span>
          <span className="text-black font-medium">{time}</span>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div className="bg-gray-100 rounded-xl px-3 py-2 flex items-center justify-between">
          <div className="text-xs">
            <div className="text-base-gray">Ваша роль</div>
            <div className="text-black font-medium">{role}</div>
          </div>
        </div>

        <div
          className={cn(
            "bg-gray-100 rounded-xl px-3 py-2 flex items-center justify-between",
            "transition-all duration-200 cursor-pointer",
            "hover:bg-gray-200 hover:shadow-sm"
          )}
          onClick={() => {
            if (data.zoomLink && copyButtonRef.current) {
              copyButtonRef.current.click();
            }
          }}
        >
          <div className="text-xs w-full">
            <div className="text-base-gray">Ссылка на встречу</div>
            <div className="text-black font-medium break-all">
              {data.zoomLink ?? "—"}
            </div>
          </div>
          {data.zoomLink && (
            <CopyButton
              ref={copyButtonRef}
              text={data.zoomLink}
              className="ml-2 text-base-main text-sm"
              size={16}
            />
          )}
        </div>

      </div>
    </div>
  );
}

const PracticeActivePage = () => {
  const navigate = useNavigate();
  const practice = useActivePracticeStore((s) => s.practice);
  const blocking = useActivePracticeStore((s) => s.blocking);
  const hideActive = useActivePracticeStore((s) => s.hide);
  const queryClient = useQueryClient();
  const scenarioId = practice?.scenarioId;
  console.log("practice", practice);
  console.log("scenarioId", scenarioId);

  const { data: formsResponse, isLoading: formsLoading } = useQuery({
    ...scenariosQueryOptions.forms(scenarioId ?? 0),
    enabled: !!scenarioId,
  });

  const forms = useMemo<PracticeViewForm[]>(() => {
    const rawForms = (formsResponse?.data ?? []) as ScenarioForm[];
    return rawForms
      .map((form) => {
        const type = form.type as PracticeFormType | undefined;
        const role = form.role as PracticeFormRole | undefined;

        if (!type || !role) {
          return null;
        }

        const blocks: EvaluationBlock[] = (form.blocks ?? []).map((block) => {
          const baseBlock: EvaluationBlock = {
            id: block.id,
            type: (block.type as EvaluationBlock["type"]) ?? "TEXT",
            title: block.title ?? undefined,
            required: !!block.required,
            position: block.position,
          };

          if (
            block.type === "SCALE_SKILL_SINGLE" ||
            block.type === "SCALE_SKILL_MULTI"
          ) {
            const scaleBlock = block as ScaleFormBlock;
            baseBlock.scale = {
              id: undefined,
              options: scaleBlock.scale.options.map((opt) => ({
                id: undefined,
                ord: opt.ord,
                label: opt.label,
                value: opt.value,
                countsTowardsScore: opt.countsTowardsScore,
              })),
            };
            baseBlock.items = scaleBlock.items.map((item) => ({
              id: item.id,
              title: item.title,
              position: item.position,
              skillId: item.skillId ?? null,
            }));
          }

          return baseBlock;
        });

        return {
          id: form.id,
          role,
          type,
          title: form.title ?? undefined,
          descr: form.descr ?? undefined,
          blocks,
        } as PracticeViewForm;
      })
      .filter(
        (form: PracticeViewForm | null): form is PracticeViewForm =>
          form !== null
      );
  }, [formsResponse]);

  const myRole = practice?.myRole as PracticeFormRole | undefined;

  const scenarioForm = useMemo(() => {
    if (!myRole) return undefined;
    return forms.find(
      (form: PracticeViewForm) => form.type === "SCENARIO" && form.role === myRole
    );
  }, [forms, myRole]);

  const evaluationForms = useMemo(() => {
    if (!myRole) return [];
    return forms.filter(
      (form: PracticeViewForm) => form.type === "EVALUATION" && form.role !== myRole
    );
  }, [forms, myRole]);

  const [activeEvaluationRole, setActiveEvaluationRole] = useState<
    PracticeFormRole | undefined
  >(undefined);

  useEffect(() => {
    if (evaluationForms.length === 0) {
      setActiveEvaluationRole(undefined);
      return;
    }

    setActiveEvaluationRole((prev) => {
      if (prev && evaluationForms.some((form) => form.role === prev)) {
        return prev;
      }
      return evaluationForms[0].role;
    });
  }, [evaluationForms]);

  if (!practice || !blocking) {
    return <Navigate to="/practice" replace />;
  }

  const handleConnect = () => {
    if (practice.zoomLink) {
      window.open(practice.zoomLink, "_blank");
    } else {
      navigate("/practice");
    }
  };

  const isModerator = practice.myRole === "MODERATOR";

  const scenarioFallback = "Сценарий появится позднее.";
  const evaluationFallback = "Оценка будет доступна позже.";

  const formsLoader = (
    <div className="flex items-center justify-center py-6 text-base-gray">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      <span>Загрузка форм...</span>
    </div>
  );

  const finishMutation = useMutation({
    ...practicesMutationOptions.finish(),
    onSuccess: (_, practiceId) => {
      handleFormSuccess("Практика успешно завершена");
      hideActive();
      queryClient.invalidateQueries({ queryKey: ["practices", "cards"] });
      queryClient.invalidateQueries({ queryKey: ["practices", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["practices", "past"] });
      if (practiceId) {
        queryClient.invalidateQueries({
          queryKey: ["practices", "detail", practiceId],
        });
        navigate(`/evaluation/evaluate/${practiceId}`);
      }
    },
    onError: (error) => {
      handleFormError(error, "Ошибка завершения практики");
    },
  });

  const handleFinish = () => {
    if (!practice?.id) return;
    finishMutation.mutate(practice.id);
  };

  return (
    <div className="bg-white text-black min-h-[calc(100vh-var(--nav-h,80px))] flex flex-col pb-3">
      <div className="flex-1 overflow-auto px-4 py-3 md:px-6 md:py-10">
        <PracticeInfoCard data={practice} />
        <Tabs defaultValue="scenario" className="mt-6">
          <TabsList variant="default" className="w-full">
            <TabsTrigger value="scenario">Сценарий</TabsTrigger>
            <TabsTrigger value="evaluation">Оценка</TabsTrigger>
          </TabsList>
          <TabsContent value="scenario" className="mt-4 bg-gray-100 rounded-xl p-2">
            {formsLoading ? (
              formsLoader
            ) : scenarioForm ? (
              <div className="space-y-4">
                <EvaluationBlocks
                  blocks={scenarioForm.blocks}
                  formRole={scenarioForm.role}
                  readOnly
                />
              </div>
            ) : (
              <div className="bg-white/60 rounded-xl px-4 py-3 text-sm text-black">
                {scenarioFallback}
              </div>
            )}
          </TabsContent>
          <TabsContent value="evaluation" className="mt-2 space-y-6 bg-gray-100 rounded-xl p-2">
            {formsLoading ? (
              formsLoader
            ) : evaluationForms.length > 0 && activeEvaluationRole ? (
              <Tabs
                value={activeEvaluationRole}
                onValueChange={(value) =>
                  setActiveEvaluationRole(value as PracticeFormRole)
                }
                className="space-y-4"
              >
                <TabsList variant="default" className="w-full grid grid-cols-2">
                  {evaluationForms.map((form) => (
                    <TabsTrigger variant="default" key={form.id} value={form.role}>
                      {getRoleLabel(form.role)}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {evaluationForms.map((form) => (
                  <TabsContent
                    key={form.id}
                    value={form.role}
                    className="space-y-3 data-[state=inactive]:hidden"
                    forceMount
                  >
                    <EvaluationBlocks
                      blocks={form.blocks}
                      formRole={form.role}
                      readOnly
                    />
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="bg-white/60 rounded-xl px-4 py-3 text-sm text-black">
                {evaluationFallback}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div
        className="px-4 pb-4"
        style={{ paddingBottom: "calc(1rem + var(--nav-h, 80px))" }}
      >
        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          <Button className="h-12 w-full" onClick={handleConnect}>
            Подключиться
          </Button>
          {isModerator && (
            <Button
              className="h-12 w-full bg-red-500 hover:bg-red-600 focus-visible:ring-red-500"
              onClick={handleFinish}
              disabled={finishMutation.isPending}
              text="white"
            >
              {finishMutation.isPending
                ? "Завершение..."
                : "Завершить практику"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeActivePage;
