import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InputFloatingLabel from "@/components/ui/inputFloating";

interface ViewQuestionBlockProps {
  title: string;
}

export function ViewQuestionBlock({ title }: ViewQuestionBlockProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-2 px-4">
        <CardTitle>Блок вопрос-ответ</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <InputFloatingLabel
            placeholder="Вопрос:"
            value={title}
            disabled={true}
            className="disabled:opacity-100"
          />
        </div>
      </CardContent>
    </Card>
  );
}
