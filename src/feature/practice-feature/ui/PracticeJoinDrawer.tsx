import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  Badge,
  ClientIcon,
  TimerIcon,
  getRoleLabel,
  useUserRole,
} from "@/shared";
import { getPracticeTypeLabel } from "@/shared/lib/getPracticeTypeLabel";
import type {
  PracticeParticipantRole,
  PracticeRole,
} from "@/entities/practices";
import { practicesMutationOptions } from "@/entities/practices";
import { mopProfilesQueryOptions } from "@/entities/mop";
import { useTermsStore } from "../model/terms.store";
import { useSuccessDrawerStore } from "../model/successDrawer.store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { usePracticeJoinStore } from "../model/joinDrawer.store";

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

export const PracticeJoinDrawer = () => {
  const qc = useQueryClient();
  const { isOpen, practice, close, setPractice } = usePracticeJoinStore();
  const [selectedRole, setSelectedRole] =
    useState<PracticeParticipantRole | null>(null);
  const { role } = useUserRole();

  // Get MOP profile info for MOP users
  const { data: mopProfileRes } = useQuery({
    ...mopProfilesQueryOptions.profileInfo(),
    enabled: role === "MOP",
  });
  const mopProfile = mopProfileRes?.data;
  const repScore = mopProfile?.repScore ?? 0;

  useEffect(() => {
    if (!isOpen) setSelectedRole(null);
  }, [isOpen]);

  const roles: PracticeParticipantRole[] = [
    "OBSERVER",
    "BUYER",
    "SELLER",
    "MODERATOR",
  ];

  const roleStatus = useMemo(() => {
    const available = new Set(practice?.freeRoles ?? []);
    const myRole = practice?.myRole ?? null;

    return roles.map((r) => {
      // If this is my current role, it should be available for switching
      const isMyCurrentRole = myRole === r;

      // For OBSERVER, always available (can always observe)
      // For other roles, check if they're in freeRoles OR if it's my current role
      const isRoleNotTaken =
        r === "OBSERVER"
          ? true
          : isMyCurrentRole || available.has(r as PracticeRole);

      // For MOP users: always check rep requirements
      // OBSERVER is always available, other roles need rep check
      const isRepAvailable =
        role === "MOP" && r !== "OBSERVER"
          ? isRoleAvailableByRep(r, repScore)
          : true;

      // For ADMIN users: can only be MODERATOR
      const isAdminRestricted = role === "ADMIN" && r !== "MODERATOR";

      const isAvailable =
        isRoleNotTaken && isRepAvailable && !isAdminRestricted;

      return {
        role: r,
        isAvailable,
        isMine: myRole === r,
        isRepBlocked: role === "MOP" && !isRepAvailable,
        isAdminRestricted,
      };
    });
  }, [practice, role, repScore]);

  const join = useMutation({
    ...practicesMutationOptions.join(),
    onSuccess: async (res) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["practices", "cards"] }),
        qc.invalidateQueries({ queryKey: ["practices", "mine"] }),
        qc.invalidateQueries({ queryKey: ["practices", "past"] }),
        practice
          ? qc.invalidateQueries({
              queryKey: ["practices", "detail", practice.id],
            })
          : Promise.resolve(),
      ]);
      // if joined as moderator, open terms; else show success
      if (selectedRole === "MODERATOR") {
        const updated = res?.data ?? practice!;
        close();
        requestAnimationFrame(() =>
          useTermsStore.getState().open("MODERATOR", updated)
        );
      } else {
        const updated = res?.data ?? practice!;
        close();
        requestAnimationFrame(() =>
          useSuccessDrawerStore.getState().open(updated)
        );
      }
    },
  });

  const switchRole = useMutation({
    ...practicesMutationOptions.switchRole(),
    onSuccess: async (res) => {
      if (res?.data) setPractice(res.data);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["practices", "cards"] }),
        qc.invalidateQueries({ queryKey: ["practices", "mine"] }),
        qc.invalidateQueries({ queryKey: ["practices", "past"] }),
        practice
          ? qc.invalidateQueries({
              queryKey: ["practices", "detail", practice.id],
            })
          : Promise.resolve(),
      ]);
      // if switching to moderator, show terms
      if (selectedRole === "MODERATOR") {
        close();
        if (res?.data) {
          requestAnimationFrame(() =>
            useTermsStore.getState().open("MODERATOR", res.data)
          );
        }
      } else {
        close();
        if (res?.data) {
          requestAnimationFrame(() =>
            useSuccessDrawerStore.getState().open(res.data)
          );
        }
      }
    },
  });

  if (!practice) return null;

  const start = new Date(practice.startAt);
  const date = start.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const time = start.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Drawer open={isOpen} onOpenChange={(o) => (!o ? close() : null)}>
      <DrawerContent className="bg-base-bg text-white data-[vaul-drawer-direction=bottom]:max-h-[100dvh] data-[vaul-drawer-direction=top]:max-h-[100dvh]">
        <DrawerHeader className="items-start text-left flex-1 overflow-y-auto">
          <DrawerTitle className="sr-only">Выбор роли для практики</DrawerTitle>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              label={getPracticeTypeLabel(practice.practiceType as any)}
              variant="gray"
              size="md"
            />
          </div>
          <p className="text-xl font-semibold">{practice.title}</p>
          {practice.description && (
            <p className="text-sm text-base-gray">{practice.description}</p>
          )}

          {!!practice.skills?.length && (
            <div className="flex flex-wrap gap-2 mt-2">
              {practice.skills.map((s) => (
                <Badge key={s.id} label={s.name} variant="gray" size="md" />
              ))}
            </div>
          )}

          <div className="w-full h-px bg-second-bg my-3" />
          <div className="flex items-center gap-3 text-xs text-base-gray">
            <div className="flex items-center gap-2">
              <ClientIcon size={16} fill="#A2A2A2" />
              <span className="text-white font-medium">
                {practice.participantsCount}
              </span>
              <span>Участвуют</span>
            </div>
            <div className="flex items-center gap-1">
              <TimerIcon size={16} fill="#A2A2A2" />
              <span className="text-white font-medium">{date}</span>
              <span>в</span>
              <span className="text-white font-medium">{time}</span>
            </div>
          </div>

          <div className="w-full mt-4 bg-second-bg p-3 rounded-2xl">
            <p className="text-base-gray mb-2">Выберите стартовую роль</p>
            <div className="divide-y divide-second-bg">
              {roleStatus.map(
                ({
                  role,
                  isMine,
                  isRepBlocked,
                  isAdminRestricted,
                  isAvailable,
                }) => {
                  const isSelected = selectedRole === role;
                  const label = getRoleLabel(role);
                  const repMin =
                    role === "OBSERVER"
                      ? null
                      : role === "BUYER"
                      ? 2
                      : role === "SELLER"
                      ? 3
                      : 4;

                  // Determine if role is actually taken (not available on backend)
                  const isRoleNotTaken =
                    role === "OBSERVER"
                      ? true
                      : isMine ||
                        (practice?.freeRoles ?? []).includes(role as any);
                  const isActuallyTaken = !isRoleNotTaken && !isMine;

                  return (
                    <div
                      key={role}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="flex items-center gap-2">
                        <p className="text-white">{label}</p>
                        {repMin && (
                          <span className="text-xs text-emerald-400">
                            от {repMin} REP
                          </span>
                        )}
                      </div>
                      <div className="min-w-[96px] flex items-center justify-center">
                        {isMine ? (
                          <span className="text-sm text-base-main">
                            Моя роль
                          </span>
                        ) : isActuallyTaken ? (
                          <span className="text-sm text-red-400">Занято</span>
                        ) : (
                          <Button
                            size="2s"
                            variant={isSelected ? "default" : "main-opacity10"}
                            text={isSelected ? "white" : "main"}
                            onClick={() => setSelectedRole(role)}
                            className="rounded-lg px-3"
                            disabled={!isAvailable}
                            title={
                              isRepBlocked
                                ? "Недостаточно репутации"
                                : isAdminRestricted
                                ? "Администратор может быть только модератором"
                                : undefined
                            }
                          >
                            Выбрать
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </DrawerHeader>

        <DrawerFooter>
          <Button
            disabled={
              !selectedRole ||
              (practice.myRole ? switchRole.isPending : join.isPending)
            }
            onClick={() => {
              if (!practice || !selectedRole) return;
              if (practice.myRole) {
                switchRole.mutate({
                  id: practice.id,
                  data: { to: selectedRole },
                });
              } else {
                if (selectedRole === "MODERATOR") {
                  // After join success, show terms in onSuccess handler above is not called here, so open now
                  close();
                  requestAnimationFrame(() =>
                    useTermsStore.getState().open("MODERATOR")
                  );
                }
                join.mutate({ id: practice.id, data: { as: selectedRole } });
              }
            }}
          >
            {practice.myRole
              ? switchRole.isPending
                ? "Смена роли…"
                : "Сменить роль"
              : join.isPending
              ? "Отправка…"
              : "Участвовать"}
          </Button>
          <Button variant="ghost" text="white" onClick={() => close()}>
            Отменить
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
