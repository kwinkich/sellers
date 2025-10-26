import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TextareaFloatingLabel from "@/components/ui/textareaFloating";

interface ViewTextBlockProps {
  title: string;
}

export function ViewTextBlock({ title }: ViewTextBlockProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-2 px-4">
        <CardTitle>Текстовый блок</CardTitle>
      </CardHeader>
      <CardContent>
        <TextareaFloatingLabel
          placeholder="Текст"
          className="min-h-[100px] disabled:opacity-100"
          value={title}
          disabled={true}
        />
      </CardContent>
    </Card>
  );
}
