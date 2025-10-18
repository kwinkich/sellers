import {
  Badge,
  TimerIcon,
  ClientIcon,
  ArrowIcon,
  PracticeWithCaseIcon,
  MiniGameIcon,
  PracticeNoCaseIcon,
  CopyButton,
  getRoleLabel,
  useUserRole,
} from "@/shared";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRef } from "react";
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
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { practicesMutationOptions } from "@/entities/practices";
import { mopProfilesQueryOptions } from "@/entities/mop";
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

// Function to check if role is available based on repScore
const isRoleAvailableByRep = (
  role: PracticeParticipantRole,
  repScore: number
): boolean => {
  switch (role) {
    case "OBSERVER":
      return true; // Always available
    case "BUYER":
      return repScore >= 2;
    case "SELLER":
    case "MODERATOR":
      return repScore >= 3;
    default:
      return false;
  }
};

export const PracticeMineCard = ({ data }: Props) => {
  const openCaseInfo = useCaseInfoStore((s) => s.open);
  const qc = useQueryClient();
  const { role } = useUserRole();
  const copyButtonRef = useRef<HTMLButtonElement>(null);

  // Get MOP profile info for MOP users
  const { data: mopProfileRes } = useQuery({
    ...mopProfilesQueryOptions.profileInfo(),
    enabled: role === "MOP",
  });
  const mopProfile = mopProfileRes?.data;
  const repScore = mopProfile?.repScore ?? 0;
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

  const isAllowed = (r: PracticeParticipantRole): boolean => {
    // If it's my current role, always allow (can switch back to it)
    if (r === data.myRole) return true;

    // For ADMIN users: can only be MODERATOR (no exceptions)
    if (role === "ADMIN" && r !== "MODERATOR") return false;

    // For OBSERVER, always available (can always observe) - but not for admin
    if (r === "OBSERVER" && role !== "ADMIN") return true;

    // Check if role is available on backend (not taken by others)
    const isRoleNotTaken = data.freeRoles?.includes(r as PracticeRole) ?? false;
    if (!isRoleNotTaken) return false;

    // For MOP users: check reputation requirements
    const isRepAvailable =
      role === "MOP" ? isRoleAvailableByRep(r, repScore) : true;

    return isRepAvailable;
  };

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
      <div
        className={cn(
          "bg-second-bg rounded-2xl p-3 text-sm flex items-center justify-between gap-2",
          "transition-all duration-200 cursor-pointer",
          "hover:bg-second-bg/80 hover:shadow-sm"
        )}
        onClick={() => {
          if (data.zoomLink && copyButtonRef.current) {
            copyButtonRef.current.click();
          }
        }}
      >
        <div className="flex flex-col min-w-0 gap-1">
          <span className="text-base-gray text-xs">Ссылка на встречу</span>
          <div className="w-full rounded-lg flex items-center text-white text-sm truncate">
            {data.zoomLink ?? "—"}
          </div>
        </div>
        <CopyButton
          ref={copyButtonRef}
          text={data.zoomLink || ""}
          className="bg-transparent rounded-3xl p-2"
          size={24}
          disabled={!data.zoomLink}
        />
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
