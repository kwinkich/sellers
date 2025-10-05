import { z } from "zod";

export const createClientSchema = z.object({
	level: z.enum(["LEVEL_3", "LEVEL_4"]),
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
		.min(1, "Количество лицензий должно быть не менее 1")
		.int("Количество лицензий должно быть целым числом"),
	licenseExpiresAt: z.date({
		error: "Выберите дату окончания лицензии",
	}),
});

export type CreateClientFormData = z.infer<typeof createClientSchema>;
