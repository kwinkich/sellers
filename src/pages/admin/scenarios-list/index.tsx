import MultiSelectChips from "@/components/ui/multi-select-chips";
import { Input } from "@/components/ui/input";
import { ScenariosList } from "@/feature";
import { HeadText, useInfiniteList } from "@/shared";
import { SkillsAPI } from "@/entities/skill/model/api/skill.api";
import { Search, Filter } from "lucide-react";
import { useState, useMemo } from "react";

// Stable keys for better performance
const SKILLS_KEY = ["skills", "list"] as const;

export const AdminScenariosListPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Skills query for filter options
  const skills = useInfiniteList<any>(
    SKILLS_KEY,
    (page, limit) => SkillsAPI.getSkillsPaged({ page, limit }),
    50
  );

  // MultiSelect options (string IDs)
  const skillOptions = useMemo(
    () =>
      (skills.allItems ?? []).map((s: any) => ({
        value: String(s.id),
        label: s.name,
      })),
    [skills.allItems]
  );

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] pb-3">
      <div className="bg-base-bg flex gap-5 text-white flex-col w-full rounded-b-3xl px-2 pb-4 pt-4 mb-2">
        <HeadText
          head="Список сценариев"
          label="Список всех сценариев, доступных в системе"
        />

        <div className="flex flex-col gap-3">
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

          {/* Filter Toggle Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">
                Фильтры{" "}
                {selectedSkillIds.length > 0 && `(${selectedSkillIds.length})`}
              </span>
            </button>
          </div>

          {/* Skills Filter */}
          {showFilters && (
            <div className="px-1">
              <MultiSelectChips
                options={skillOptions}
                value={selectedSkillIds.map(String)}
                onChange={(next) => {
                  const ids = next.map((v) => Number(v));
                  setSelectedSkillIds(ids);
                }}
                placeholder="Выберите навыки для фильтрации"
                onLoadMore={() => {
                  if (skills.hasNextPage && !skills.isFetchingNextPage)
                    skills.fetchNextPage();
                }}
                canLoadMore={Boolean(skills.hasNextPage)}
                isLoadingMore={Boolean(skills.isFetchingNextPage)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <ScenariosList searchQuery={searchQuery} skillIds={selectedSkillIds} />
      </div>
    </div>
  );
};
