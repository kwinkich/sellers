export type PracticeType = "WITH_CASE" | "WITHOUT_CASE" | "MINI";

export const PRACTICE_TYPE_LABELS: Record<PracticeType, string> = {
	WITH_CASE: "Игра с кейсом",
	WITHOUT_CASE: "Игра без кейса",
	MINI: "Мини-игра",
};
