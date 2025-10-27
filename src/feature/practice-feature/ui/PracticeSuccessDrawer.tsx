import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRef } from "react";
import {
  Badge,
  ClientIcon,
  TimerIcon,
  PracticeWithCaseIcon,
  MiniGameIcon,
  PracticeNoCaseIcon,
  SuccessIcon,
  CopyButton,
  getRoleLabel,
} from "@/shared";
import { getPracticeTypeLabel } from "@/shared/lib/getPracticeTypeLabel";
import { useSuccessDrawerStore } from "../model/successDrawer.store";
import type { PracticeCard } from "@/entities/practices";
import { usePracticeJoinStore } from "../model/joinDrawer.store";
import { useCaseInfoStore } from "../model/caseInfo.store";

function PracticeInfoCard({ data }: { data: PracticeCard }) {
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

  const joinStoreOpen = usePracticeJoinStore((s) => s.open);

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
        <div className="flex flex-wrap gap-2 mb-2">
          {data.skills.map((s) => (
            <Badge
              key={s.id}
              label={s.name}
              variant="gray"
              size="md"
              className="bg-gray-300 text-gray-700"
            />
          ))}
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
            <div className="text-black font-medium">
              {data.myRole ? getRoleLabel(data.myRole) : "—"}
            </div>
          </div>
          <button
            className="text-base-main text-sm"
            onClick={() => joinStoreOpen(data)}
          >
            Изменить
          </button>
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
              size="2s"
              variant="main-opacity10"
              text="main"
              className="rounded-lg px-3"
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

export const PracticeSuccessDrawer = () => {
  const { isOpen, practice, close } = useSuccessDrawerStore();
  if (!practice) return null;
  return (
    <Drawer open={isOpen} onOpenChange={(o) => (!o ? close() : null)}>
      <DrawerContent className="bg-white text-black rounded-t-[48px] flex flex-col max-h-[92svh] overflow-hidden">
        <DrawerHeader className="items-center text-center shrink-0">
          <DrawerTitle className="sr-only">Успешно</DrawerTitle>
          <div className="w-14 h-14 rounded-full bg-base-opacity10-main flex items-center justify-center">
            <SuccessIcon size={64} cn="text-base-main" />
          </div>
          <p className="text-xl font-semibold mt-4">Успешно!</p>
          <p className="text-base-gray text-sm">Вы участвуете в сражении</p>
        </DrawerHeader>

        <DrawerBody>
          <div className="px-4 pb-2">
            <PracticeInfoCard data={practice} />
          </div>
        </DrawerBody>

        <DrawerFooter className="shrink-0 px-4 pb-16">
          <Button onClick={close}>Закрыть</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
