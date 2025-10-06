// mock-licenses.ts
import type { LicenseInfo } from "@/entities";

export const MOCK_LICENSES: LicenseInfo[] = [
	{
		id: 1,
		status: "ACTIVE",
		durationSeconds: 2592000, // 30 дней
		daysLeft: 15,
	},
	{
		id: 2,
		status: "ACTIVE",
		durationSeconds: 2592000,
		daysLeft: 8,
	},
	{
		id: 3,
		status: "NOT_ACTIVE",
		durationSeconds: 2592000,
		daysLeft: 30,
	},
	{
		id: 4,
		status: "EXPIRED",
		durationSeconds: 2592000,
		daysLeft: 0,
	},
	{
		id: 5,
		status: "ACTIVE",
		durationSeconds: 5184000, // 60 дней
		daysLeft: 45,
	},
	{
		id: 6,
		status: "NOT_ACTIVE",
		durationSeconds: 2592000,
		daysLeft: 30,
	},
];
