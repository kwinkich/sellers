import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { practicesMutationOptions } from "@/entities/practices";
import { useCreatePracticeStore } from "@/feature/practice-feature";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ScenarioIcon, PracticeTypeIcon, SkillsIcon, CalendarIcon } from "@/shared";
import { getPracticeTypeLabel } from "@/shared/lib/getPracticeTypeLabel";
import type { PracticeType } from "@/shared/types/practice.types";
import { useQuery } from "@tanstack/react-query";
import { scenariosQueryOptions } from "@/entities/scenarios/model/api/scenarios.api";

const PracticePreviewPage = () => {
  const store = useCreatePracticeStore();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { scenarioId, caseId, skillIds, startAt, zoomLink, initialRole, scenarioTitle, skillNames } = store;
  const scenarioDetail = useQuery({ ...scenariosQueryOptions.byId(scenarioId ?? 0), enabled: !!scenarioId });
  const practiceType = scenarioDetail.data?.data?.practiceType as PracticeType | undefined;
  const practiceTypeLabel = practiceType ? getPracticeTypeLabel(practiceType) : undefined;

  const create = useMutation({
    ...practicesMutationOptions.create(),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["practices", "cards"] });
      store.close();
      navigate("/practice");
    },
  });

  return (
    <div className="bg-white min-h-dvh text-black">

      <div className="flex flex-col bg-base-bg p-3 text-sm rounded-b-2xl text-white gap-2 mb-3">
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-xl font-semibold">Предпросмотр практики</h1>
          <Button size="2s" variant="main-opacity10" text="main" className="rounded-lg px-3 bg-transparent" onClick={() => navigate("/practice/create")}>Изменить</Button>
        </div>

        <div className="bg-second-bg flex flex-row gap-5 p-2 rounded-2xl items-center">
          <ScenarioIcon size={24} cn="ml-1.5 text-base-main" />
          <div className="flex flex-col gap-1">
            <span className="text-base-gray">Сценарий практики</span> {scenarioTitle ?? "—"}
          </div>
        </div>
        <div className="bg-second-bg flex flex-row gap-5 p-2 rounded-2xl items-center">
          <PracticeTypeIcon size={24} cn="ml-1.5 text-base-main" />
          <div className="flex flex-col gap-1">
            <span className="text-base-gray">Тип практики</span> {practiceTypeLabel ?? "—"}
          </div>
        </div>
        <div className="bg-second-bg flex flex-row gap-5 p-2 rounded-2xl items-center">
          <SkillsIcon size={24} cn="ml-1.5 text-base-main" />
          <div className="flex flex-col gap-1">
            <span className="text-base-gray">Навык практики</span> {skillNames[0] ?? "—"}
          </div>
        </div>
        <div className="bg-second-bg flex flex-row gap-5 p-2 rounded-2xl items-center">
          <CalendarIcon size={24} cn="ml-1.5 text-base-main" />
          <div className="flex flex-col gap-1">
            <span className="text-base-gray">Дата/время</span> {startAt ? new Date(startAt).toLocaleString("ru-RU", { timeZone: "Europe/Moscow" }) : "—"}
          </div>
        </div>
      </div>

      <div className="space-y-3 p-3">
        <div>
          <input
            className="w-full h-16 rounded-2xl bg-gray-100 px-4 text-sm font-medium placeholder:text-second-gray"
            value={zoomLink}
            onChange={(e) => store.setZoom(e.target.value)}
            placeholder="Ссылка на встречу"
          />
        </div>

        <div>
          <Select onValueChange={(v) => store.setRole(v as any)} value={initialRole as any}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите свою роль" />
            </SelectTrigger>
            <SelectContent side="bottom" align="start">
              <SelectGroup>
                <SelectItem value="SELLER">Продавец</SelectItem>
                <SelectItem value="BUYER">Покупатель</SelectItem>
                <SelectItem value="MODERATOR">Модератор</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 p-4 bg-white">
        <Button
          className="w-full"
          disabled={create.isPending || !initialRole || !zoomLink}
          onClick={() => {
            if (!scenarioId || !caseId || !startAt || !initialRole) return;
            create.mutate({
              scenarioId,
              caseId,
              skillIds,
              startAt,
              initialRole,
              zoomLink,
            } as any);
          }}
        >
          {create.isPending ? "Публикация…" : "Опубликовать"}
        </Button>
      </div>
    </div>
  );
};

export default PracticePreviewPage;


