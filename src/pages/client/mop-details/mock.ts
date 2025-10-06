// mock-mop-details.ts
import type { MopPractice, MopProfileInfo, MopSkill } from "@/entities";

export const MOCK_MOP_PROFILE: MopProfileInfo = {
	id: 1,
	displayName: "Всилий Борисов",
	repScore: 85,
	companyName: "ООО Ромашка",
	currentSlotId: 432123132,
	currentSlotStatus: "ACTIVE",
	currentSlotExpiresAt: "2024-12-31T23:59:59Z",
	learningProgress: 72,
};

export const MOCK_MOP_SKILLS: MopSkill[] = [
	{
		id: 1,
		name: "Переговоры",
		status: "FULL",
	},
	{
		id: 2,
		name: "Продажи",
		status: "FULL",
	},
	{
		id: 3,
		name: "Презентация",
		status: "HALF",
	},
	{
		id: 4,
		name: "Аналитика",
		status: "HALF",
	},
	{
		id: 5,
		name: "Лидерство",
		status: "NONE",
	},
	{
		id: 6,
		name: "Командная работа",
		status: "NONE",
	},
];

export const MOCK_MOP_PRACTICES: MopPractice[] = [
	{
		id: 1,
		practiceType: "ROLEPLAY",
		title: "Сложные переговоры с клиентом",
		startAt: "2024-03-25T14:00:00Z",
		endAt: "2024-03-25T15:30:00Z",
		status: "COMPLETED",
		myRole: "SELLER",
	},
	{
		id: 2,
		practiceType: "SIMULATION",
		title: "Работа с возражениями",
		startAt: "2024-03-28T10:00:00Z",
		endAt: "2024-03-28T11:30:00Z",
		status: "SCHEDULED",
		myRole: "BUYER",
	},
	{
		id: 3,
		practiceType: "CASE",
		title: "Кейс: Запуск нового продукта",
		startAt: "2024-04-01T09:00:00Z",
		endAt: "2024-04-01T12:00:00Z",
		status: "SCHEDULED",
		myRole: "OBSERVER",
	},
];
