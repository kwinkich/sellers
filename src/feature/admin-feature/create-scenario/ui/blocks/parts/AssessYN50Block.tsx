import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectFloatingLabel } from "@/components/ui/selectFloating";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { skillsQueryOptions } from "@/entities/skill/model/api/skill.api";
import { useMemo, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { X } from "lucide-react";

type Row = { id: string; question: string; value: "YES" | "NO" | "FIFTY" | "UNKNOWN" | "" };

export function AssessYN50Block({ id, onDelete }: { id: string; onDelete?: () => void }) {
  const { data } = useQuery(skillsQueryOptions.list());
  const skillOptions = useMemo(() => data?.data?.map((s) => ({ value: String(s.id), label: s.name })) ?? [], [data]);
  const [selectedSkillId, setSelectedSkillId] = useState<string>("");
  const [rows, setRows] = useState<Row[]>([]);
  const [labels, setLabels] = useState({ yes: "ДА", no: "НЕТ", half: "50/50", unknown: "?" });

  const addRow = () => setRows((prev) => [...prev, { id: `${Date.now()}`, question: "", value: "" }]);
  const updateRow = (rowId: string, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, ...patch } : r)));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Оценивание навыка</CardTitle>
        <Button
          size="2s"
          variant="ghost"
          className="text-right justify-end p-0 h-10 w-10 flex items-center justify-center"
          onClick={onDelete}
          aria-label="Удалить блок"
        >
          <X className="h-5 w-5 text-black" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 1) Skill */}
          <div className="space-y-2">
            <Label className="text-sm">Навык</Label>
            <SelectFloatingLabel
              placeholder="Выберите навык"
              value={selectedSkillId}
              onValueChange={setSelectedSkillId}
              options={skillOptions}
              className="h-16"
            />
          </div>

          {/* 2) Scale labels */}
          <div className="space-y-2">
            <Label className="text-sm">Система оценивания</Label>
            <div className="grid grid-cols-4 gap-2">
              <Input value={labels.yes} onChange={(e) => setLabels((l) => ({ ...l, yes: e.target.value }))} className="h-10" />
              <Input value={labels.no} onChange={(e) => setLabels((l) => ({ ...l, no: e.target.value }))} className="h-10" />
              <Input value={labels.half} onChange={(e) => setLabels((l) => ({ ...l, half: e.target.value }))} className="h-10" />
              <Input value={labels.unknown} onChange={(e) => setLabels((l) => ({ ...l, unknown: e.target.value }))} className="h-10" />
            </div>
          </div>

          {/* 3) Questions list */}
          <div className="space-y-4">
            <Label className="text-sm">Вопросы</Label>
            <div className="space-y-4">
              {rows.map((row) => (
                <div key={row.id} className="flex items-center gap-2">
                  <Input
                    placeholder="Введите вопрос..."
                    value={row.question}
                    onChange={(e) => updateRow(row.id, { question: e.target.value })}
                    className="flex-1 h-12"
                  />
                  <Button size="2s" variant="ghost" onClick={() => setRows((prev) => prev.filter((r) => r.id !== row.id))}>
                    <Trash2 className="h-full w-full text-black" />
                  </Button>
                </div>
              ))}
            </div>
            <Button type="button" onClick={addRow} className="h-12 gap-2 w-full text-center">
              <Plus className="h-2 w-2 text-center" /> Добавить вопрос
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


