// mocks/courseMocks.ts
import type { Course, Lesson, Module, Quiz } from "@/entities";

// MOCK клиенты для выбора
export const MOCK_CLIENTS = [
	{ id: 1, name: 'ООО "Рога и копыта"' },
	{ id: 2, name: "ИП Иванов И.И." },
	{ id: 3, name: 'АО "ТехноПрофи"' },
	{ id: 4, name: 'ООО "СтройГарант"' },
	{ id: 5, name: 'ЗАО "Инновационные решения"' },
];

// MOCK курсы
export const MOCK_COURSES: Course[] = [
	{
		id: 1,
		title: "Основы React разработки",
		shortDesc: "Изучите основы React, компоненты, состояние и жизненный цикл",
		accessScope: "ALL",
		isIntro: true,
		createdAt: "2024-01-15T10:00:00Z",
		updatedAt: "2024-01-15T10:00:00Z",
	},
	{
		id: 2,
		title: "Продвинутый JavaScript",
		shortDesc: "Глубокое погружение в современный JavaScript и ES6+",
		accessScope: "SELECTED",
		isIntro: false,
		createdAt: "2024-01-10T14:30:00Z",
		updatedAt: "2024-01-12T09:15:00Z",
	},
];

// MOCK модули
export const MOCK_MODULES: Module[] = [
	{
		id: 1,
		courseId: 1,
		title: "Введение в React",
		shortDesc: "Основные концепции и настройка окружения",
		testVariant: "QUIZ",
		quizId: 1,
		lessonsCount: 2,
		completedLessons: 0,
		progressPercent: 0,
		quizQuestionsCount: 3,
		unlockRule: "ALL",
		orderIndex: 1,
		createdAt: "2024-01-15T10:00:00Z",
		updatedAt: "2024-01-15T10:00:00Z",
	},
	{
		id: 2,
		courseId: 1,
		title: "Компоненты и Props",
		shortDesc: "Создание и использование компонентов",
		testVariant: "QUIZ",
		quizId: 2,
		unlockRule: "PREVIOUS",
		orderIndex: 2,
		createdAt: "2024-01-15T11:00:00Z",
		lessonsCount: 2,
		completedLessons: 0,
		progressPercent: 0,
		quizQuestionsCount: 3,
		updatedAt: "2024-01-15T11:00:00Z",
	},
	{
		id: 3,
		courseId: 2,
		title: "ES6+ Функции",
		shortDesc: "Стрелочные функции, деструктуризация и многое другое",
		testVariant: "NONE",
		quizId: 0,
		unlockRule: "ALL",
		lessonsCount: 2,
		completedLessons: 0,
		progressPercent: 0,
		quizQuestionsCount: 3,
		orderIndex: 1,
		createdAt: "2024-01-10T14:30:00Z",
		updatedAt: "2024-01-10T14:30:00Z",
	},
];

// MOCK уроки
export const MOCK_LESSONS: Lesson[] = [
	{
		id: 1,
		moduleId: 1,
		quizId: 1,
		title: "Что такое React?",
		shortDesc: "Основные понятия и философия React",
		orderIndex: 1,
		contentBlocks: [
			{
				orderIndex: 1,
				type: "TEXT",
				textContent:
					"React - это JavaScript-библиотека для создания пользовательских интерфейсов. Она была разработана в Facebook и сейчас поддерживается сообществом разработчиков по всему миру.",
				storageObjectId: 0,
			},
			{
				orderIndex: 2,
				type: "TEXT",
				textContent:
					"Основные преимущества React: компонентный подход, виртуальный DOM, однонаправленный поток данных и богатая экосистема.",
				storageObjectId: 0,
			},
		],
	},
	{
		id: 2,
		moduleId: 1,
		quizId: 0,
		title: "Настройка окружения",
		shortDesc: "Установка и настройка React проекта",
		orderIndex: 2,
		contentBlocks: [
			{
				orderIndex: 1,
				type: "TEXT",
				textContent:
					"Для начала работы с React нам понадобится Node.js и менеджер пакетов npm или yarn.",
				storageObjectId: 0,
			},
			{
				orderIndex: 2,
				type: "IMAGE",
				textContent: "Структура папок React проекта",
				storageObjectId: 101,
			},
		],
	},
	{
		id: 3,
		moduleId: 2,
		quizId: 2,
		title: "Функциональные компоненты",
		shortDesc: "Создание и использование функциональных компонентов",
		orderIndex: 1,
		contentBlocks: [
			{
				orderIndex: 1,
				type: "TEXT",
				textContent:
					"Функциональные компоненты - это самый простой способ объявления компонентов в React. Они представляют собой обычные JavaScript функции.",
				storageObjectId: 0,
			},
			{
				orderIndex: 2,
				type: "VIDEO",
				textContent: "Видеоурок по созданию первого компонента",
				storageObjectId: 102,
			},
		],
	},
];

