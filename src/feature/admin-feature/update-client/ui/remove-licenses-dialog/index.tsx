import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

interface RemoveLicensesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (removals: LicenseRemovalData) => void;
  licenseCounts: {
    active: number;
    notActive: number;
    expired: number;
  };
  isLoading?: boolean;
}

interface LicenseRemovalData {
  active: number;
  notActive: number;
  expired: number;
}

export function RemoveLicensesDialog({
  open,
  onOpenChange,
  onSave,
  licenseCounts,
  isLoading = false,
}: RemoveLicensesDialogProps) {
  const [removals, setRemovals] = useState<LicenseRemovalData>({
    active: 0,
    notActive: 0,
    expired: 0,
  });

  useEffect(() => {
    if (open) {
      setRemovals({
        active: 0,
        notActive: 0,
        expired: 0,
      });
    }
  }, [open]);

  const handleInputChange = (type: keyof LicenseRemovalData, value: string) => {
    if (value === "") {
      setRemovals((prev) => ({
        ...prev,
        [type]: 0,
      }));
      return;
    }

    const numValue = parseInt(value);
    if (isNaN(numValue)) return;

    const maxValue = licenseCounts[type];
    const clampedValue = Math.max(0, Math.min(numValue, maxValue));

    setRemovals((prev) => ({
      ...prev,
      [type]: clampedValue,
    }));
  };

  const handleSave = () => {
    onSave(removals);
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (!isLoading) {
      setRemovals({
        active: 0,
        notActive: 0,
        expired: 0,
      });
      onOpenChange(false);
    }
  };

  const totalToRemove = removals.active + removals.notActive + removals.expired;
  const hasActiveRemovals = removals.active > 0;

  // Функция для склонения слова "МОП"
  const getMopDeclension = (count: number) => {
    if (count === 1) return "МОП";
    if (count >= 2 && count <= 4) return "МОПа";
    return "МОПов";
  };

  // Функция для склонения глагола "потерять"
  const getVerbDeclension = (count: number) => {
    if (count === 1) return "потеряет";
    return "потеряют";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* overlay without animations */}
      <DialogOverlay
        className="
          fixed inset-0 bg-black/50
          transition-none duration-0
          data-[state=open]:animate-none
          data-[state=closed]:animate-none
        "
      />

      {/* container without animations, center via translate */}
      <DialogContent
        className="
          fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
          w-[min(100svw-32px,500px)] max-w-none
          p-0 rounded-3xl
          transition-none duration-0
          data-[state=open]:animate-none
          data-[state=closed]:animate-none
          overflow-hidden
          bg-second-bg
          border-2 border-black
        "
      >
        {/* panel: flex-column, footer sticky at bottom; auto-height by content */}
        <div className="flex flex-col min-h-0 max-h-[90svh] relative">
          {/* Close button */}
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="
              absolute top-4 right-4 z-10
              w-8 h-8
              flex items-center justify-center
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <X className="h-5 w-5 text-white" />
          </button>

          {/* header + body: scrolls when overflowing */}
          <div className="flex-1 overflow-y-auto px-6 pt-6 pb-3 min-h-0">
            <DialogHeader className="space-y-4 text-center">
              <DialogTitle className="text-2xl font-medium text-white">
                Отзыв лицензий
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-300 leading-relaxed">
                Выберите количество лицензий для удаления по каждой категории.
                Удаление активных лицензий приведет к потере доступа назначенных
                МОПов.
              </DialogDescription>
            </DialogHeader>

            {/* Form inputs */}
            <div className="flex flex-col gap-6 mt-6">
              {/* Active Licenses */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="active-removal"
                    className="text-sm font-medium text-white"
                  >
                    Активные лицензии
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id="active-removal"
                    type="number"
                    min="0"
                    max={licenseCounts.active}
                    value={removals.active === 0 ? "" : removals.active}
                    onChange={(e) =>
                      handleInputChange("active", e.target.value)
                    }
                    className="w-20 h-10 text-base"
                    disabled={licenseCounts.active === 0 || isLoading}
                    variant="dark"
                  />
                  <span className="text-sm text-gray-300">
                    из {licenseCounts.active}
                  </span>
                </div>
              </div>

              {/* Not Active Licenses */}
              <div className="space-y-2">
                <Label
                  htmlFor="not-active-removal"
                  className="text-sm font-medium text-white"
                >
                  Неактивные лицензии
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="not-active-removal"
                    type="number"
                    min="0"
                    max={licenseCounts.notActive}
                    value={removals.notActive === 0 ? "" : removals.notActive}
                    onChange={(e) =>
                      handleInputChange("notActive", e.target.value)
                    }
                    className="w-20 h-10 text-base"
                    disabled={licenseCounts.notActive === 0 || isLoading}
                    variant="dark"
                  />
                  <span className="text-sm text-gray-300">
                    из {licenseCounts.notActive}
                  </span>
                </div>
              </div>

              {/* Expired Licenses */}
              <div className="space-y-2">
                <Label
                  htmlFor="expired-removal"
                  className="text-sm font-medium text-white"
                >
                  Истекшие лицензии
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="expired-removal"
                    type="number"
                    min="0"
                    max={licenseCounts.expired}
                    value={removals.expired === 0 ? "" : removals.expired}
                    onChange={(e) =>
                      handleInputChange("expired", e.target.value)
                    }
                    className="w-20 h-10 text-base"
                    disabled={licenseCounts.expired === 0 || isLoading}
                    variant="dark"
                  />
                  <span className="text-sm text-gray-300">
                    из {licenseCounts.expired}
                  </span>
                </div>
              </div>

              {/* Summary */}
              {totalToRemove > 0 && (
                <div className="rounded-lg border border-gray-600 p-3 bg-gray-800/50">
                  <div className="text-sm space-y-2">
                    <div className="text-white">
                      Всего к удалению: {totalToRemove}
                    </div>
                    {hasActiveRemovals && (
                      <div className="text-white font-medium flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-white" />
                        {removals.active} {getMopDeclension(removals.active)}{" "}
                        {getVerbDeclension(removals.active)} доступ
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* footer: sticky bottom of panel + background/border for readability */}
          <DialogFooter
            className="
              sticky bottom-0
              flex-col gap-3
              px-6 py-4
              bg-second-bg/90
              backdrop-blur supports-[backdrop-filter]:bg-second-bg/60
            "
          >
            <Button
              onClick={handleSave}
              disabled={totalToRemove === 0 || isLoading}
              className={`w-full h-12 ${
                totalToRemove === 0 || isLoading
                  ? "bg-red-600/50 hover:bg-red-600/50 cursor-not-allowed"
                  : hasActiveRemovals
                  ? "bg-red-600 hover:bg-red-700 focus-visible:ring-red-600"
                  : "bg-red-500 hover:bg-red-600 focus-visible:ring-red-500"
              } text-white`}
            >
              {isLoading ? "Отзыв..." : "Отозвать лицензии"}
            </Button>
            <Button
              onClick={handleCancel}
              variant="link"
              disabled={isLoading}
              className="text-white/70 hover:text-white h-12"
            >
              Отменить
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
