import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useTermsStore } from "../model/terms.store";
import { useSuccessDrawerStore } from "../model/successDrawer.store";
import { ModeratorIcon } from "@/shared";

export const ModeratorTermsDrawer = () => {
  const { isOpen, close, practice } = useTermsStore();

  return (
    <Drawer open={isOpen} onOpenChange={(o) => (!o ? close() : null)}>
      <DrawerContent className="bg-white text-black rounded-t-[48px]">
        <DrawerHeader className="items-center text-center">
          <DrawerTitle className="sr-only">Подтверждение роли модератора</DrawerTitle>
          <ModeratorIcon size={56} cn="text-base-main" />
          <p className="text-xl font-semibold mt-2">Ваша роль - Модератор</p>
          <p className="text-base-gray text-sm">Вы участвуете в практике</p>
        </DrawerHeader>

        <div className="px-6 text-sm text-black">
          <p className="text-center mb-4">Выбирая роль Модератор вы соглашаетесь, что:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Сделать запись встречи в Zoom</li>
            <li>Загрузить запись встречи после окончания игры</li>
          </ul>
        </div>

        <DrawerFooter>
          <Button
            onClick={() => {
              const p = practice;
              close();
              if (p) requestAnimationFrame(() => useSuccessDrawerStore.getState().open(p));
            }}
          >
            Я согласен
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};


