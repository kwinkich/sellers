import { Card, CardContent } from "@/components/ui/card";
import type { EvaluationBlock } from "../EvaluationForm";

interface QAEvaluationBlockProps {
  block: EvaluationBlock;
  formRole: string;
}

export const QAEvaluationBlock = ({ block, formRole }: QAEvaluationBlockProps) => (
  <Card>
    <CardContent className="p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        {block.title || `Вопрос про ${formRole.toLowerCase()}`}
      </h3>
      <input
        type="text"
        placeholder={`Ваш ответ`}
        className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </CardContent>
  </Card>
);
