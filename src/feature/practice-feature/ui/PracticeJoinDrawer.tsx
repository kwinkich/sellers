import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge, ClientIcon, TimerIcon } from "@/shared";
import { getPracticeTypeLabel } from "@/shared/lib/getPracticeTypeLabel";
import type { PracticeParticipantRole, PracticeRole } from "@/entities/practices";
import { practicesMutationOptions } from "@/entities/practices";
import { useTermsStore } from "../model/terms.store";
import { useSuccessDrawerStore } from "../model/successDrawer.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { usePracticeJoinStore } from "../model/joinDrawer.store";

export const PracticeJoinDrawer = () => {
  const qc = useQueryClient();
  const { isOpen, practice, close, setPractice } = usePracticeJoinStore();
  const [selectedRole, setSelectedRole] = useState<PracticeParticipantRole | null>(null);

  useEffect(() => {
    if (!isOpen) setSelectedRole(null);
  }, [isOpen]);

  const roles: PracticeParticipantRole[] = ["OBSERVER", "BUYER", "SELLER", "MODERATOR"];

  const roleStatus = useMemo(() => {
    const available = new Set(practice?.freeRoles ?? []);
    const myRole = practice?.myRole ?? null;
    return roles.map((r) => ({
      role: r,
      // OBSERVER is always selectable; others depend on backend freeRoles
      isAvailable: r === "OBSERVER" ? true : available.has(r as PracticeRole),
      isMine: myRole === r,
    }));
  }, [practice]);

  const join = useMutation({
    ...practicesMutationOptions.join(),
    onSuccess: async (res) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["practices", "cards"] }),
        qc.invalidateQueries({ queryKey: ["practices", "mine"] }),
        qc.invalidateQueries({ queryKey: ["practices", "past"] }),
        practice ? qc.invalidateQueries({ queryKey: ["practices", "detail", practice.id] }) : Promise.resolve(),
      ]);
      // if joined as moderator, open terms; else show success
      if (selectedRole === "MODERATOR") {
        const updated = res?.data ?? practice!;
        close();
        requestAnimationFrame(() => useTermsStore.getState().open("MODERATOR", updated));
      } else {
        const updated = res?.data ?? practice!;
        close();
        requestAnimationFrame(() => useSuccessDrawerStore.getState().open(updated));
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
        practice ? qc.invalidateQueries({ queryKey: ["practices", "detail", practice.id] }) : Promise.resolve(),
      ]);
      // if switching to moderator, show terms
      if (selectedRole === "MODERATOR") {
        close();
        if (res?.data) {
          requestAnimationFrame(() => useTermsStore.getState().open("MODERATOR", res.data));
        }
      } else {
        close();
        if (res?.data) {
          requestAnimationFrame(() => useSuccessDrawerStore.getState().open(res.data));
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
    timeZone: "Europe/Moscow",
  });

  const time = start.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  });


  return (
    <Drawer open={isOpen} onOpenChange={(o) => (!o ? close() : null)}>
      <DrawerContent className="bg-base-bg text-white data-[vaul-drawer-direction=bottom]:max-h-[100dvh] data-[vaul-drawer-direction=top]:max-h-[100dvh]">
        <DrawerHeader className="items-start text-left flex-1 overflow-y-auto">
          <DrawerTitle className="sr-only">Выбор роли для практики</DrawerTitle>
          <div className="flex items-center gap-2 mb-2">
            <Badge label={getPracticeTypeLabel(practice.practiceType as any)} variant="gray" size="md" />
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
              <span className="text-white font-medium">{practice.participantsCount}</span>
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
              {roleStatus.map(({ role, isAvailable, isMine }) => {
                const taken = !isAvailable;
                const isSelected = selectedRole === role;
                const label =
                  role === "OBSERVER" ? "Наблюдатель" : role === "BUYER" ? "Покупатель" : role === "SELLER" ? "Продавец" : "Модератор";
                const repMin = role === "OBSERVER" ? null : role === "BUYER" ? 2 : role === "SELLER" ? 3 : 4;

                return (
                  <div key={role} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                      <p className="text-white">{label}</p>
                      {repMin && <span className="text-xs text-emerald-400">от {repMin} REP</span>}
                    </div>
                    <div className="min-w-[96px] flex items-center justify-end">
                      {isMine ? (
                        <span className="text-sm text-base-main">Моя роль</span>
                      ) : taken ? (
                        <span className="text-sm text-red-400">Занято</span>
                      ) : (
                        <Button
                          size="2s"
                          variant={isSelected ? "default" : "main-opacity10"}
                          text={isSelected ? "white" : "main"}
                          onClick={() => setSelectedRole(role)}
                          className="rounded-lg px-3"
                        >
                          Выбрать
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </DrawerHeader>

        <DrawerFooter>
          <Button
            disabled={!selectedRole || (practice.myRole ? switchRole.isPending : join.isPending)}
            onClick={() => {
              if (!practice || !selectedRole) return;
              if (practice.myRole) {
                switchRole.mutate({ id: practice.id, data: { to: selectedRole } });
              } else {
                if (selectedRole === "MODERATOR") {
                  // After join success, show terms in onSuccess handler above is not called here, so open now
                  close();
                  requestAnimationFrame(() => useTermsStore.getState().open("MODERATOR"));
                }
                join.mutate({ id: practice.id, data: { as: selectedRole } });
              }
            }}
          >
            {practice.myRole ? (switchRole.isPending ? "Смена роли…" : "Сменить роль") : join.isPending ? "Отправка…" : "Участвовать"}
          </Button>
          <Button variant="ghost" text="white" onClick={() => close()}>Отменить</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};


