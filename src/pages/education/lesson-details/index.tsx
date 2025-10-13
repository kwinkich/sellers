import { Button } from "@/components/ui/button";
import { lessonsQueryOptions, type ContentBlock } from "@/entities";
import { ArrowIcon, HeadText } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export const LessonDetailsPage = () => {
	const { lessonId } = useParams<{ lessonId: string }>();
	const navigate = useNavigate();

	const {
		data: lessonResponse,
		isLoading,
		error,
	} = useQuery(lessonsQueryOptions.byId(Number(lessonId)));

	if (isLoading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (error || !lessonResponse) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="text-center">
					<h2 className="text-lg font-semibold mb-2">Ошибка загрузки урока</h2>
					<p className="text-gray-500">{error?.message || "Урок не найден"}</p>
				</div>
			</div>
		);
	}

	const lesson = lessonResponse.data;

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
		<div className="min-h-full pb-24">
			<div className="w-full bg-base-bg rounded-b-3xl px-3 py-4 mb-6">
				<HeadText
					aligin="center"
					head={lesson.title}
					label={`Урок ${lesson.orderIndex}`}
				/>
			</div>

			{/* Контентные блоки */}
			<div className="px-2">
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
				<Button
					className="w-full"
					size="sm"
					onClick={() => navigate(`/mop/education/quizzes/${lesson.quizId}`)}
				>
					Пройти завершающий тест
					<ArrowIcon />
				</Button>
			</div>
		</div>
	);
};
