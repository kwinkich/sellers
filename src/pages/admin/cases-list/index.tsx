import { Input } from "@/components/ui/input";
import { CasesList } from "@/feature";
import { HeadText } from "@/shared";
import { Search } from "lucide-react";
import { useState } from "react";

export const AdminCasesListPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] pb-3">
      <div className="bg-base-bg flex gap-5 text-white flex-col w-full rounded-b-3xl px-2 pb-4 pt-4 mb-2">
        <HeadText
          head="Список кейсов"
          label="Список всех кейсов, доступных в системе"
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

      <div className="flex-1 overflow-auto">
        <CasesList searchQuery={searchQuery} />
      </div>
    </div>
  );
};
