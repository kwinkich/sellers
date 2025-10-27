import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import type { FC } from "react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  userName?: string;
  showCancelButton?: boolean;
  severity?: "destructive" | "constructive";
}

export const ConfirmationDialog: FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  isLoading = false,
  userName,
  showCancelButton = true,
  severity = "destructive",
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* overlay без анимаций */}
      <DialogOverlay
        className="
          fixed inset-0 bg-black/50
          transition-none duration-0
          data-[state=open]:animate-none
          data-[state=closed]:animate-none
        "
      />

      {/* контейнер без анимаций, центр через translate */}
      <DialogContent
        className="
          fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
          w-[min(100svw-32px,380px)] max-w-none
          p-0 rounded-3xl
          transition-none duration-0
          data-[state=open]:animate-none
          data-[state=closed]:animate-none
          overflow-hidden
        "
      >
        {/* панель: flex-колонка, футер липкий внизу; авто-высота по контенту */}
        <div className="flex flex-col min-h-0 max-h-[90svh]">
          {/* header + body: скроллится при переполнении */}
          <div className="flex-1 overflow-y-auto px-6 pt-6 pb-3 min-h-0">
            <DialogHeader className="space-y-3 text-center">
              <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </DialogTitle>

              <DialogDescription className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {userName ? (
                  <>
                    {description
                      .replace(userName, `<strong>${userName}</strong>`)
                      .split(/(<strong>.*?<\/strong>)/)
                      .map((part, idx) => {
                        if (
                          part.startsWith("<strong>") &&
                          part.endsWith("</strong>")
                        ) {
                          const name = part.replace(/<\/?strong>/g, "");
                          return (
                            <strong
                              key={idx}
                              className="font-semibold text-gray-900 dark:text-white"
                            >
                              {name}
                            </strong>
                          );
                        }
                        return <span key={idx}>{part}</span>;
                      })}
                  </>
                ) : (
                  description
                )}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* footer: липкий низ панели + фон/бордер для читабельности */}
          <DialogFooter
            className="
              sticky bottom-0
              flex-col sm:flex-row gap-3
              px-6 py-4
              bg-white/90 dark:bg-neutral-900/85
              backdrop-blur supports-[backdrop-filter]:bg-white/60
            "
          >
            {showCancelButton && (
              <Button
                variant="second"
                onClick={onClose}
                disabled={isLoading}
                size="sm"
                className={`
                  w-full sm:w-auto order-1 sm:order-2
                  bg-base-main hover:bg-base-main/80 focus-visible:ring-base-main
                  text-white h-12
                `}
              >
                {cancelText}
              </Button>
            )}

            {/* кнопка подтверждения */}
            <Button
              variant="second"
              onClick={onConfirm}
              disabled={isLoading}
              size="sm"
              className={`
                w-full sm:w-auto order-1 sm:order-2
                ${
                  severity === "constructive"
                    ? "bg-green-600 hover:bg-green-700 focus-visible:ring-green-500"
                    : "bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-500"
                }
                text-white h-12
                ${!showCancelButton ? "sm:w-full" : ""}
              `}
            >
              {isLoading ? "Загрузка..." : confirmText}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
