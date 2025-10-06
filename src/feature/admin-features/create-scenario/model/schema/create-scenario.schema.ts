import { z } from "zod";

export const scenarioTypeOptions = [
	{ value: "WITH_CASE", label: "С кейсом" },
	{ value: "WITHOUT_CASE", label: "Без кейса" },
	{ value: "MINI", label: "Мини-игра" },
] as const;

export type ScenarioType = typeof scenarioTypeOptions[number]["value"];

export const createScenarioSchema = z.object({
	title: z
		.string()
		.min(1, "Название формы обязательно")
		.min(3, "Название формы должно содержать минимум 3 символа"),
	type: z.enum(["WITH_CASE", "WITHOUT_CASE", "MINI"], {
		error: "Выберите тип сценария",
	}),
	caseId: z
		.number()
		.int()
		.positive()
		.optional(),
});

export type CreateScenarioFormData = z.infer<typeof createScenarioSchema>;


