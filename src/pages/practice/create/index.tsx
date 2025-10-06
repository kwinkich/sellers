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

const PracticeCreatePage = () => {
  const store = useCreatePracticeStore();
  const navigate = useNavigate();
  const { scenarioId, caseId, skillIds, startAt } = store;

  const [time, setTime] = React.useState<string>("15:00");
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(startAt ? new Date(startAt) : undefined);

  const skills = useQuery(skillsQueryOptions.list());
  const scenarios = useQuery({ ...scenariosQueryOptions.list(), staleTime: 5 * 60 * 1000 });
  const cases = useQuery({ ...casesQueryOptions.list({ scenarioId: scenarioId as any }), enabled: !!scenarioId });

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
                {skills.data?.data?.map((s: any) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select onValueChange={(id) => { const s = scenarios.data?.data?.find((x:any)=> String(x.id)===String(id)); store.setScenario(Number(id), s?.title); }} value={scenarioId ? String(scenarioId) : undefined}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите сценарий практики" />
            </SelectTrigger>
            <SelectContent side="bottom" align="start">
              <SelectGroup>
                {scenarios.data?.data?.map((s: any) => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.title}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select onValueChange={(id) => { const c = cases.data?.data?.find((x:any)=> String(x.id)===String(id)); store.setCase(Number(id), c?.title); }} disabled={!scenarioId} value={caseId ? String(caseId) : undefined}>
            <SelectTrigger>
              <SelectValue placeholder={!scenarioId ? "Сначала выберите сценарий" : "Выберите кейс практики"} />
            </SelectTrigger>
            <SelectContent side="bottom" align="start">
              <SelectGroup>
                {cases.data?.data?.map((c: any) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>
                ))}
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

      <div className="fixed inset-x-0 bottom-0 p-4 bg-white">
        <Button
          className="w-full"
          disabled={!scenarioId || !caseId || skillIds.length === 0 || !startAt}
          onClick={() => navigate("/practice/preview")}
        >
          Следующий шаг
        </Button>
      </div>
    </div>
  );
};

export default PracticeCreatePage;


