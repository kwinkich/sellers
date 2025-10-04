import { PRACTICE_TYPE_LABELS, type PracticeType } from "../types";

export const getPracticeTypeLabel = (type: PracticeType): string => {
	return PRACTICE_TYPE_LABELS[type];
};
