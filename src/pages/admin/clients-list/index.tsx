import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientsList } from "@/feature";
import { HeadText } from "@/shared";
import { Search } from "lucide-react";
import { useState } from "react";

export type ClientType = "active" | "expired" | "expiring";

export const AdminClientsListPage = () => {
  const [clientType, setClientType] = useState<ClientType>("active");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-full pb-3">
      <div className="bg-base-bg flex gap-5 text-white flex-col  w-full rounded-b-3xl px-2 pb-4 pt-4 mb-2">
        <HeadText
          head="Список клиентов"
          label="Список всех клиентов, подключенных к платформе"
        />

        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            variant="second"
            placeholder="Поиск"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-[48px]"
          />
        </div>

        <Tabs
          value={clientType}
          onValueChange={(value) => setClientType(value as ClientType)}
        >
          <TabsList variant="second" className="grid w-full grid-cols-3">
            <TabsTrigger variant="second" value="active">
              Действующие
            </TabsTrigger>
            <TabsTrigger variant="second" value="expiring">
              Истекающие
            </TabsTrigger>
            <TabsTrigger variant="second" value="expired">
              Истекшие
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ClientsList type={clientType} searchQuery={searchQuery} />
    </div>
  );
};
