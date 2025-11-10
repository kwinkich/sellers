import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import type { BlockKind } from "./BlocksContainer";

interface AddBlockDrawerProps {
  onPick: (type: BlockKind) => void;
  allowedBlockTypes?: BlockKind[]; // Only these types can be added
  excludeBlockTypes?: BlockKind[]; // These types cannot be added
}

export function AddBlockDrawer({ onPick, allowedBlockTypes, excludeBlockTypes }: AddBlockDrawerProps) {
  const [open, setOpen] = useState(false);

  const pick = (t: BlockKind) => {
    onPick(t);
    setOpen(false);
  };

  // Filter block types based on allowed/excluded lists
  const allBlockTypes = [
    { t: "TEXT" as BlockKind, title: "Добавить текст", subtitle: "" },
    { t: "QA" as BlockKind, title: "Вопрос-ответ", subtitle: "" },
    { t: "SCALE_SKILL_SINGLE" as BlockKind, title: "Оценка", subtitle: "Да/Нет/50 на 50" },
    { t: "SCALE_SKILL_MULTI" as BlockKind, title: "Оценка", subtitle: "От 1 до 5" },
  ];

  const availableBlockTypes = allBlockTypes.filter((opt) => {
    // If allowedBlockTypes is specified, only include those types
    if (allowedBlockTypes && allowedBlockTypes.length > 0) {
      return allowedBlockTypes.includes(opt.t);
    }
    // If excludeBlockTypes is specified, exclude those types
    if (excludeBlockTypes && excludeBlockTypes.length > 0) {
      return !excludeBlockTypes.includes(opt.t);
    }
    // Otherwise, include all types
    return true;
  });

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full rounded-[24px] border-2 border-emerald-500 border-dashed bg-emerald-50/90 text-emerald-700",
            "px-2 py-3 text-center font-medium cursor-pointer"
          )}
        >
          Добавить блок
        </button>
      </DrawerTrigger>

      <DrawerContent className="bg-base-bg text-white">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-white text-xl">Добавление блока формы</DrawerTitle>
        </DrawerHeader>
        <div className="grid grid-cols-2 gap-3 p-4">
          {availableBlockTypes.map((opt) => (
            <button
              key={opt.t}
              onClick={() => pick(opt.t)}
              className="rounded-2xl bg-[#141414] text-white border border-[#2F2F2F] px-4 py-6 text-center flex flex-col items-center justify-center gap-2"
            >
              {/* SVG icon */}
              {opt.t === "TEXT" && (
                <svg width="31" height="24" viewBox="0 0 31 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 24V4.5H0.5V0H20V4.5H12.5V24H8ZM21.5 24V12H17V7.5H30.5V12H26V24H21.5Z" fill="#06935F"/>
                </svg>
              )}
              {opt.t === "QA" && (
                <svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.5 20C18.925 20 19.2938 19.8438 19.6063 19.5312C19.9188 19.2188 20.075 18.85 20.075 18.425C20.075 18 19.9188 17.6313 19.6063 17.3188C19.2938 17.0063 18.925 16.85 18.5 16.85C18.075 16.85 17.7063 17.0063 17.3938 17.3188C17.0813 17.6313 16.925 18 16.925 18.425C16.925 18.85 17.0813 19.2188 17.3938 19.5312C17.7063 19.8438 18.075 20 18.5 20ZM17.375 15.2H19.625C19.625 14.475 19.7 13.9438 19.85 13.6063C20 13.2688 20.35 12.825 20.9 12.275C21.65 11.525 22.15 10.9188 22.4 10.4563C22.65 9.99375 22.775 9.45 22.775 8.825C22.775 7.7 22.3813 6.78125 21.5938 6.06875C20.8063 5.35625 19.775 5 18.5 5C17.475 5 16.5813 5.2875 15.8188 5.8625C15.0563 6.4375 14.525 7.2 14.225 8.15L16.25 8.975C16.475 8.35 16.7812 7.88125 17.1688 7.56875C17.5563 7.25625 18 7.1 18.5 7.1C19.1 7.1 19.5875 7.26875 19.9625 7.60625C20.3375 7.94375 20.525 8.4 20.525 8.975C20.525 9.325 20.425 9.65625 20.225 9.96875C20.025 10.2812 19.675 10.675 19.175 11.15C18.35 11.875 17.8438 12.4438 17.6562 12.8563C17.4688 13.2688 17.375 14.05 17.375 15.2ZM9.5 24.5C8.675 24.5 7.96875 24.2063 7.38125 23.6188C6.79375 23.0312 6.5 22.325 6.5 21.5V3.5C6.5 2.675 6.79375 1.96875 7.38125 1.38125C7.96875 0.79375 8.675 0.5 9.5 0.5H27.5C28.325 0.5 29.0313 0.79375 29.6188 1.38125C30.2063 1.96875 30.5 2.675 30.5 3.5V21.5C30.5 22.325 30.2063 23.0312 29.6188 23.6188C29.0313 24.2063 28.325 24.5 27.5 24.5H9.5ZM9.5 21.5H27.5V3.5H9.5V21.5ZM3.5 30.5C2.675 30.5 1.96875 30.2063 1.38125 29.6188C0.79375 29.0313 0.5 28.325 0.5 27.5V6.5H3.5V27.5H24.5V30.5H3.5Z" fill="#06935F"/>
                </svg>
              )}
              {opt.t === "SCALE_SKILL_SINGLE" && (
                <svg width="26" height="28" viewBox="0 0 26 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.5 27.5V0.5H24.5V15.5H3.5V18.5H11V21.5H3.5V24.5H11V27.5H0.5ZM17.6 27.5L13.4 23.3L15.5 21.2L17.6 23.3L22.925 17.975L25.025 20.075L17.6 27.5ZM3.5 12.5H11V9.5H3.5V12.5ZM14 12.5H21.5V9.5H14V12.5ZM3.5 6.5H11V3.5H3.5V6.5ZM14 6.5H21.5V3.5H14V6.5Z" fill="#06935F"/>
                </svg>
              )}
              {opt.t === "SCALE_SKILL_MULTI" && (
                <svg width="27" height="28" viewBox="0 0 27 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.1375 27.4625L15.9 23.225L18 21.125L20.1375 23.2625L24.9 18.5L27 20.6L20.1375 27.4625ZM0 27.5V24.5H13.5V27.5H0ZM0 21.5V18.5H13.5V21.5H0ZM0 15.5V12.5H27V15.5H0ZM0 9.5V6.5H27V9.5H0ZM0 3.5V0.5H27V3.5H0Z" fill="#06935F"/>
                </svg>
              )}

              {/* Title and subtitle */}
              <div className="text-base font-medium leading-tight whitespace-pre-line">
                {opt.title}
              </div>
              <div className="text-xs text-base-gray">{opt.subtitle}</div>
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}


