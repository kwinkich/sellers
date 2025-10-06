import { Button } from "@/components/ui/button";
import {
	lessonsQueryOptions,
	type ContentBlock,
	type Lesson,
} from "@/entities";
import { ArrowIcon, HeadText } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useParams } from "react-router-dom";

const MOCK_LESSON: Lesson = {
	id: 1,
	moduleId: 1,
	quizId: 1,
	title: "Введение в React",
	shortDesc: "Основные концепции и принципы React",
	orderIndex: 1,
	contentBlocks: [
		{
			orderIndex: 1,
			type: "TEXT",
			textContent:
				"React - это JavaScript-библиотека для создания пользовательских интерфейсов.",
			storageObjectId: 0,
		},
		{
			orderIndex: 2,
			type: "TEXT",
			textContent:
				"Основные концепции: компоненты, props, state, жизненный цикл.",
			storageObjectId: 0,
		},
		{
			orderIndex: 3,
			type: "IMAGE",
			textContent: "Структура компонента React",
			storageObjectId: 1,
		},
		{
			orderIndex: 4,
			type: "VIDEO",
			textContent: "Видео о создании первого компонента",
			storageObjectId: 2,
		},
	],
};

const USE_MOCK_DATA = true;

export const LessonDetailsPage = () => {
	const { id } = useParams<{ id: string }>();

	const {
		data: lessonResponse,
		isLoading,
		error,
	} = useQuery(lessonsQueryOptions.byId(parseInt(id!)));

	const lesson = USE_MOCK_DATA ? MOCK_LESSON : lessonResponse?.data;

	if (!USE_MOCK_DATA && isLoading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (!USE_MOCK_DATA && (error || !lessonResponse)) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="text-center">
					<h2 className="text-lg font-semibold mb-2">Ошибка загрузки урока</h2>
					<p className="text-gray-500">
						{(error as any)?.message || "Урок не найден"}
					</p>
				</div>
			</div>
		);
	}

	if (!lesson) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="text-center">
					<h2 className="text-lg font-semibold mb-2">Урок не найден</h2>
					<p className="text-gray-500">Попробуйте обновить страницу</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-full pb-24  ">
			<div className="w-full bg-base-bg rounded-b-3xl px-3 py-4 mb-6">
				<HeadText aligin="center" head="Название урока" label="Урок 1" />
			</div>

			{/* Контентные блоки */}
			<div className=" px-2">
				{lesson.contentBlocks.map((block: ContentBlock) => (
					<div key={block.orderIndex} className="py-4 border-b">
						{block.type === "TEXT" && (
							<div className="prose max-w-none">
								<p className="text-sm text-gray-700 leading-relaxed">
									{block.textContent}
								</p>
							</div>
						)}

						{block.type === "IMAGE" && (
							<div>
								<p className="text-gray-600 mb-3 italic">{block.textContent}</p>
								<div className="bg-gray-100 rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
									<p className="text-gray-500">
										[Изображение: {block.storageObjectId}]
									</p>
									<p className="text-sm text-gray-400 mt-2">
										Здесь будет отображаться изображение из хранилища
									</p>
								</div>
							</div>
						)}

						{block.type === "VIDEO" && (
							<div>
								<p className="text-gray-600 mb-3 italic">{block.textContent}</p>
								<div className="bg-gray-100 rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
									<p className="text-gray-500">
										[Видео: {block.storageObjectId}]
									</p>
									<p className="text-sm text-gray-400 mt-2">
										Здесь будет отображаться видео плеер
									</p>
								</div>
							</div>
						)}

						{block.type === "AUDIO" && (
							<div>
								<p className="text-gray-600 mb-3 italic">{block.textContent}</p>
								<div className="bg-gray-100 rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
									<p className="text-gray-500">
										[Аудио: {block.storageObjectId}]
									</p>
									<p className="text-sm text-gray-400 mt-2">
										Здесь будет отображаться аудио плеер
									</p>
								</div>
							</div>
						)}

						{block.type === "FILE" && (
							<div>
								<p className="text-gray-600 mb-3 italic">{block.textContent}</p>
								<div className="bg-gray-100 rounded-lg p-4 text-center border-2 border-dashed border-gray-300">
									<p className="text-gray-500">
										[Файл: {block.storageObjectId}]
									</p>
									<p className="text-sm text-gray-400 mt-1">
										Здесь будет отображаться скачивание файла
									</p>
								</div>
							</div>
						)}
					</div>
				))}
			</div>

			<div className="w-full px-2">
				<Button className="w-full" size="sm">
					Пройти завершающий текст
					<ArrowIcon />
				</Button>
			</div>

			{/* Дебаг информация (можно убрать в продакшене) */}
			{USE_MOCK_DATA && (
				<div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg mx-2">
					<p className="text-sm text-yellow-800">
						<strong>Режим разработки:</strong> Используются мок-данные. Для
						перехода на реальные данные установите USE_MOCK_DATA = false
					</p>
				</div>
			)}
		</div>
	);
};
