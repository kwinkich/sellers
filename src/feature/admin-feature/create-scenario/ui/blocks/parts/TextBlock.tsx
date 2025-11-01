import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TextareaFloatingLabel from "@/components/ui/textareaFloating";
import { X } from "lucide-react";
import { useState, useCallback, useEffect, useMemo } from "react";
import React from "react";
import debounce from "lodash.debounce";
import { cn } from "@/lib/utils";

interface TextBlockProps {
  id: string;
  onDelete?: () => void;
  textContent?: string;
  showValidation?: boolean;
  onTextChange?: (text: string) => void;
}

export const TextBlock = React.memo(function TextBlock({
  id,
  onDelete,
  textContent = "",
  showValidation = false,
  onTextChange,
}: TextBlockProps) {
  const [text, setText] = useState(textContent);

  // Debounce parent updates to prevent re-renders on every keystroke
  const debouncedNotify = useMemo(
    () => debounce((value: string) => onTextChange?.(value), 300),
    [onTextChange]
  );

  // Cleanup debounced function on unmount
  useEffect(() => () => debouncedNotify.cancel(), [debouncedNotify]);

  const handleTextChange = useCallback(
    (value: string) => {
      setText(value);
      debouncedNotify(value); // Parent gets batched updates, not every key
    },
    [debouncedNotify]
  );

  // Validation: text must not be empty
  const isValid = useMemo(() => {
    return text.trim().length > 0;
  }, [text]);

  const validationMessage = useMemo(() => {
    if (!text || text.trim().length === 0) {
      return "Необходимо заполнить текст";
    }
    return null;
  }, [text]);

  return (
    <Card
      data-block-id={id}
      className={cn(
        "transition-colors",
        !isValid && showValidation && "border-amber-500 border-1"
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Текстовый блок</CardTitle>
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
        {validationMessage && showValidation && (
          <div className="text-sm text-amber-700 bg-amber-50 p-2 rounded-md mb-2">
            {validationMessage}
          </div>
        )}
        <TextareaFloatingLabel
          placeholder="Введите текст...."
          className="min-h-[100px]"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
        />
      </CardContent>
    </Card>
  );
});
