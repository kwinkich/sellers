import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface RemoveLicensesDrawerProps {
  onSave: (removals: LicenseRemovalData) => void;
  licenseCounts: {
    active: number;
    notActive: number;
    expired: number;
  };
  isLoading?: boolean;
  disabled?: boolean;
}

interface LicenseRemovalData {
  active: number;
  notActive: number;
  expired: number;
}

export function RemoveLicensesDrawer({
  onSave,
  licenseCounts,
  isLoading = false,
  disabled = false,
}: RemoveLicensesDrawerProps) {
  const [open, setOpen] = useState(false);
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
    setOpen(false);
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
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          size="2s"
          variant="second"
          className="w-[90px] bg-black hover:bg-black/80 text-white"
          disabled={disabled || isLoading}
        >
          Отозвать
        </Button>
      </DrawerTrigger>
      <DrawerContent className="data-[vaul-drawer-direction=bottom]:rounded-t-3xl!">
        <div className="mx-auto w-full px-6 pb-2">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-medium pb-2">
              Отзыв лицензий
            </DrawerTitle>
            <p className="text-sm text-muted-foreground">
              Выберите количество лицензий для удаления по каждой категории.
              Удаление активных лицензий приведет к потере доступа назначенных
              МОПов.
            </p>
          </DrawerHeader>

          <div className="space-y-6 pb-4">
            {/* Active Licenses */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="active-removal" className="text-sm font-medium">
                  Активные лицензии
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                      <HelpCircle className="h-3 w-3" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-medium">Внимание!</h4>
                      <p className="text-sm text-muted-foreground">
                        Удаление активных лицензий приведет к автоматическому
                        удалению доступа назначенных МОПов к приложению.
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="active-removal"
                  type="number"
                  min="0"
                  max={licenseCounts.active}
                  value={removals.active === 0 ? "" : removals.active}
                  onChange={(e) => handleInputChange("active", e.target.value)}
                  className="w-20 h-10"
                  disabled={licenseCounts.active === 0}
                />
                <span className="text-sm text-muted-foreground">
                  из {licenseCounts.active}
                </span>
              </div>
            </div>

            {/* Not Active Licenses */}
            <div className="space-y-2">
              <Label
                htmlFor="not-active-removal"
                className="text-sm font-medium"
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
                  className="w-20 h-10"
                  disabled={licenseCounts.notActive === 0}
                />
                <span className="text-sm text-muted-foreground">
                  из {licenseCounts.notActive}
                </span>
              </div>
            </div>

            {/* Expired Licenses */}
            <div className="space-y-2">
              <Label htmlFor="expired-removal" className="text-sm font-medium">
                Истекшие лицензии
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="expired-removal"
                  type="number"
                  min="0"
                  max={licenseCounts.expired}
                  value={removals.expired === 0 ? "" : removals.expired}
                  onChange={(e) => handleInputChange("expired", e.target.value)}
                  className="w-20 h-10"
                  disabled={licenseCounts.expired === 0}
                />
                <span className="text-sm text-muted-foreground">
                  из {licenseCounts.expired}
                </span>
              </div>
            </div>

            {/* Summary */}
            {totalToRemove > 0 && (
              <div className="rounded-lg border p-3 bg-muted/50">
                <div className="text-sm space-y-1">
                  <div className="text-black dark:text-white">
                    Всего к удалению: {totalToRemove}
                  </div>
                  {hasActiveRemovals && (
                    <div className="text-black dark:text-white font-medium">
                      ⚠️ {removals.active} {getMopDeclension(removals.active)}{" "}
                      {getVerbDeclension(removals.active)} доступ
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <DrawerFooter className="w-full px-0">
            <Button
              onClick={handleSave}
              className="w-full"
              rounded="bottom"
              disabled={totalToRemove === 0 || isLoading}
              variant={hasActiveRemovals ? "second" : "default"}
            >
              {isLoading ? "Отзыв..." : "Отозвать лицензии"}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
