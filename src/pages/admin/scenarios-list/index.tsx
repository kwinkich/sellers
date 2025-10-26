import MultiSelectChips from "@/components/ui/multi-select-chips";
import { Input } from "@/components/ui/input";
import { ScenariosList } from "@/feature";
import { HeadText } from "@/shared";
import { SkillsAPI } from "@/entities/skill/model/api/skill.api";
import { Search, Filter } from "lucide-react";
import { useState, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

/** Pagination helper */
function getNextPageParamFromMeta(lastPage: any) {
  if (!lastPage) return undefined;

  // Check if lastPage has data array
  const data = lastPage?.data;
  if (!data || !Array.isArray(data)) {
    return undefined;
  }

  // Get pagination info from meta (required by backend schema)
  const pagination = lastPage?.meta?.pagination;
  if (!pagination) {
    return undefined;
  }

  // Backend schema guarantees these fields exist
  const { currentPage, totalPages } = pagination;

  // Return next page number if there are more pages
  return currentPage < totalPages ? currentPage + 1 : undefined;
}

export const AdminScenariosListPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Skills query for filter options
  const skills = useInfiniteQuery({
    queryKey: ["skills", "list"],
    queryFn: ({ pageParam = 1 }) =>
      SkillsAPI.getSkillsPaged({ page: pageParam as number, limit: 50 }),
    getNextPageParam: getNextPageParamFromMeta,
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  });

  // MultiSelect options (string IDs)
  const skillOptions = useMemo(
    () =>
      (skills.data?.pages ?? [])
        .flatMap((pg: any) => pg?.data ?? [])
        .map((s: any) => ({
          value: String(s.id),
          label: s.name,
        })),
    [skills.data]
  );

  return (
    <div className="min-h-full mobile-keyboard-padding">
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

      <ScenariosList searchQuery={searchQuery} skillIds={selectedSkillIds} />
    </div>
  );
};
