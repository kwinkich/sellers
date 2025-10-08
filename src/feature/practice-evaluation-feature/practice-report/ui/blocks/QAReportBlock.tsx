import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const QAReportBlock = ({ title, answer }: { title: string; answer: string }) => {
  return (
    <Card>
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <textarea
          value={answer}
          readOnly
          disabled
          className="w-full bg-white text-sm border-none resize-none disabled:opacity-100 overflow-hidden min-h-[50px]"
        />
      </CardContent>
    </Card>
  );
};


