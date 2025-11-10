import { useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
import { useCaseInfoStore } from "@/feature/practice-feature/model/caseInfo.store";
import { useActivePracticeStore } from "@/feature/practice-feature/model/activePractice.store";
import { practicesMutationOptions } from "@/entities/practices/model/api/practices.api";
import { handleFormError, handleFormSuccess } from "@/shared";

function getSkillDeclension(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return "навыков";
  }

  if (lastDigit === 1) {
    return "навык";
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return "навыка";
  }

  return "навыков";
}

function PracticeInfoCard({
  data,
  openCaseInfo,
}: {
  data: any;
  openCaseInfo: (practice: any) => void;
}) {
  const copyButtonRef = useRef<HTMLButtonElement>(null);
  const [skillsExpanded, setSkillsExpanded] = useState(false);
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
    <div className="bg-gray-100 rounded-2xl p-3 text-black">
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

      {!!data.skills?.length && (
        <div className="mb-2">
          <div className="flex flex-wrap gap-2 mb-2">
            {(skillsExpanded ? data.skills : data.skills.slice(0, 4)).map(
              (s: any) => (
                <Badge
                  key={s.id}
                  label={s.name}
                  variant="gray"
                  size="md"
                  className="bg-gray-300 text-gray-700"
                />
              )
            )}
            {!skillsExpanded && data.skills.length > 4 && (
              <Badge
                label={`+${data.skills.length - 4} ${getSkillDeclension(
                  data.skills.length - 4
                )}`}
                variant="gray"
                size="md"
                className="bg-gray-300 text-gray-700 cursor-pointer hover:bg-gray-400"
                onClick={() => setSkillsExpanded(true)}
              />
            )}
          </div>
          {data.skills.length > 4 && (
            <button
              onClick={() => setSkillsExpanded(!skillsExpanded)}
              className="text-xs text-base-main hover:underline"
            >
              {skillsExpanded ? "Скрыть" : "Показать все"}
            </button>
          )}
        </div>
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
        <div className="bg-white/60 rounded-xl px-3 py-2 flex items-center justify-between">
          <div className="text-xs">
            <div className="text-base-gray">Ваша роль</div>
            <div className="text-black font-medium">{role}</div>
          </div>
        </div>

        <div
          className={cn(
            "bg-white/60 rounded-xl px-3 py-2 flex items-center justify-between",
            "transition-all duration-200 cursor-pointer",
            "hover:bg-white/80 hover:shadow-sm"
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

        {data.case && (
          <div className="bg-white/60 rounded-xl px-3 py-2 flex items-center justify-between">
            <div className="text-xs">
              <div className="text-base-gray">Название кейса</div>
              <div className="text-black font-medium">{data.case.title}</div>
            </div>
            <Button
              className="bg-base-main h-8"
              size="2s"
              onClick={() => {
                if (data.case) openCaseInfo(data);
              }}
            >
              Изучить
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

const PracticeActivePage = () => {
  const navigate = useNavigate();
  const openCaseInfo = useCaseInfoStore((s) => s.open);
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
      <div className="flex-1 overflow-auto px-4 py-6 md:px-6 md:py-10">
          <PracticeInfoCard data={practice} openCaseInfo={openCaseInfo} />
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
