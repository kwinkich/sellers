import { API, type GApiResponse } from "@/shared";
import { queryOptions } from "@tanstack/react-query";
import type {
	CreateQuizRequest,
	Quiz,
	QuizResult,
	QuizSubmission,
	UpdateQuizRequest,
	UserQuiz,
} from "../types/quiz.types";

export const QuizzesAPI = {
	createQuiz: (quizData: CreateQuizRequest) => {
		return API.post("quizzes", { json: quizData }).json<GApiResponse<Quiz>>();
	},

	getQuizById: (id: number) => {
		return API.get(`quizzes/${id}/`).json<GApiResponse<UserQuiz>>();
	},

	updateQuiz: (id: number, quizData: UpdateQuizRequest) => {
		return API.put(`quizzes/${id}`, { json: quizData }).json<
			GApiResponse<Quiz>
		>();
	},

	deleteQuiz: (id: number) => {
		return API.delete(`quizzes/${id}`).json<GApiResponse<void>>();
	},

	submitQuiz: (id: number, submission: QuizSubmission) => {
		return API.post(`quizzes/${id}/submit`, { json: submission }).json<
			GApiResponse<QuizResult>
		>();
	},
};

export const quizzesQueryOptions = {
	byId: (id: number) =>
		queryOptions({
			queryKey: ["quizzes", "detail", id],
			queryFn: () => QuizzesAPI.getQuizById(id),
		}),
};

export const quizzesMutationOptions = {
	create: () => ({
		mutationFn: QuizzesAPI.createQuiz,
	}),

	update: () => ({
		mutationFn: ({ id, data }: { id: number; data: UpdateQuizRequest }) =>
			QuizzesAPI.updateQuiz(id, data),
	}),

	delete: () => ({
		mutationFn: QuizzesAPI.deleteQuiz,
	}),

	submit: () => ({
		mutationFn: ({ id, data }: { id: number; data: QuizSubmission }) =>
			QuizzesAPI.submitQuiz(id, data),
	}),
};
