import { BlockingModal } from "@/components/ui/blocking-modal";
import { useActivePracticeStore } from "../model/activePractice.store";
import { useNavigate } from "react-router-dom";

export const PracticeActiveModal = () => {
  const navigate = useNavigate();
  const { blocking, practice } = useActivePracticeStore();

  if (!practice) return null;

  return (
    <BlockingModal
      open={blocking}
      title={practice.title}
      description={"Практика началась. Присоединиться сейчас?"}
      actionLabel="Перейти к практике"
      onAction={() => {
        navigate(`/practice`);
      }}
    />
  );
};


