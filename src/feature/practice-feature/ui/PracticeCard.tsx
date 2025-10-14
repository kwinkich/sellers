import {
  Badge,
  TimerIcon,
  ClientIcon,
  ArrowIcon,
  PracticeWithCaseIcon,
  MiniGameIcon,
  PracticeNoCaseIcon,
  useUserRole,
} from "@/shared";
import { Button } from "@/components/ui/button";
import type { PracticeCard as PracticeCardType } from "@/entities/practices";
import { getPracticeTypeLabel } from "@/shared/lib/getPracticeTypeLabel";
import type { ReactNode } from "react";
import type { PracticeType } from "@/shared/types/practice.types";
import { usePracticeJoinStore } from "../model/joinDrawer.store";

interface Props {
  data: PracticeCardType;
}

export const PracticeCard = ({ data }: Props) => {
  const openJoin = usePracticeJoinStore((s) => s.open);
  const { role } = useUserRole();
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

  return (
    <div
      id={`practice-card-${data.id}`}
      className="w-full bg-base-bg rounded-2xl p-4 flex flex-col gap-3"
    >
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
            <span className="text-base-gray">Участвуют</span>
          </div>
          <div className="flex items-center gap-1 text-base-gray">
            <TimerIcon size={16} fill="#A2A2A2" />
            <span className="text-white font-medium">{date}</span>
            <span>в</span>
            <span className="text-white font-medium">{time}</span>
          </div>
        </div>
        {role !== "CLIENT" && (
          <Button
            size="xs"
            rounded="3xl"
            className="flex min-w-[200px] items-center justify-center max-h-[40px]"
            onClick={() => openJoin(data)}
          >
            Присоединиться <ArrowIcon size={30} cn="inline-block" />
          </Button>
        )}
      </div>
    </div>
  );
};
