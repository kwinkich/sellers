import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InputFloatingLabel from "@/components/ui/inputFloating";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface QuestionBlockProps {
  id: string;
  onDelete?: () => void;
  questionContent?: string;
  onQuestionChange?: (question: string) => void;
}

export function QuestionBlock({ onDelete, questionContent = "", onQuestionChange }: QuestionBlockProps) {
  const [question, setQuestion] = useState(questionContent);

  const handleQuestionChange = (value: string) => {
    setQuestion(value);
    onQuestionChange?.(value);
  };

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
            onChange={(e) => handleQuestionChange(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}


