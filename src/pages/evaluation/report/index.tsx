import { ReportForm } from "@/feature/practice-evaluation-feature/practice-report/ui/ReportForm";
import { practiceEvaluationQueryOptions } from "@/entities/practice-evaluation";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";


export const EvaluationReportPage = () => {
  
  const {practiceId} = useParams<{practiceId: string}>();
  const id = Number(practiceId);
  
  const {
    data: formsRes,
    isLoading,
    error,
  } = useQuery(practiceEvaluationQueryOptions.formsFinal(id));

  console.log(formsRes);
  console.log(error);
  console.log(id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !formsRes?.data) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500">Ошибка загрузки отчета</p>
          <p className="text-sm text-gray-500 mt-2">
            {error?.message || "Не удалось загрузить данные отчета"}
          </p>
        </div>
      </div>
    );
  }

  const formsData = formsRes.data;

  return <ReportForm formsData={formsData} />;
};


