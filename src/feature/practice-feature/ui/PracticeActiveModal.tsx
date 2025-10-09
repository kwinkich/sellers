import { BlockingModal } from "@/components/ui/blocking-modal";
import { Button } from "@/components/ui/button";
import { Badge, ClientIcon, TimerIcon, PracticeWithCaseIcon, MiniGameIcon, PracticeNoCaseIcon, CopyIcon } from "@/shared";
import { getPracticeTypeLabel } from "@/shared/lib/getPracticeTypeLabel";
import { useCaseInfoStore } from "../model/caseInfo.store";
import { useActivePracticeStore } from "../model/activePractice.store";
import { useNavigate } from "react-router-dom";

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

export const PracticeActiveModal = () => {
  const navigate = useNavigate();
  const { blocking, practice } = useActivePracticeStore();

  if (!practice) return null;

  const handleConnect = () => {
    if (practice.zoomLink) {
      window.open(practice.zoomLink, "_blank");
    } else {
      navigate("/practice");
    }
  };

  return (
    <BlockingModal open={blocking}>
      <PracticeInfoCardSimple data={practice} />
      <div className="mt-4">
        <Button className="w-full h-12" onClick={handleConnect}>
          Подключиться
        </Button>
      </div>
    </BlockingModal>
  );
};


