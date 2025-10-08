import { Button } from "@/components/ui/button";

interface EvaluationFooterProps {
  isLastTab: boolean;
  canFinish: boolean; // only used on last tab
  onNext: () => void;
  onFinish: () => void;
}

export const EvaluationFooter = ({ isLastTab, canFinish, onNext, onFinish }: EvaluationFooterProps) => {
  const label = isLastTab ? "Завершить" : "Далее";
  const disabled = isLastTab ? !canFinish : false; // "Далее" is always enabled

  const handleClick = () => {
    if (isLastTab) onFinish();
    else onNext();
  };

  return (
    <div className="bg-white px-4 py-2 pb-[env(safe-area-inset-bottom)] ">
      <Button 
        className={`w-full h-12 ${isLastTab ? "bg-emerald-600 hover:bg-emerald-700" : "bg-emerald-500 hover:bg-emerald-600"} text-white`}
        disabled={disabled}
        onClick={handleClick}
      >
        {label}
      </Button>
    </div>
  );
};
