import MultiSelectChips from "@/components/ui/multi-select-chips";
import { Button } from "@/components/ui/button";
import { DatePickerFloatingLabel } from "@/components/ui/datePickerFloating";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/components/ui/searchable-select";
import { AdminsAPI } from "@/entities/admin/model/api/admin.api";
import { CasesAPI } from "@/entities/case/model/api/case.api";
import { ScenariosAPI } from "@/entities/scenarios/model/api/scenarios.api";
import { SkillsAPI } from "@/entities/skill/model/api/skill.api";
import { useCreatePracticeStore } from "@/feature/practice-feature";
import { useUserRole } from "@/shared";
import { getPracticeTypeLabel } from "@/shared/lib/getPracticeTypeLabel";
import type { PracticeType } from "@/shared/types/practice.types";
import { useInfiniteQuery } from "@tanstack/react-query";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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

/** Convert local date + "HH:MM" to UTC ISO string */
function toUtcIso(dateLocal: Date, hhmm: string): string {
  const [hh, mm] = (hhmm || "00:00").split(":").map(Number);
  const y = dateLocal.getFullYear();
  const m = dateLocal.getMonth(); // 0-based
  const d = dateLocal.getDate();
  const localDateTime = new Date(y, m, d, hh, mm, 0, 0);
  return localDateTime.toISOString();
}

