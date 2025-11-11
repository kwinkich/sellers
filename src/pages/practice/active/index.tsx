import { useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { getPracticeTypeLabel } from "@/shared/lib/getPracticeTypeLabel";
import { useActivePracticeStore } from "@/feature/practice-feature/model/activePractice.store";
import { practicesMutationOptions } from "@/entities/practices/model/api/practices.api";
import { handleFormError, handleFormSuccess } from "@/shared";

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
          <TabsList variant="default" className="max-w-md">
            <TabsTrigger value="scenario">Сценарий</TabsTrigger>
            <TabsTrigger value="evaluation">Оценка</TabsTrigger>
          </TabsList>
          <TabsContent value="scenario" className="mt-4">
            <div className="bg-white/60 rounded-xl px-4 py-3 text-sm text-black">
              {practice.scenario ?? "Сценарий появится позднее."}
            </div>
          </TabsContent>
          <TabsContent value="evaluation" className="mt-4">
            <div className="bg-white/60 rounded-xl px-4 py-3 text-sm text-black">
              {practice.evaluationSummary ?? "Оценка будет доступна позже."}
            </div>
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
