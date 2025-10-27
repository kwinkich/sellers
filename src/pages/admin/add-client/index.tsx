import { CreateClientForm } from "@/feature";
import { HeadText } from "@/shared";

export const AdminAddClientPage = () => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] pb-3 gap-6 px-2 pt-4">
      <HeadText
        head="Добавление клиента"
        label="Заполните данные компании для подключения к платформе"
        variant="black-gray"
      />

      <div className="flex-1 overflow-auto">
        <CreateClientForm />
      </div>
    </div>
  );
};
