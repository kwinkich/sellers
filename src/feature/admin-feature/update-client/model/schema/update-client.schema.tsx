import { z } from "zod";

export const updateClientSchema = z.object({
	level: z.enum(["LEVEL_3", "LEVEL_4"], {
		error: "Выберите уровень компании",
	}),
	telegramUsername: z
		.string()
		.min(1, "Telegram username обязателен")
		.regex(/^@?[a-zA-Z0-9_]{5,}$/, "Некорректный формат Telegram username"),
	companyName: z
		.string()
		.min(1, "Название компании обязательно")
		.min(2, "Название компании должно содержать минимум 2 символа"),
	inn: z
		.string()
		.min(1, "ИНН обязателен")
		.regex(/^\d{10}$/, "ИНН должен содержать 10 цифр"),
	licenseCount: z
		.number()
		.min(0, "Количество лицензий не может быть отрицательным")
		.int("Количество лицензий должно быть целым числом"),
	licenseExpiresAt: z.date().optional(),
});

export type UpdateClientFormData = z.infer<typeof updateClientSchema>;
