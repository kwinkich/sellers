import { Trophy } from "lucide-react";

export const ReportHeader = () => {
  return (
    <div className="bg-white px-4 py-6 text-center">
      <Trophy className="h-12 w-12 text-green-500 mx-auto mb-3" />
      <h1 className="text-2xl font-bold text-black mb-2">Итоги игры</h1>
      <p className="text-gray-500">Оценки участников</p>
    </div>
  );
};


