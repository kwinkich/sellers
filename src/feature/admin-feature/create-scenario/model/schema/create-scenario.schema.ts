import { z } from "zod";

export const createScenarioSchema = z.object({
	title: z
		.string()
		.min(1, "Название формы обязательно")
		.min(3, "Название формы должно содержать минимум 3 символа"),
	// Multiple case selection
	caseIds: z.array(z.number().int().positive()).optional(),
});

export type CreateScenarioFormData = z.infer<typeof createScenarioSchema>;


