import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { practicesQueryOptions } from "@/entities/practices";

const formatDate = (iso?: string) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const PracticeReplayPage = () => {
  const { practiceId } = useParams<{ practiceId: string }>();
  const id = Number(practiceId);

  const { data, isLoading, error } = useQuery({
    ...practicesQueryOptions.byId(id),
    enabled: Number.isFinite(id) && id > 0,
  });

  const practice = data?.data;

  return (
    <div className="bg-second-bg min-h-dvh">
      <div className="px-3 py-3">
        <h1 className="text-white text-xl font-semibold">Повтор практики</h1>
      </div>

      <div className="px-3 py-2">
        {isLoading ? (
          <div className="text-sm text-base-gray">Загрузка…</div>
        ) : error || !practice ? (
          <div className="text-sm text-destructive">Не удалось загрузить практику</div>
        ) : (
          <div className="space-y-3">
            <div className="bg-base-bg rounded-2xl p-4">
              <div className="text-xs text-base-gray">Название</div>
              <div className="text-white font-medium">{practice.title}</div>
              <div className="mt-3 text-xs text-base-gray">Дата практики</div>
              <div className="text-white font-medium">{formatDate(practice.startAt)}</div>
            </div>

            <div className="bg-base-bg rounded-2xl p-2">
              {practice.recordingUrl ? (
                <video src={practice.recordingUrl} controls className="w-full rounded-xl" />
              ) : (
                <div className="p-6 text-center text-sm text-base-gray">Запись недоступна</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeReplayPage;


