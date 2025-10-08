import { API, createSearchParams, type GApiResponse } from "@/shared";
import { queryOptions } from "@tanstack/react-query";
import type {
	EvaluationForm,
	EvaluationSubmission,
	EvaluationSubmitResult,
	EvaluationTask,
	GetEvaluationFormParams,
} from "../types/practice-evaluation.types";

export const PracticeEvaluationAPI = {
	getEvaluationTasks: (practiceId: number) =>
		API.get(`practices/${practiceId}/evaluation/tasks`).json<
			GApiResponse<EvaluationTask[]>
		>(),

	getEvaluationForm: (practiceId: number, params: GetEvaluationFormParams) => {
		const searchParams = createSearchParams(params);
		return API.get(`practices/${practiceId}/evaluation/form`, {
			searchParams,
		}).json<GApiResponse<EvaluationForm>>();
	},

  getEvaluationForms: (practiceId: number) =>
    API.get(`practices/${practiceId}/evaluation/forms`).json<
      GApiResponse<EvaluationForm[]>
    >(),

	submitEvaluation: (practiceId: number, submission: EvaluationSubmission) =>
		API.post(`practices/${practiceId}/evaluation/submit`, {
			json: submission,
		}).json<GApiResponse<EvaluationSubmitResult>>(),
};

export const practiceEvaluationQueryOptions = {
	tasks: (practiceId: number) =>
		queryOptions({
			queryKey: ["practices", "evaluation", "tasks", practiceId],
			queryFn: () => PracticeEvaluationAPI.getEvaluationTasks(practiceId),
		}),

	form: (practiceId: number, params: GetEvaluationFormParams) =>
		queryOptions({
			queryKey: ["practices", "evaluation", "form", practiceId, params],
			queryFn: () =>
				PracticeEvaluationAPI.getEvaluationForm(practiceId, params),
		}),

  forms: (practiceId: number) =>
    queryOptions({
      queryKey: ["practices", "evaluation", "forms", practiceId],
      queryFn: () => PracticeEvaluationAPI.getEvaluationForms(practiceId),
    }),
};

export const practiceEvaluationMutationOptions = {
	submit: () => ({
		mutationFn: ({
			practiceId,
			data,
		}: {
			practiceId: number;
			data: EvaluationSubmission;
		}) => PracticeEvaluationAPI.submitEvaluation(practiceId, data),
	}),
};
