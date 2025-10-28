export interface QuizOption {
  id?: number;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id?: number;
  text: string;
  order: number;
  options: QuizOption[];
}

export interface QuizDataQuestion {
  id: number;
  text: string;
  order: number;
  correctAnswerId: number;
  options: QuizOption[];
}

export interface Quiz {
  id: number;
  passThresholdPercent: number;
  questions: QuizQuestion[];
}

export interface UserQuiz {
  quizId: number;
  attemptId: number;
  passThresholdPercent: number;
  questions: QuizQuestion[];
}

export interface QuizAnswer {
  questionId: number;
  optionId: number;
}

export interface QuizSubmission {
  answers: QuizAnswer[];
}

export interface QuizResult {
  scorePercent: number;
  passed: boolean;
  nextAttempt?: {
    attemptId: number;
  };
}

export interface CreateQuizRequest {
  passThresholdPercent: number;
  questions: QuizQuestion[];
}

export interface UpdateQuizRequest {
  passThresholdPercent?: number;
  questions?: QuizQuestion[];
}

export interface QuizData {
  id: number;
  passThresholdPercent: number;
  questions: QuizDataQuestion[];
}
