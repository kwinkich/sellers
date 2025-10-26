import { Input } from "@/components/ui/input";
import { ScenariosList } from "@/feature";
import { HeadText } from "@/shared";
import { Search } from "lucide-react";
import { useState } from "react";

export const AdminScenariosListPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-full pb-3">
      <div className="bg-base-bg flex gap-5 text-white flex-col w-full rounded-b-3xl px-2 pb-4 pt-4 mb-2">
        <HeadText
          head="Список сценариев"
          label="Список всех сценариев, доступных в системе"
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
      </div>

      <ScenariosList searchQuery={searchQuery} />
    </div>
  );
};