// MOCK тесты
export const MOCK_QUIZZES: Quiz[] = [
	{
		id: 1,
		passThresholdPercent: 70,
		questions: [
			{
				id: 1,
				text: "Что такое React?",
				order: 1,
				options: [
					{ id: 1, text: "Фреймворк для backend разработки", isCorrect: false },
					{
						id: 2,
						text: "JavaScript библиотека для создания UI",
						isCorrect: true,
					},
					{ id: 3, text: "База данных", isCorrect: false },
					{ id: 4, text: "Язык программирования", isCorrect: false },
				],
			},
			{
				id: 2,
				text: "Что такое JSX?",
				order: 2,
				options: [
					{ id: 5, text: "Расширение синтаксиса JavaScript", isCorrect: true },
					{ id: 6, text: "Отдельный язык программирования", isCorrect: false },
					{ id: 7, text: "Тип базы данных", isCorrect: false },
					{ id: 8, text: "CSS фреймворк", isCorrect: false },
				],
			},
			{
				id: 3,
				text: "Какой хук используется для управления состоянием?",
				order: 3,
				options: [
					{ id: 9, text: "useEffect", isCorrect: false },
					{ id: 10, text: "useState", isCorrect: true },
					{ id: 11, text: "useContext", isCorrect: false },
					{ id: 12, text: "useReducer", isCorrect: false },
				],
			},
		],
	},
	{
		id: 2,
		passThresholdPercent: 80,
		questions: [
			{
				id: 4,
				text: "Что такое Props в React?",
				order: 1,
				options: [
					{ id: 13, text: "Встроенные свойства компонента", isCorrect: false },
					{
						id: 14,
						text: "Данные, передаваемые от родителя к дочернему компоненту",
						isCorrect: true,
					},
					{
						id: 15,
						text: "Глобальные переменные приложения",
						isCorrect: false,
					},
					{ id: 16, text: "Методы жизненного цикла", isCorrect: false },
				],
			},
			{
				id: 5,
				text: "Можно ли изменять Props внутри компонента?",
				order: 2,
				options: [
					{ id: 17, text: "Да, всегда", isCorrect: false },
					{
						id: 18,
						text: "Нет, Props доступны только для чтения",
						isCorrect: true,
					},
					{ id: 19, text: "Только в классовых компонентах", isCorrect: false },
					{
						id: 20,
						text: "Только с использованием специальных хуков",
						isCorrect: false,
					},
				],
			},
		],
	},
];

// MOCK UserQuiz для прохождения тестов
export const MOCK_USER_QUIZZES = {
	1: {
		quizId: 1,
		attemptId: 123,
		passThresholdPercent: 70,
		questions: MOCK_QUIZZES[0].questions,
	},
	2: {
		quizId: 2,
		attemptId: 124,
		passThresholdPercent: 80,
		questions: MOCK_QUIZZES[1].questions,
	},
};