const PracticeCreatePage = () => {
  const store = useCreatePracticeStore();
  const navigate = useNavigate();
  const { role } = useUserRole();

  // store keeps numeric IDs, UI uses strings to avoid equality glitches
  const { scenarioId, caseId, skillIds, practiceType, scenarioTitle } = store;

  // Local date/time for stable UX; compute UTC on submit
  const [dateLocal, setDateLocal] = React.useState<Date | undefined>(undefined);
  const [timeLocal, setTimeLocal] = React.useState<string>(() => {
    const now = new Date();
    // Set time to 10 minutes in the future to ensure it passes validation
    const futureTime = new Date(now.getTime() + 10 * 60 * 1000);
    const hours = futureTime.getHours().toString().padStart(2, "0");
    const minutes = futureTime.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  });

  // Used to visually reset the MultiSelectChips back to clean placeholder state
  const [skillsResetVersion, setSkillsResetVersion] = React.useState(0);
  const [isCreatingMeeting, setIsCreatingMeeting] = React.useState(false);

  // ---- Queries ----

  // Skills list (always available)
  const skills = useInfiniteQuery({
    queryKey: ["skills", "list"],
    queryFn: ({ pageParam = 1 }) =>
      SkillsAPI.getSkillsPaged({ page: pageParam as number, limit: 50 }),
    getNextPageParam: getNextPageParamFromMeta,
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  });

  // MultiSelect options (string IDs)
  const skillOptions = React.useMemo(
    () =>
      (skills.data?.pages ?? [])
        .flatMap((pg: any) => pg?.data ?? [])
        .map((s: any) => ({
          value: String(s.id),
          label: s.name,
        })),
    [skills.data]
  );

  // Scenarios: NOW enabled even without skills (skills are only filters)
  const scenarios = useInfiniteQuery({
    queryKey: [
      "scenarios",
      "list",
      {
        // only pass when present to avoid over-filtering
        skillIds: skillIds?.length ? skillIds : undefined,
      },
    ],
    queryFn: ({ pageParam = 1 }) =>
      ScenariosAPI.getScenarios({
        skillIds: (skillIds?.length ? (skillIds as any) : undefined) as any,
        page: pageParam as number,
        limit: 50,
      }),
    getNextPageParam: getNextPageParamFromMeta,
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
    // enabled: ALWAYS true → scenarios selectable without skills
    enabled: true,
  });

  const scenarioOptions = React.useMemo(
    () =>
      scenarios.data?.pages
        ? scenarios.data.pages.flatMap((p: any) => p?.data ?? [])
        : [],
    [scenarios.data]
  );

  // Convert scenario options to SearchableSelect format
  const scenarioSelectOptions: SearchableSelectOption[] = React.useMemo(
    () =>
      scenarioOptions.map((s: any) => ({
        value: s.id,
        label: s.title,
      })),
    [scenarioOptions]
  );

  // Cases: independent of scenario; disabled for WITHOUT_CASE
  const cases = useInfiniteQuery({
    queryKey: ["cases", "list"],
    queryFn: ({ pageParam = 1 }) =>
      CasesAPI.getCases({
        page: pageParam as number,
        limit: 50,
      }),
    getNextPageParam: getNextPageParamFromMeta,
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
    enabled: practiceType !== "WITHOUT_CASE",
  });

  const caseOptions = React.useMemo(
    () =>
      cases.data?.pages
        ? cases.data.pages.flatMap((p: any) => p?.data ?? [])
        : [],
    [cases.data]
  );

  // Convert case options to SearchableSelect format
  const caseSelectOptions: SearchableSelectOption[] = React.useMemo(
    () =>
      caseOptions.map((c: any) => ({
        value: c.id,
        label: c.title,
      })),
    [caseOptions]
  );

  // ---- Reset & validation policy ----

  // If switching to WITHOUT_CASE -> ensure case cleared (keep scenario)
  React.useEffect(() => {
    if (practiceType === "WITHOUT_CASE" && caseId) {
      store.setCase(undefined, undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practiceType]);

  // Validate scenario against options after scenarios settle
  React.useEffect(() => {
    if (scenarios.isLoading || scenarios.isFetching) return;
    if (
      scenarioId &&
      !scenarioOptions.some((s: any) => Number(s.id) === Number(scenarioId))
    ) {
      store.setScenario(undefined, undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioOptions, scenarios.isLoading, scenarios.isFetching]);

  // Validate case against options after cases settle
  React.useEffect(() => {
    if (cases.isLoading || cases.isFetching) return;
    if (
      caseId &&
      !caseOptions.some((c: any) => Number(c.id) === Number(caseId))
    ) {
      store.setCase(undefined, undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseOptions, cases.isLoading, cases.isFetching]);

  // When skills change, if a skill was REMOVED → reset dependent selections
  // and visually reset the skills control to placeholder (via key bump).
  const prevSkillIdsRef = React.useRef<number[]>(skillIds);
  React.useEffect(() => {
    const prev = new Set(prevSkillIdsRef.current);
    const curr = new Set(skillIds);
    const removalHappened = [...prev].some((id) => !curr.has(id));
    prevSkillIdsRef.current = skillIds;

    if (removalHappened) {
      // Force MultiSelectChips back to its initial, clean placeholder state
      setSkillsResetVersion((v) => v + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillIds]);

  // ---- Infinite scroll handlers ----

  // ---- Form validity / Next button ----
  const canProceed = React.useMemo(() => {
    if (!practiceType) return false;
    if (!scenarioId) return false;
    if (practiceType === "WITH_CASE" && !caseId) return false;
    if (!dateLocal || !timeLocal) return false;

    // If selected date is today, ensure selected time is at least 5 minutes in the future
    const now = new Date();
    const isSameDay =
      dateLocal.getFullYear() === now.getFullYear() &&
      dateLocal.getMonth() === now.getMonth() &&
      dateLocal.getDate() === now.getDate();

    if (isSameDay) {
      const [hh, mm] = timeLocal.split(":").map((x) => Number(x));
      if (!Number.isFinite(hh) || !Number.isFinite(mm)) return false;
      const candidate = new Date(
        dateLocal.getFullYear(),
        dateLocal.getMonth(),
        dateLocal.getDate(),
        hh,
        mm,
        0,
        0
      );
      // Allow time to be at least 5 minutes in the future to account for setup time
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
      if (candidate <= fiveMinutesFromNow) return false;
    }

    return true;
  }, [practiceType, scenarioId, caseId, dateLocal, timeLocal]);

  const handleNext = React.useCallback(async () => {
    if (!canProceed || !dateLocal || !timeLocal) return;

    const startAtUTC = toUtcIso(dateLocal, timeLocal);
    store.setStartAt(startAtUTC);

    // Create Zoom meeting for admin users
    if (role === "ADMIN" && scenarioTitle) {
      setIsCreatingMeeting(true);
      try {
        const response = await AdminsAPI.zoomCreateMeeting({
          start_time: startAtUTC,
          topic: scenarioTitle,
        });

        if (response.data?.meeting?.join_url) {
          store.setZoom(response.data.meeting.join_url);
          toast.success("Встреча Zoom создана");
        } else {
          toast.error("Не удалось создать встречу Zoom");
        }
      } catch (error) {
        console.error("Error creating Zoom meeting:", error);
        toast.error("Ошибка при создании встречи Zoom");
      } finally {
        setIsCreatingMeeting(false);
      }
    }

    navigate("/practice/preview");
  }, [canProceed, dateLocal, timeLocal, store, navigate, role, scenarioTitle]);

  return (
    <div className="bg-white text-black min-h-[100dvh] flex flex-col pb-3">
      <div className="px-4 py-4 flex-1">
        <h1 className="text-xl font-semibold mb-4">Создайте свою практику</h1>

        <div className="space-y-3">
          {/* Skills (optional filters). When cleared or reduced, we reset downstream selections. */}
          <div>
            <MultiSelectChips
              key={skillsResetVersion} // remount to restore placeholder/input state after reset
              options={skillOptions}
              // UI uses string IDs; convert store numeric skillIds -> string[]
              value={skillIds?.map((id) => String(id)) ?? []}
              onChange={(next) => {
                const ids = next.map((v) => Number(v));
                store.setSkills(ids);

                const labelMap = new Map(
                  skillOptions.map((o) => [String(o.value), o.label])
                );
                const names = next
                  .map((v) => labelMap.get(String(v)))
                  .filter(Boolean) as string[];
                store.setSkillNames(names);

                // If user cleared all skills manually, ensure “placeholdery” look is preserved
                if (ids.length === 0) {
                  setSkillsResetVersion((v) => v + 1);
                }
              }}
              placeholder="Выберите навыки"
              onLoadMore={() => {
                if (skills.hasNextPage && !skills.isFetchingNextPage)
                  skills.fetchNextPage();
              }}
              canLoadMore={Boolean(skills.hasNextPage)}
              isLoadingMore={Boolean(skills.isFetchingNextPage)}
            />
          </div>

          {/* Practice type */}
          <div>
            <Select
              onValueChange={(t) => {
                const pt = t as PracticeType;
                store.setPracticeType(pt);

                if (pt === "WITHOUT_CASE") {
                  store.setCase(undefined, undefined);
                }
              }}
              value={(practiceType ?? "") as any}
            >
              <SelectTrigger>
                <SelectValue placeholder="Тип практики" />
              </SelectTrigger>
              <SelectContent side="bottom" align="start">
                <SelectGroup>
                  {(
                    ["WITH_CASE", "WITHOUT_CASE", "MINI"] as PracticeType[]
                  ).map((t) => (
                    <SelectItem key={t} value={t}>
                      {getPracticeTypeLabel(t)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Scenario (enabled even without skills) */}
          <div>
            <SearchableSelect
              options={scenarioSelectOptions}
              value={scenarioId}
              onChange={(value) => {
                if (value) {
                  const s = scenarioOptions.find(
                    (x: any) => Number(x.id) === Number(value)
                  );
                  store.setScenario(Number(value), s?.title);
                  if (s?.practiceType) store.setPracticeType(s.practiceType);
                } else {
                  store.setScenario(undefined, undefined);
                }
              }}
              placeholder="Выберите сценарий практики"
              searchPlaceholder="Поиск сценариев..."
              noResultsText="Нет сценариев"
              onLoadMore={() => {
                if (scenarios.hasNextPage && !scenarios.isFetchingNextPage) {
                  scenarios.fetchNextPage();
                }
              }}
              canLoadMore={Boolean(scenarios.hasNextPage)}
              isLoadingMore={Boolean(scenarios.isFetchingNextPage)}
            />
          </div>

          {/* Case (independent of scenario; disabled for WITHOUT_CASE) */}
          <div>
            <SearchableSelect
              options={caseSelectOptions}
              value={caseId}
              onChange={(value) => {
                if (value) {
                  const c = caseOptions.find(
                    (x: any) => Number(x.id) === Number(value)
                  );
                  store.setCase(Number(value), c?.title);
                } else {
                  store.setCase(undefined, undefined);
                }
              }}
              placeholder={
                practiceType === "WITHOUT_CASE"
                  ? "Тип без кейса — выбор не требуется"
                  : "Выберите кейс практики"
              }
              searchPlaceholder="Поиск кейсов..."
              noResultsText="Нет кейсов"
              disabled={practiceType === "WITHOUT_CASE"}
              onLoadMore={() => {
                if (cases.hasNextPage && !cases.isFetchingNextPage) {
                  cases.fetchNextPage();
                }
              }}
              canLoadMore={Boolean(cases.hasNextPage)}
              isLoadingMore={Boolean(cases.isFetchingNextPage)}
            />
          </div>

          {/* Date & Time (local) */}
          <div className="flex flex-row gap-2">
            <DatePickerFloatingLabel
              className="w-3/5"
              placeholder="Дата проведения (локальная)"
              value={dateLocal}
              onValueChange={(d) => setDateLocal(d)}
            />
            <input
              type="time"
              value={timeLocal}
              onChange={(e) => setTimeLocal(e.target.value)}
              className="w-2/5 h-16 rounded-2xl bg-white-gray px-4 text-base font-medium placeholder:text-second-gray"
              placeholder="Время (локальное)"
              step={300}
              min="00:00"
              max="23:59"
              lang="ru-RU"
            />
          </div>
        </div>
      </div>

      {/* Footer / Next */}
      <div className="px-4">
        <Button
          className="w-full"
          disabled={!canProceed || isCreatingMeeting}
          onClick={handleNext}
        >
          {isCreatingMeeting ? "Создание встречи..." : "Следующий шаг"}
        </Button>
      </div>
    </div>
  );
};

export default PracticeCreatePage;
