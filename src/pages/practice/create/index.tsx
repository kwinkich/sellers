import * as React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerFloatingLabel } from "@/components/ui/datePickerFloating";
import { useCreatePracticeStore } from "@/feature/practice-feature";
import { useQuery } from "@tanstack/react-query";
import { skillsQueryOptions } from "@/entities/skill/model/api/skill.api";
import { scenariosQueryOptions } from "@/entities/scenarios/model/api/scenarios.api";
import { casesQueryOptions } from "@/entities/case/model/api/case.api";
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
  const scenarios = useQuery({
    ...scenariosQueryOptions.list({
      caseId: caseId as any,
      skillIds: skillIds.length ? (skillIds as any) : undefined,
      practiceType: practiceType as any,
    }),
    staleTime: 5 * 60 * 1000,
  });
  const cases = useQuery({
    ...casesQueryOptions.list({
      scenarioId: scenarioId as any,
      skillIds: skillIds.length ? (skillIds as any) : undefined,
    }),
    enabled: practiceType !== "WITHOUT_CASE",
  });

  // Keep selections valid against current filters so placeholders stay visible
  const scenarioOptions = scenarios.data?.data ?? [];
  const caseOptions = cases.data?.data ?? [];

  React.useEffect(() => {
    if (scenarioId && !scenarioOptions.some((s: any) => Number(s.id) === Number(scenarioId))) {
      store.setScenario(undefined);
    }
  }, [scenarioId, scenarioOptions]);

  React.useEffect(() => {
    if (caseId && !caseOptions.some((c: any) => Number(c.id) === Number(caseId))) {
      store.setCase(undefined);
    }
  }, [caseId, caseOptions]);

  const updateStartAt = React.useCallback(
    (date: Date | undefined, t: string) => {
      if (!date) {
        store.setStartAt(undefined);
        return;
      }
      const [hh, mm] = (t || "00:00").split(":").map((x) => Number(x));
      const y = date.getFullYear();
      const m = date.getMonth();
      const d = date.getDate();
      const utc = new Date(Date.UTC(y, m, d, hh - 3, mm, 0, 0));
      store.setStartAt(utc.toISOString());
    },
    [store]
  );

  return (
    <div className="bg-white min-h-dvh px-4 py-4 text-black">
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
          <Select onValueChange={(id) => { const s = scenarios.data?.data?.find((x:any)=> String(x.id)===String(id)); store.setScenario(Number(id), s?.title); if (s?.practiceType) store.setPracticeType(s.practiceType); }} value={scenarioId ? String(scenarioId) : undefined}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите сценарий практики" />
            </SelectTrigger>
            <SelectContent side="bottom" align="start">
              <SelectGroup>
                {scenarios.data?.data?.length
                  ? scenarios.data?.data?.map((s: any) => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.title}</SelectItem>
                    ))
                  : (
                    <SelectItem disabled value="__none">Нет сценариев по текущим выбранному навыку и кейсу</SelectItem>
                  )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select onValueChange={(id) => { const c = cases.data?.data?.find((x:any)=> String(x.id)===String(id)); store.setCase(Number(id), c?.title); }} disabled={practiceType === "WITHOUT_CASE"} value={caseId ? String(caseId) : undefined}>
            <SelectTrigger>
              <SelectValue placeholder={practiceType === "WITHOUT_CASE" ? "Тип без кейса — выбор не требуется" : (!scenarioId ? "Сначала выберите сценарий" : "Выберите кейс практики")} />
            </SelectTrigger>
            <SelectContent side="bottom" align="start">
              <SelectGroup>
                {cases.data?.data?.length
                  ? cases.data?.data?.map((c: any) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>
                    ))
                  : (
                    <SelectItem disabled value="__none">Нет сценариев по текущим выбранному навыку и кейсу</SelectItem>
                  )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <DatePickerFloatingLabel
            placeholder="Дата проведения (МСК)"
            value={selectedDate}
            onValueChange={(d) => {
              setSelectedDate(d);
              updateStartAt(d, time);
            }}
          />
          <div className="flex items-center">
            <input
              type="time"
              value={time}
              onChange={(e) => {
                setTime(e.target.value);
                updateStartAt(selectedDate, e.target.value);
              }}
              className="w-full h-16 rounded-2xl bg-white-gray px-4 text-sm font-medium placeholder:text-second-gray"
              placeholder="Время (МСК)"
              step={300}
              min="00:00"
              max="23:59"
              lang="ru-RU"
            />
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-24 p-4 pb-0 bg-white z-[60]">
        <Button
          className="w-full"
          disabled={!practiceType || !scenarioId || ((practiceType === "WITH_CASE") && !caseId) || skillIds.length === 0 || !startAt}
          onClick={() => navigate("/practice/preview")}
        >
          Следующий шаг
        </Button>
      </div>
    </div>
  );
};

export default PracticeCreatePage;


