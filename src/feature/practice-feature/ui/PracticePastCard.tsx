import { Button } from "@/components/ui/button";
import type { PracticeCard as PracticeCardType } from "@/entities/practices";
import {
  ArrowIcon,
  Badge,
  ClientIcon,
  getRoleLabel,
  MiniGameIcon,
  PracticeNoCaseIcon,
  PracticeWithCaseIcon,
  TimerIcon,
  useUserRole,
  openExternalUrl,
} from "@/shared";
import { getFullApiUrl } from "@/shared/lib/api-config";
import { getPracticeTypeLabel } from "@/shared/lib/getPracticeTypeLabel";
import type { PracticeType } from "@/shared/types/practice.types";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useCaseInfoStore } from "../model/caseInfo.store";

interface Props {
  data: PracticeCardType;
}

export const PracticePastCard = ({ data }: Props) => {
  const openCaseInfo = useCaseInfoStore((s) => s.open);
  const { role: userRole, userId } = useUserRole();
  const navigate = useNavigate();

  const formatStart = (iso: string) => {
    if (!iso) return { date: "", time: "" };
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      time: d.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };
  const { date, time } = formatStart(data.startAt as string);

  const onLearnCase = () => {
    if (data.case) openCaseInfo(data);
  };

  const hasRecording =
    Boolean(data.recordingObjectId) || Boolean(data.recordingUrl);

  const onDownloadReport = () => {
    try {
      // Проверяем данные пользователя (уже получены на верхнем уровне)
      if (!userRole || !userId) {
        console.error("User role or ID not available", { userRole, userId });
        return;
      }

      // URL для скачивания с обязательными параметрами согласно схеме бэкенда
      const downloadUrl = `${getFullApiUrl()}/practices/${
        data.id
      }/report?dl=1&userId=${userId}&userRole=${userRole}`;

      console.log("Downloading report:", {
        downloadUrl,
        practiceId: data.id,
        userRole,
        userId,
      });

      // Используем готовую функцию для открытия во внешнем браузере
      openExternalUrl(downloadUrl);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  // Determine if PDF report should be shown
  // Hide for MOP users who were not moderators in this practice
  const shouldShowPdfReport = !(
    userRole === "MOP" && data.myRole !== "MODERATOR"
  );

  return (
    <div className="w-full bg-base-bg rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-5">
        {(() => {
          const iconByType: Record<PracticeType, ReactNode> = {
            MINI: <MiniGameIcon size={64} cn="text-base-main" />,
            WITH_CASE: <PracticeWithCaseIcon size={64} cn="text-base-main" />,
            WITHOUT_CASE: <PracticeNoCaseIcon size={64} cn="text-base-main" />,
          };
          return (
            iconByType[data.practiceType as PracticeType] ?? (
              <PracticeWithCaseIcon size={64} cn="text-base-main" />
            )
          );
        })()}
        <div className="flex flex-col gap-2">
          <div className="flex p-2 rounded-lg bg-second-bg items-center justify-center w-fit">
            <span className="text-base-gray text-xs">
              {getPracticeTypeLabel(data.practiceType as PracticeType)}
            </span>
          </div>
          <p className="text-white text-lg font-semibold">{data.title}</p>
        </div>
      </div>

      {data.description && (
        <p className="text-second-gray text-sm leading-5">{data.description}</p>
      )}

      {!!data.skills?.length && (
        <div className="flex flex-wrap gap-2">
          {data.skills.map((s) => (
            <Badge key={s.id} label={s.name} variant="gray" size="md" />
          ))}
        </div>
      )}

      <div className="h-px bg-second-bg" />

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-2">
            <ClientIcon size={16} fill="#A2A2A2" />
            <span className="text-base-gray font-bold text-white">
              {data.participantsCount}
            </span>
            <span className="text-base-gray">Участвовали</span>
          </div>
          <div className="flex items-center gap-1 text-base-gray">
            <TimerIcon size={16} fill="#A2A2A2" />
            <span className="text-white font-medium">{date}</span>
            <span>в</span>
            <span className="text-white font-medium">{time}</span>
          </div>
        </div>
      </div>

      {/* Your role box */}
      <div className="bg-second-bg rounded-2xl p-3 text-sm flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-base-gray text-xs">Ваша роль</span>
          <span className="text-white font-medium">
            {data.myRole ? getRoleLabel(data.myRole) : "\u00A0\u00A0—"}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-base-gray text-xs">Дополнительные материалы</span>

        {/* Additional materials: Case */}
        {data.case && data.practiceType !== "WITHOUT_CASE" && (
          <div className="bg-second-bg rounded-2xl p-3 flex items-center justify-between text-sm">
            <div className="flex flex-col">
              <span className="text-base-gray">Название кейса</span>
              <span className="text-white font-medium truncate max-w-[220px]">
                {data.case.title}
              </span>
            </div>
            <Button
              className="bg-transparent text-md text-base-main"
              size="xs"
              rounded="3xl"
              variant="second"
              onClick={onLearnCase}
            >
              Изучить
            </Button>
          </div>
        )}

        {/* Meeting recording */}
        <div className="bg-second-bg rounded-2xl p-3 flex items-center justify-between text-sm">
          <div className="flex flex-col">
            <span className="text-base-gray">Запись встречи</span>
            <span className="text-white font-medium">
              {hasRecording ? "Доступна" : "Недоступна"}
            </span>
          </div>
          <Button
            className="bg-transparent text-md text-base-main"
            size="xs"
            rounded="3xl"
            onClick={() => navigate(`/practice/replay/${data.id}`)}
            disabled={!hasRecording}
          >
            Смотреть
          </Button>
        </div>

        {/* PDF report - conditionally rendered */}
        {shouldShowPdfReport && (
          <div className="bg-second-bg rounded-2xl p-3 flex items-center justify-between text-sm">
            <div className="flex flex-col">
              <span className="text-base-gray">PDF отчёт</span>
              <span className="text-white font-medium">
                {shouldShowPdfReport ? "Доступен" : "Недоступен"}
              </span>
            </div>
            <Button
              className="bg-transparent text-md text-base-main"
              size="xs"
              rounded="3xl"
              onClick={onDownloadReport}
              disabled={!shouldShowPdfReport}
            >
              Скачать
            </Button>
          </div>
        )}
      </div>

      {/* Bottom watch button */}
      <Button
        size="xs"
        rounded="3xl"
        className="flex items-center justify-center max-h-[40px]"
        onClick={() => navigate(`/evaluation/report/${data.id}`)}
      >
        Отчёт <ArrowIcon size={30} cn="inline-block" />
      </Button>
    </div>
  );
};
