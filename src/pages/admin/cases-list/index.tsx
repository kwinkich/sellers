import { Input } from "@/components/ui/input";
import { CasesList } from "@/feature";
import { HeaderWithClose } from "@/shared";
import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const AdminCasesListPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] px-2 pt-4 pb-3">
      <HeaderWithClose
        title="Список кейсов"
        description="Список всех кейсов, доступных в системе"
        onClose={() => navigate("/admin/home")}
        variant="dark"
      />

      <div className="bg-base-bg flex gap-5 text-white flex-col w-full rounded-2xl px-4 pb-4 pt-4 mb-6">
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
