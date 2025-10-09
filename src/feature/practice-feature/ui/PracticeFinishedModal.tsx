import { BlockingModal } from "@/components/ui/blocking-modal";
import { Button } from "@/components/ui/button";
import { SuccessIcon } from "@/shared";
import { useFinishedPracticeStore } from "../model/finishedPractice.store";
import { useNavigate } from "react-router-dom";

export const PracticeFinishedModal = () => {
  const navigate = useNavigate();
  const { isOpen, practiceId, hide } = useFinishedPracticeStore();

  if (!practiceId) return null;

  const handleEvaluate = () => {
    hide();
    navigate(`/evaluation/evaluate/${practiceId}`);
  };

  return (
    <BlockingModal open={isOpen}>
      <div className="flex flex-col items-center text-center py-6">
        <SuccessIcon size={64} fill="#06935F" />
        <h2 className="text-xl font-semibold mt-4 mb-2">Практика завершена</h2>
        <p className="text-sm text-gray-600 mb-6">
          Теперь вы можете перейти к оценке участников
        </p>
        <Button className="w-full h-12" onClick={handleEvaluate}>
          Перейти к оценке
        </Button>
      </div>
    </BlockingModal>
  );
};

