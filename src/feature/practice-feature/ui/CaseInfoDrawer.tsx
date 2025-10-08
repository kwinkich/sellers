import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useCaseInfoStore } from "../model/caseInfo.store";
import { casesQueryOptions } from "@/entities/case/model/api/case.api";
import { useQuery } from "@tanstack/react-query";

export const CaseInfoDrawer = () => {
  const { isOpen, practice, close } = useCaseInfoStore();
  const caseId = practice?.case?.id;
  const role = practice?.myRole;
  const showAll = practice?.status === "FINISHED";

  const { data } = useQuery({ ...casesQueryOptions.byId(caseId ?? 0), enabled: !!caseId });
  const detail = data?.data;

  return (
    <Drawer open={isOpen} onOpenChange={(o) => (!o ? close() : null)}>
      <DrawerContent className="bg-white text-black rounded-t-[48px]">
        <DrawerHeader className="items-center text-center">
          <DrawerTitle className="sr-only">Информация о кейсе</DrawerTitle>
          <p className="text-xl font-semibold mt-2">{detail?.title ?? "Кейс"}</p>
        </DrawerHeader>

        <div className="px-4 pb-2 text-sm space-y-4">
          {detail?.situation && (
            <div>
              <p className="text-base-gray mb-1">Ситуация</p>
              <p className="whitespace-pre-wrap">{detail.situation}</p>
            </div>
          )}

          {(showAll || role !== "BUYER") && (
            <div>
              <p className="text-base-gray mb-1">Задача продавца</p>
              <p className="whitespace-pre-wrap">{detail?.sellerTask ?? "—"}</p>
              <p className="text-base-gray mt-2 mb-1">Легенда продавца</p>
              <p className="whitespace-pre-wrap">{detail?.sellerLegend ?? "—"}</p>
            </div>
          )}

          {(showAll || role !== "SELLER") && (
            <div>
              <p className="text-base-gray mt-4 mb-1">Задача покупателя</p>
              <p className="whitespace-pre-wrap">{detail?.buyerTask ?? "—"}</p>
              <p className="text-base-gray mt-2 mb-1">Легенда покупателя</p>
              <p className="whitespace-pre-wrap">{detail?.buyerLegend ?? "—"}</p>
            </div>
          )}
        </div>

        <DrawerFooter>
          <Button onClick={close}>Закрыть</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};


