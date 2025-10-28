import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TextareaFloatingLabel from "@/components/ui/textareaFloating";
import { X } from "lucide-react";
import { useState, useCallback, useEffect, useMemo } from "react";
import React from "react";
import debounce from "lodash.debounce";

interface TextBlockProps {
  id: string;
  onDelete?: () => void;
  textContent?: string;
  onTextChange?: (text: string) => void;
}

export const TextBlock = React.memo(function TextBlock({
  onDelete,
  textContent = "",
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

  return (
    <Card>
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
