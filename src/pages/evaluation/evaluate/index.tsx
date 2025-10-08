import { EvaluationForm } from "@/feature/practice-evaluation-feature/evaluate-practice";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { practiceEvaluationQueryOptions } from "@/entities/practice-evaluation/model/api/practice-evaluation.api";
import { Loader2 } from "lucide-react";

export const EvaluationPage = () => {
  const { practiceId } = useParams<{ practiceId: string }>();
  const id = Number(practiceId);

  // Fetch forms list for this practice (filtered by evaluator on backend)
  const { data, isLoading, error } = useQuery(
    practiceEvaluationQueryOptions.forms(id)
  );
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return <EvaluationForm formsData={data?.data || []} practiceId={id} />;
};
