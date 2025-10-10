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
import { CasesAPI } from "@/entities/case/model/api/case.api";
import { ScenariosAPI } from "@/entities/scenarios/model/api/scenarios.api";
import { SkillsAPI } from "@/entities/skill/model/api/skill.api";
import { useCreatePracticeStore } from "@/feature/practice-feature";
import { getPracticeTypeLabel } from "@/shared/lib/getPracticeTypeLabel";
import type { PracticeType } from "@/shared/types/practice.types";
import { useInfiniteQuery } from "@tanstack/react-query";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import MultiSelectChips from "@/components/multi-select-chips";

const PracticeCreatePage = () => {
  const store = useCreatePracticeStore();
  const navigate = useNavigate();
  const { scenarioId, caseId, skillIds, startAt, practiceType } = store;

  const [time, setTime] = React.useState<string>("15:00");
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    startAt ? new Date(startAt) : undefined
  );

  const skills = useInfiniteQuery({
    queryKey: ["skills", "list"],
    queryFn: ({ pageParam = 1 }) =>
      SkillsAPI.getSkillsPaged({ page: pageParam as number, limit: 50 }),
    getNextPageParam: (lastPage: any) => {
      const p = lastPage?.meta?.pagination as any;
      if (!p) return undefined;
      const currentPage = p.currentPage ?? p.page ?? 1;
      const totalPages =
        p.totalPages ??
        (p.totalItems && p.limit
          ? Math.ceil(p.totalItems / p.limit)
          : undefined);
      if (typeof totalPages === "number")
        return currentPage < totalPages ? currentPage + 1 : undefined;
      if (typeof (p as any).hasNext === "boolean")
        return (p as any).hasNext ? currentPage + 1 : undefined;
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  });

  const skillOptions = React.useMemo(
    () =>
      (skills.data?.pages ?? [])
        .flatMap((pg: any) => pg?.data ?? [])
        .map((s: any) => ({
          value: s.id,
          label: s.name,
        })),
    [skills.data]
  );
  const scenarios = useInfiniteQuery({
    queryKey: [
      "scenarios",
      "list",
      {
        caseId,
        skillIds: skillIds.length ? skillIds : undefined,
        practiceType,
      },
    ],
    queryFn: ({ pageParam = 1 }) =>
      ScenariosAPI.getScenarios({
        caseId: caseId as any,
        skillIds: (skillIds.length ? (skillIds as any) : undefined) as any,
        practiceType: practiceType as any,
        page: pageParam as number,
        limit: 50,
      }),
    getNextPageParam: (lastPage: any) => {
      const p = lastPage?.meta?.pagination as any;
      if (!p) return undefined;
      const currentPage = p.currentPage ?? p.page ?? 1;
      const totalPages =
        p.totalPages ??
        (p.totalItems && p.limit
          ? Math.ceil(p.totalItems / p.limit)
          : undefined);
      if (typeof totalPages === "number")
        return currentPage < totalPages ? currentPage + 1 : undefined;
      if (typeof p.hasNext === "boolean")
        return p.hasNext ? currentPage + 1 : undefined;
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  });

  const cases = useInfiniteQuery({
    queryKey: [
      "cases",
      "list",
      { scenarioId, skillIds: skillIds.length ? skillIds : undefined },
    ],
    queryFn: ({ pageParam = 1 }) =>
      CasesAPI.getCases({
        scenarioId: scenarioId as any,
        skillIds: (skillIds.length ? (skillIds as any) : undefined) as any,
        page: pageParam as number,
        limit: 50,
      }),
    getNextPageParam: (lastPage: any) => {
      const p = lastPage?.meta?.pagination as any;
      if (!p) return undefined;
      const currentPage = p.currentPage ?? p.page ?? 1;
      const totalPages =
        p.totalPages ??
        (p.totalItems && p.limit
          ? Math.ceil(p.totalItems / p.limit)
          : undefined);
      if (typeof totalPages === "number")
        return currentPage < totalPages ? currentPage + 1 : undefined;
      if (typeof p.hasNext === "boolean")
        return p.hasNext ? currentPage + 1 : undefined;
      return undefined;
    },
    enabled: practiceType !== "WITHOUT_CASE",
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  });

  // Keep selections valid against current filters so placeholders stay visible
  const scenarioOptions = React.useMemo(
    () =>
      scenarios.data?.pages
        ? scenarios.data.pages.flatMap((p: any) => p?.data ?? [])
        : [],
    [scenarios.data]
  );

  const caseOptions = React.useMemo(
    () =>
      cases.data?.pages
        ? cases.data.pages.flatMap((p: any) => p?.data ?? [])
        : [],
    [cases.data]
  );

  // Infinite scroll handlers for dropdown lists
  const SCROLL_LOAD_THRESHOLD_PX = 24;

  const handleScrollLoadMoreScenarios = React.useCallback(
    (e: any) => {
      const el = e?.target as HTMLElement | null;
      if (!el) return;
      const nearBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight <
        SCROLL_LOAD_THRESHOLD_PX;
      if (
        nearBottom &&
        scenarios.hasNextPage &&
        !scenarios.isFetchingNextPage
      ) {
        scenarios.fetchNextPage();
      }
    },
    [
      scenarios.hasNextPage,
      scenarios.isFetchingNextPage,
      scenarios.fetchNextPage,
    ]
  );

  const handleScrollLoadMoreCases = React.useCallback(
    (e: any) => {
      const el = e?.target as HTMLElement | null;
      if (!el) return;
      const nearBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight <
        SCROLL_LOAD_THRESHOLD_PX;
      if (nearBottom && cases.hasNextPage && !cases.isFetchingNextPage) {
        cases.fetchNextPage();
      }
    },
    [cases.hasNextPage, cases.isFetchingNextPage, cases.fetchNextPage]
  );

  React.useEffect(() => {
    if (scenarios.isLoading || scenarios.isFetching) return;
    if (
      scenarioId &&
      !scenarioOptions.some((s: any) => Number(s.id) === Number(scenarioId))
    ) {
      store.setScenario(undefined, undefined);
    }
  }, [scenarioId, scenarioOptions, scenarios.isLoading, scenarios.isFetching]);

  React.useEffect(() => {
    if (cases.isLoading || cases.isFetching) return;
    if (
      caseId &&
      !caseOptions.some((c: any) => Number(c.id) === Number(caseId))
    ) {
      store.setCase(undefined, undefined);
    }
  }, [caseId, caseOptions, cases.isLoading, cases.isFetching]);

  const updateStartAt = React.useCallback(
    (date: Date | undefined, t: string) => {
      if (!date) {
        store.setStartAt(undefined);
        return;
      }
      const [hh, mm] = (t || "00:00").split(":").map((x) => Number(x));
      const y = date.getFullYear();
      const m = date.getMonth() + 1; // month is 0-based
      const d = date.getDate();
      // Construct a LOCAL datetime and convert to UTC ISO for backend storage
      const localDateTime = new Date(
        Number(y),
        Number(m) - 1,
        Number(d),
        Number(hh),
        Number(mm),
        0,
        0
      );
      const utcIso = localDateTime.toISOString();
      store.setStartAt(utcIso);
    },
    [store]
  );

  return (
    <div className="bg-white text-black min-h-screen flex flex-col">
      <div className="px-4 py-4 h-[80dvh] overflow-y-auto">
        <h1 className="text-xl font-semibold mb-4">Создайте свою практику</h1>

				<div className="space-y-3">
			<div>
					<MultiSelectChips
						options={skillOptions}
						value={skillIds}
						onChange={(next) => {
							const ids = next.map((v) => Number(v));
							store.setSkills(ids);
							const labelMap = new Map(skillOptions.map((o) => [String(o.value), o.label]));
							const names = next
								.map((v) => labelMap.get(String(v)))
								.filter(Boolean) as string[];
							store.setSkillNames(names);
						}}
						placeholder={"Выберите навыки"}
						onLoadMore={() => {
							if (skills.hasNextPage && !skills.isFetchingNextPage) skills.fetchNextPage();
						}}
						canLoadMore={Boolean(skills.hasNextPage)}
						isLoadingMore={Boolean(skills.isFetchingNextPage)}
					/>
				</div>

          <div>
            <Select
              onValueChange={(t) => {
                const pt = t as PracticeType;
                store.setPracticeType(pt);
                if (pt === "WITHOUT_CASE") {
                  store.setCase(undefined);
                }
              }}
              value={practiceType as any}
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

          <div>
            <Select
              onValueChange={(id) => {
                const s = scenarioOptions.find(
                  (x: any) => String(x.id) === String(id)
                );
                store.setScenario(Number(id), s?.title);
                if (s?.practiceType) store.setPracticeType(s.practiceType);
              }}
              value={scenarioId ? String(scenarioId) : undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите сценарий практики" />
              </SelectTrigger>
              <SelectContent
                side="bottom"
                align="start"
                onScroll={handleScrollLoadMoreScenarios}
              >
                <SelectGroup>
                  {scenarioOptions?.length ? (
                    scenarioOptions.map((s: any) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.title}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem disabled value="__none">
                      Нет сценариев для текущего навыка и кейса
                    </SelectItem>
                  )}
                  {scenarios.isFetchingNextPage ? (
                    <SelectItem disabled value="__loading_scenarios">
                      Загрузка...
                    </SelectItem>
                  ) : null}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select
              onValueChange={(id) => {
                const c = caseOptions.find(
                  (x: any) => String(x.id) === String(id)
                );
                store.setCase(Number(id), c?.title);
              }}
              disabled={practiceType === "WITHOUT_CASE"}
              value={caseId ? String(caseId) : undefined}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    practiceType === "WITHOUT_CASE"
                      ? "Тип без кейса — выбор не требуется"
                      : "Выберите кейс практики"
                  }
                />
              </SelectTrigger>
              <SelectContent
                side="bottom"
                align="start"
                onScroll={handleScrollLoadMoreCases}
              >
                <SelectGroup>
                  {caseOptions?.length ? (
                    caseOptions.map((c: any) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.title}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem disabled value="__none">
                      Нет кейсов для текущего навыка и сценария
                    </SelectItem>
                  )}
                  {cases.isFetchingNextPage ? (
                    <SelectItem disabled value="__loading_cases">
                      Загрузка...
                    </SelectItem>
                  ) : null}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-row gap-2">
            <DatePickerFloatingLabel
              className="w-3/5"
              placeholder="Дата проведения (локальная)"
              value={selectedDate}
              onValueChange={(d) => {
                setSelectedDate(d);
                updateStartAt(d, time);
              }}
            />
            <input
              type="time"
              value={time}
              onChange={(e) => {
                setTime(e.target.value);
                updateStartAt(selectedDate, e.target.value);
              }}
              className="w-2/5 h-16 rounded-2xl bg-white-gray px-4 text-sm font-medium placeholder:text-second-gray"
              placeholder="Время (локальное)"
              step={300}
              min="00:00"
              max="23:59"
              lang="ru-RU"
            />
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-24 p-4 pb-0">
        <Button
          className="w-full"
          disabled={
            !practiceType ||
            !scenarioId ||
            (practiceType === "WITH_CASE" && !caseId) ||
            !startAt
          }
          onClick={() => navigate("/practice/preview")}
        >
          Следующий шаг
        </Button>
      </div>
    </div>
  );
};

export default PracticeCreatePage;
