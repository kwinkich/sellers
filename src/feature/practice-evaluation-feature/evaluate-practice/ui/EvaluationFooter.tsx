import { Button } from "@/components/ui/button";

export const EvaluationFooter = () => {
  return (
    <div className="bg-white px-4 py-2 pb-[env(safe-area-inset-bottom)] ">
      <Button 
        className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white"
        disabled={false} // TODO: Add form validation
      >
        Далее
      </Button>
    </div>
  );
};
