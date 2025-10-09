import { API, type GApiResponse } from "@/shared";
import { queryOptions } from "@tanstack/react-query";
import type {
	EvaluationForm,
	EvaluationBatchSubmission,
	EvaluationSubmitResult,
	FinalEvaluationForm,
} from "../types/practice-evaluation.types";

export const PracticeEvaluationAPI = {

	getEvaluationForms: (practiceId: number) =>
		API.get(`practices/${practiceId}/evaluation/forms`).json<
		GApiResponse<EvaluationForm[]>
		>(),

	getEvaluationFormsFinal: (practiceId: number) =>
		API.get(`practices/${practiceId}/evaluation/forms-final`).json<
		GApiResponse<FinalEvaluationForm[]>
		>(),

	submitEvaluation: (practiceId: number, submission: EvaluationBatchSubmission) =>
		API.post(`practices/${practiceId}/evaluation/submit`, {
			json: submission,
		}).json<GApiResponse<EvaluationSubmitResult>>(),

};

export const practiceEvaluationQueryOptions = {
  	forms: (practiceId: number) =>
    	queryOptions({
      	queryKey: ["practices", "evaluation", "forms", practiceId],
      	queryFn: () => PracticeEvaluationAPI.getEvaluationForms(practiceId),
   		}),
		
	formsFinal: (practiceId: number) =>
    	queryOptions({
      	queryKey: ["practices", "evaluation", "forms-final", practiceId],
      	queryFn: () => PracticeEvaluationAPI.getEvaluationFormsFinal(practiceId),
   		}),
};

export const practiceEvaluationMutationOptions = {
	submit: () => ({
		mutationFn: ({
			practiceId,
			data,
		}: {
			practiceId: number;
			data: EvaluationBatchSubmission;
		}) => PracticeEvaluationAPI.submitEvaluation(practiceId, data),
	}),
};
