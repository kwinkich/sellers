import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import TextareaFloatingLabel from "@/components/ui/textareaFloating";
import { useState } from "react";

interface TextBlockProps {
  id: string;
  onDelete?: () => void;
  textContent?: string;
  onTextChange?: (text: string) => void;
}

export function TextBlock({  onDelete, textContent = "", onTextChange }: TextBlockProps) {
  const [text, setText] = useState(textContent);

  const handleTextChange = (value: string) => {
    setText(value);
    onTextChange?.(value);
  };

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
}


