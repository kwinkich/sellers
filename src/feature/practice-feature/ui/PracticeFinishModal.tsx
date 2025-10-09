import { BlockingModal } from "@/components/ui/blocking-modal";
import { Button } from "@/components/ui/button";
import { Badge, ClientIcon, TimerIcon, PracticeWithCaseIcon, MiniGameIcon, PracticeNoCaseIcon, CopyIcon } from "@/shared";
import { getPracticeTypeLabel } from "@/shared/lib/getPracticeTypeLabel";
import { useCaseInfoStore } from "../model/caseInfo.store";
import { useFinishPracticeStore } from "../model/finishPractice.store";
import { useFinishedPracticeStore } from "../model/finishedPractice.store";
import { useQuery } from "@tanstack/react-query";
import { PracticesAPI } from "@/entities/practices/model/api/practices.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { practicesMutationOptions } from "@/entities/practices/model/api/practices.api";
import { toast } from "sonner";

function PracticeInfoCardSimple({
  data,
}: {
  data: any;
}) {
  const start = new Date(data.startAt);
  const date = start.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
  const time = start.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

  const icon = data.practiceType === "MINI" ? (
    <MiniGameIcon size={32} cn="text-base-main" />
  ) : data.practiceType === "WITH_CASE" ? (
    <PracticeWithCaseIcon size={32} cn="text-base-main" />
  ) : (
    <PracticeNoCaseIcon size={32} cn="text-base-main" />
  );

  return (
    <div className="bg-gray-100 rounded-2xl p-3 text-black">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <Badge label={getPracticeTypeLabel(data.practiceType as any)} variant="gray" size="md" className="bg-gray-300 text-gray-700" />
      </div>
      <p className="text-lg font-semibold mb-1">{data.title}</p>
      {data.description && (
        <p className="text-xs text-second-gray mb-2">{data.description}</p>
      )}

      {!!data.skills?.length && (
        <div className="flex flex-wrap gap-2 mb-2">
          {data.skills.map((s: any) => (
            <Badge key={s.id} label={s.name} variant="gray" size="md" className="bg-gray-300 text-gray-700" />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-base-gray">
        <div className="flex items-center gap-2">
          <ClientIcon size={16} fill="#A2A2A2" />
          <span className="text-black font-medium">{data.participantsCount}</span>
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
        <div className="bg-white/60 rounded-xl px-3 py-2 flex items-center justify-between">
          <div className="text-xs">
            <div className="text-base-gray">Ваша роль</div>
            <div className="text-black font-medium">{data.myRole ?? "—"}</div>
          </div>
        </div>

        <div className="bg-white/60 rounded-xl px-3 py-2 flex items-center justify-between">
          <div className="text-xs w-full">
            <div className="text-base-gray">Ссылка на встречу</div>
            <div className="text-black font-medium break-all">{data.zoomLink ?? "—"}</div>
          </div>
          {data.zoomLink && (
            <button
              className="ml-2 text-base-main text-sm"
              onClick={() => navigator.clipboard.writeText(data.zoomLink!)}
              title="Скопировать"
            >
              <CopyIcon size={16} fill="#06935F" />
            </button>
          )}
        </div>

        {data.case && (
          <div className="bg-white/60 rounded-xl px-3 py-2 flex items-center justify-between">
            <div className="text-xs">
              <div className="text-base-gray">Название кейса</div>
              <div className="text-black font-medium">{data.case.title}</div>
            </div>
            <Button className="bg-base-main" size="2s"
              onClick={() => useCaseInfoStore.getState().open(data)}
            >
              Изучить
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export const PracticeFinishModal = () => {
  const { isOpen, practiceId, hide } = useFinishPracticeStore();
  const showFinished = useFinishedPracticeStore((s) => s.show);
  const queryClient = useQueryClient();

  const { data: practiceRes } = useQuery({
    queryKey: ["practices", "detail", practiceId],
    queryFn: () => PracticesAPI.getPracticeById(practiceId!),
    enabled: !!practiceId,
  });

  const finishMutation = useMutation({
    ...practicesMutationOptions.finish(),
    onSuccess: () => {
      toast.success("Практика успешно завершена");
      hide();
      // Show the finished modal to the moderator
      if (practiceId) {
        showFinished(practiceId);
      }
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["practices", "cards"] });
      queryClient.invalidateQueries({ queryKey: ["practices", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["practices", "past"] });
      if (practiceId) {
        queryClient.invalidateQueries({ queryKey: ["practices", "detail", practiceId] });
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Ошибка завершения практики");
    },
  });

  if (!practiceId || !practiceRes?.data) return null;

  const practice = practiceRes.data;

  const handleFinish = () => {
    finishMutation.mutate(practiceId);
  };

  const handleConnect = () => {
    if (practice.zoomLink) {
      window.open(practice.zoomLink, "_blank");
    }
  };

  return (
    <BlockingModal open={isOpen}>
      <PracticeInfoCardSimple data={practice} />
      <div className="mt-4 space-y-2">
        <Button 
          className="w-full h-12" 
          onClick={handleConnect}
        >
          Подключиться
        </Button>
        <Button 
          className="w-full h-12 bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-500" 
          onClick={handleFinish}
          disabled={finishMutation.isPending}
          text="white"
        >
          {finishMutation.isPending ? "Завершение..." : "Завершить практику"}
        </Button>
      </div>
    </BlockingModal>
  );
};
