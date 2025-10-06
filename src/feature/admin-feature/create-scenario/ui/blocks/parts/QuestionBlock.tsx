import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InputFloatingLabel from "@/components/ui/inputFloating";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function QuestionBlock({ id, onDelete }: { id: string; onDelete?: () => void }) {
  const [question, setQuestion] = useState("");
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Блок вопрос-ответ</CardTitle>
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
        <div className="space-y-1">
          <InputFloatingLabel
            placeholder="Введите вопрос...."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}


