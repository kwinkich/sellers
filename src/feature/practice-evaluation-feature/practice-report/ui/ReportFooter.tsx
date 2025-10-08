interface ReportFooterProps {
  isLastTab: boolean;
  loading?: boolean;
  onNext: () => void;
  onFinish: () => void;
}

export const ReportFooter = ({ isLastTab, loading, onNext, onFinish }: ReportFooterProps) => {
  const label = isLastTab ? (loading ? "Завершение..." : "Завершить") : "Далее";
  const handleClick = () => {
    if (isLastTab) onFinish();
    else onNext();
  };
  return (
    <div className="bg-white px-4 py-2 pb-[env(safe-area-inset-bottom)] ">
      <button
        className={`w-full h-12 rounded-md text-white ${isLastTab ? "bg-emerald-600" : "bg-emerald-500"}`}
        onClick={handleClick}
        disabled={!!loading}
      >
        {label}
      </button>
    </div>
  );
};


