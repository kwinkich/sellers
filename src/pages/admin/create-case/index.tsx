import { CreateCaseForm } from "@/feature";
import { HeadText } from "@/shared";

export const AdminCreateCasePage = () => {
  return (
    <div className="w-dvw h-svh bg-white flex flex-col overflow-hidden">
      <div
        className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y [-webkit-overflow-scrolling:touch]"
        data-scroll-container
      >
        <div className="flex flex-col gap-6 px-2 pt-4 pb-[calc(96px+env(safe-area-inset-bottom))] min-h-full">
          <HeadText
            head="Создание кейса"
            label="Добавьте новый кейс в систему"
            variant="black-gray"
          />

          <CreateCaseForm />
        </div>
      </div>
    </div>
  );
};
