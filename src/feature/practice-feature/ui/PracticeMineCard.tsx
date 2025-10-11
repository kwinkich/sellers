import {
  Badge,
  TimerIcon,
  ClientIcon,
  ArrowIcon,
  PracticeWithCaseIcon,
  MiniGameIcon,
  PracticeNoCaseIcon,
  CopyIcon,
  getRoleLabel,
} from "@/shared";
import { Button } from "@/components/ui/button";
import type {
  PracticeCard as PracticeCardType,
  PracticeRole,
  PracticeParticipantRole,
} from "@/entities/practices";
import { getPracticeTypeLabel } from "@/shared/lib/getPracticeTypeLabel";
import type { ReactNode } from "react";
import type { PracticeType } from "@/shared/types/practice.types";
import { useCaseInfoStore } from "../model/caseInfo.store";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { practicesMutationOptions } from "@/entities/practices";
import {} from "react";

interface Props {
  data: PracticeCardType;
}

const ALL_ROLES: PracticeParticipantRole[] = [
  "SELLER",
  "BUYER",
  "MODERATOR",
  "OBSERVER",
];

export const PracticeMineCard = ({ data }: Props) => {
  const openCaseInfo = useCaseInfoStore((s) => s.open);
  const qc = useQueryClient();
  const switchRole = useMutation({
    ...practicesMutationOptions.switchRole(),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["practices", "mine"] });
      await qc.invalidateQueries({ queryKey: ["practices", "cards"] });
    },
  });

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

  const onConnect = () => {
    if (data.zoomLink)
      window.open(data.zoomLink, "_blank", "noopener,noreferrer");
  };

  const onCopyLink = () => {
    if (!data.zoomLink) return;
    void navigator.clipboard?.writeText(data.zoomLink).catch(() => {});
  };

  const isAllowed = (r: PracticeParticipantRole): boolean => {
    if (r === "OBSERVER") return true;
    if (r === data.myRole) return true;
    return data.freeRoles?.includes(r as PracticeRole) ?? false;
  };

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

      <div className="flex flex-row items-center justify-between text-xs">
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

      {/* Your role box with edit */}
      <div className="bg-second-bg rounded-2xl p-3 text-sm flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-base-gray text-xs">Ваша роль</span>
          <span className="text-white font-medium">
            {data.myRole ? getRoleLabel(data.myRole) : "—"}
          </span>
        </div>
        <Select
          onValueChange={(v) => {
            switchRole.mutate({
              id: data.id,
              data: { to: v as PracticeParticipantRole },
            });
          }}
        >
          <SelectTrigger
            showIcon={false}
            className="text-xs py-2 bg-transparent text-base-main w-fit h-fit px-0 text-md"
          >
            Изменить
          </SelectTrigger>
          <SelectContent className="text-xs" side="bottom" align="end">
            <SelectGroup>
              {ALL_ROLES.map((r) => (
                <SelectItem key={r} value={r} disabled={!isAllowed(r)}>
                  {getRoleLabel(r)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Zoom link with copy */}
      <div className="bg-second-bg rounded-2xl p-3 text-sm flex items-center justify-between gap-2">
        <div className="flex flex-col min-w-0 gap-1">
          <span className="text-base-gray text-xs">Ссылка на встречу</span>
          <div className="w-full rounded-lg flex items-center text-white text-sm truncate">
            {data.zoomLink ?? "—"}
          </div>
        </div>
        <Button
          size="xs"
          className="bg-transparent"
          rounded="3xl"
          variant="main-opacity10"
          text="main"
          onClick={onCopyLink}
          disabled={!data.zoomLink}
        >
          <CopyIcon size={24} fill="#06935F" />
        </Button>
      </div>

      {/* Additional materials: Case */}
      {data.case && data.practiceType !== "WITHOUT_CASE" && (
        <div className="flex flex-col gap-2">
          <span className="text-base-gray text-xs">
            Дополнительные материалы
          </span>
          <div className="bg-second-bg rounded-2xl p-3 flex items-center justify-between text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-base-gray text-xs">Название кейса</span>
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
        </div>
      )}

      {/* Footer connect button */}
      <Button
        size="xs"
        rounded="3xl"
        className="flex min-w-[200px] items-center justify-center max-h-[40px]"
        onClick={onConnect}
        disabled={!data.zoomLink}
      >
        Подключиться <ArrowIcon size={30} cn="inline-block" />
      </Button>
    </div>
  );
};
