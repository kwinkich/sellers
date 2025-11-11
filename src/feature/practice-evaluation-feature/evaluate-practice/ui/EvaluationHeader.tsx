import { Trophy } from "lucide-react";

export const EvaluationHeader = () => {
  return (
    <div className="bg-white px-2 py-4 text-center">
      <Trophy className="h-12 w-12 text-green-500 mx-auto " />
      <h1 className="text-2xl font-bold text-black ">Игра закончена!</h1>
      <p className="text-gray-500">Давайте оценим участников</p>
    </div>
  );
};
