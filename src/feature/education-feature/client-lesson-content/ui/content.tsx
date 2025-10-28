import { Box } from "@/shared";
import type { Lesson } from "@/entities";

interface ClientLessonContentProps {
  lesson: Lesson;
}

export const ClientLessonContent = ({ lesson }: ClientLessonContentProps) => {
  return (
    <div className="px-2">
      <Box variant="dark" className="p-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Содержание урока
            </h3>
            <p className="text-sm text-gray-300">
              {lesson.shortDesc || "Описание отсутствует"}
            </p>
          </div>

          {lesson.contentBlocks && lesson.contentBlocks.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-white mb-3">
                Блоки контента:
              </h4>
              <div className="space-y-3">
                {lesson.contentBlocks.map((block, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-800/50 rounded-lg border border-gray-600"
                  >
                    <div className="text-sm text-gray-300">
                      <strong>Тип:</strong> {block.type}
                    </div>
                    {block.textContent && (
                      <div className="text-sm text-gray-300 mt-2">
                        <strong>Содержание:</strong> {block.textContent}
                      </div>
                    )}
                    {block.storageObject && (
                      <div className="text-sm text-gray-300 mt-2">
                        <strong>Файл:</strong> {block.storageObject.objectKey}
                        <br />
                        <span className="text-xs text-gray-400">
                          Тип: {block.storageObject.contentType} | Размер:{" "}
                          {Math.round(block.storageObject.sizeBytes / 1024)}KB
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Box>
    </div>
  );
};
