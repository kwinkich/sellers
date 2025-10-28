import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InputFloatingLabel from "@/components/ui/inputFloating";
import { useState, useCallback, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import React from "react";
import debounce from "lodash.debounce";

interface QuestionBlockProps {
  id: string;
  onDelete?: () => void;
  questionContent?: string;
  onQuestionChange?: (question: string) => void;
}

export const QuestionBlock = React.memo(function QuestionBlock({
  onDelete,
  questionContent = "",
  onQuestionChange,
}: QuestionBlockProps) {
  const [question, setQuestion] = useState(questionContent);

  // Debounce parent updates to prevent re-renders on every keystroke
  const debouncedNotify = useMemo(
    () => debounce((value: string) => onQuestionChange?.(value), 300),
    [onQuestionChange]
  );

  // Cleanup debounced function on unmount
  useEffect(() => () => debouncedNotify.cancel(), [debouncedNotify]);

  const handleQuestionChange = useCallback(
    (value: string) => {
      setQuestion(value);
      debouncedNotify(value); // Parent gets batched updates, not every key
    },
    [debouncedNotify]
  );

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
});
