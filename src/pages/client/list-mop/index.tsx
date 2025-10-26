import { ClientMopsList } from "@/feature";
import { HeadText } from "@/shared";

export const ClientListMopPage = () => {
  return (
    <div className="bg-second-bg px-2 min-h-[calc(100vh-4rem)] pb-28 pt-4">
      <HeadText
        className="gap-0.5 mb-8 pl-2"
        head="Список МОПов"
        label="Добавленные в приложение МОПы"
      />

      <ClientMopsList />
    </div>
  );
};
