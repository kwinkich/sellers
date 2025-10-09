import * as React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerFloatingLabel } from "@/components/ui/datePickerFloating";
import { useCreatePracticeStore } from "@/feature/practice-feature";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { skillsQueryOptions } from "@/entities/skill/model/api/skill.api";
import { ScenariosAPI } from "@/entities/scenarios/model/api/scenarios.api";
import { CasesAPI } from "@/entities/case/model/api/case.api";
import { useNavigate } from "react-router-dom";
import type { PracticeType } from "@/shared/types/practice.types";
import { getPracticeTypeLabel } from "@/shared/lib/getPracticeTypeLabel";

const PracticeCreatePage = () => {
  const store = useCreatePracticeStore();
  const navigate = useNavigate();
  const { scenarioId, caseId, skillIds, startAt, practiceType } = store;

  const [time, setTime] = React.useState<string>("15:00");
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(startAt ? new Date(startAt) : undefined);

  const skills = useQuery(skillsQueryOptions.list());
  const scenarios = useInfiniteQuery({
    queryKey: [
      "scenarios",
      "list",
      { caseId, skillIds: skillIds.length ? skillIds : undefined, practiceType },
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
      const totalPages = p.totalPages ?? (p.totalItems && p.limit ? Math.ceil(p.totalItems / p.limit) : undefined);
      if (typeof totalPages === "number") return currentPage < totalPages ? currentPage + 1 : undefined;
      if (typeof p.hasNext === "boolean") return p.hasNext ? currentPage + 1 : undefined;
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
      const totalPages = p.totalPages ?? (p.totalItems && p.limit ? Math.ceil(p.totalItems / p.limit) : undefined);
      if (typeof totalPages === "number") return currentPage < totalPages ? currentPage + 1 : undefined;
      if (typeof p.hasNext === "boolean") return p.hasNext ? currentPage + 1 : undefined;
      return undefined;
    },
    enabled: practiceType !== "WITHOUT_CASE",
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  });

  // Keep selections valid against current filters so placeholders stay visible
  const scenarioOptions = React.useMemo(
    () => (scenarios.data?.pages ? scenarios.data.pages.flatMap((p: any) => p?.data ?? []) : []),
    [scenarios.data]
  );
  const caseOptions = React.useMemo(
    () => (cases.data?.pages ? cases.data.pages.flatMap((p: any) => p?.data ?? []) : []),
    [cases.data]
  );

  // Auto-load all pages so selects show complete lists
  React.useEffect(() => {
    if (scenarios.hasNextPage && !scenarios.isFetchingNextPage) {
      scenarios.fetchNextPage();
    }
  }, [scenarios.hasNextPage, scenarios.isFetchingNextPage, scenarios.fetchNextPage]);

  React.useEffect(() => {
    if (practiceType !== "WITHOUT_CASE" && cases.hasNextPage && !cases.isFetchingNextPage) {
      cases.fetchNextPage();
    }
  }, [practiceType, cases.hasNextPage, cases.isFetchingNextPage, cases.fetchNextPage]);

  React.useEffect(() => {
    if (scenarios.isLoading || scenarios.isFetching) return;
    if (scenarioId && !scenarioOptions.some((s: any) => Number(s.id) === Number(scenarioId))) {
      store.setScenario(undefined, undefined);
    }
  }, [scenarioId, scenarioOptions, scenarios.isLoading, scenarios.isFetching]);

  React.useEffect(() => {
    if (cases.isLoading || cases.isFetching) return;
    if (caseId && !caseOptions.some((c: any) => Number(c.id) === Number(caseId))) {
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
      const pad = (n: number) => String(n).padStart(2, "0");
      const localIsoWithoutTz = `${y}-${pad(m)}-${pad(d)}T${pad(hh)}:${pad(mm)}:00`;
      store.setStartAt(localIsoWithoutTz);
    },
    [store]
  );

  return (
    <div className="bg-white px-4 py-4 text-black">
      <h1 className="text-xl font-semibold mb-4">Создайте свою практику</h1>

      <div className="space-y-3">
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
                {(["WITH_CASE", "WITHOUT_CASE", "MINI"] as PracticeType[]).map((t) => (
                  <SelectItem key={t} value={t}>{getPracticeTypeLabel(t)}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select
            onValueChange={(id) => {
              store.setSkills([Number(id)]);
              const item = skills.data?.data?.find((x: any) => String(x.id) === String(id));
              if (item) store.setSkillNames([item.name]);
            }}
            value={skillIds[0] ? String(skillIds[0]) : undefined}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите навык" />
            </SelectTrigger>
            <SelectContent side="bottom" align="start">
              <SelectGroup>
                {skills.data?.data?.length
                  ? skills.data?.data?.map((s: any) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))
                  : (
                    <SelectItem disabled value="__none">Нет навыков</SelectItem>
                  )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select onValueChange={(id) => { const s = scenarioOptions.find((x:any)=> String(x.id)===String(id)); store.setScenario(Number(id), s?.title); if (s?.practiceType) store.setPracticeType(s.practiceType); }} value={scenarioId ? String(scenarioId) : undefined}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите сценарий практики" />
            </SelectTrigger>
            <SelectContent side="bottom" align="start">
              <SelectGroup>
                {scenarioOptions?.length
                  ? scenarioOptions.map((s: any) => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.title}</SelectItem>
                    ))
                  : (
                    <SelectItem disabled value="__none">Нет сценариев для текущего навыка и кейса</SelectItem>
                  )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select onValueChange={(id) => { const c = caseOptions.find((x:any)=> String(x.id)===String(id)); store.setCase(Number(id), c?.title); }} disabled={practiceType === "WITHOUT_CASE"} value={caseId ? String(caseId) : undefined}>
            <SelectTrigger>
              <SelectValue placeholder={practiceType === "WITHOUT_CASE" ? "Тип без кейса — выбор не требуется" : "Выберите кейс практики"} />
            </SelectTrigger>
            <SelectContent side="bottom" align="start">
              <SelectGroup>
                {caseOptions?.length
                  ? caseOptions.map((c: any) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>
                    ))
                  : (
                    <SelectItem disabled value="__none">Нет кейсов для текущего навыка и сценария</SelectItem>
                  )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-row gap-2">
          <DatePickerFloatingLabel
            className="w-3/5"
            placeholder="Дата проведения (МСК)"
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
            placeholder="Время (МСК)"
            step={300}
            min="00:00"
            max="23:59"
            lang="ru-RU"
          />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-24 p-4 pb-0">
        <Button
          className="w-full"
          disabled={!practiceType || !scenarioId || ((practiceType === "WITH_CASE") && !caseId) || !startAt}
          onClick={() => navigate("/practice/preview")}
        >
          Следующий шаг
        </Button>
      </div>
    </div>
  );
};

export default PracticeCreatePage;


