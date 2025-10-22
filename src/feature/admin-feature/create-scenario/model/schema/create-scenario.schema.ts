import { z } from "zod";

export const createScenarioSchema = z.object({
  title: z
    .string()
    .min(1, "Название формы обязательно")
    .min(3, "Название формы должно содержать минимум 3 символа"),
});

export type CreateScenarioFormData = z.infer<typeof createScenarioSchema>;
