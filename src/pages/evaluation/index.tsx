import { EvaluationForm } from "@/feature/practice-evaluation-feature/evaluate-practice";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { practiceEvaluationQueryOptions } from "@/entities/practice-evaluation/model/api/practice-evaluation.api";

export const EvaluationPage = () => {
  const { practiceId } = useParams<{ practiceId: string }>();
  const id = Number(practiceId);

  // Fetch forms list for this practice (filtered by evaluator on backend)
  const { data, isLoading, error } = useQuery(
    practiceEvaluationQueryOptions.forms(id)
  );

  console.log(data);
  console.log(error);
  console.log(isLoading);

  // TODO: plumb fetched data into EvaluationForm (currently using mock)
  return <EvaluationForm />;
};
