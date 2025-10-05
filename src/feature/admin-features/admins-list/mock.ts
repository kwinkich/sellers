// mock-admins.ts
import type { Admin } from "@/entities";

export const MOCK_ADMINS: Admin[] = [
	{
		id: 1,
		telegramUsername: "@admin1",
		displayName: "Admin One",
		role: "ADMIN",
		createdAt: "2024-01-15T10:00:00Z",
		updatedAt: "2024-01-15T10:00:00Z",
	},
	{
		id: 2,
		telegramUsername: "@manager_ivan",
		displayName: "Ivan Manager",
		role: "ADMIN",
		createdAt: "2024-01-20T14:30:00Z",
		updatedAt: "2024-01-20T14:30:00Z",
	},
	{
		id: 3,
		telegramUsername: "@supervisor_alex",
		displayName: "Alex Supervisor",
		role: "ADMIN",
		createdAt: "2024-02-01T09:15:00Z",
		updatedAt: "2024-02-01T09:15:00Z",
	},
];
