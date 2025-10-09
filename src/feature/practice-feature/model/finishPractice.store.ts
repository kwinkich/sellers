import { create } from "zustand";

interface FinishPracticeState {
  isOpen: boolean;
  practiceId: number | null;
  show: (practiceId: number) => void;
  hide: () => void;
}

export const useFinishPracticeStore = create<FinishPracticeState>((set) => ({
  isOpen: false,
  practiceId: null,
  show: (practiceId: number) => {
    console.log("FinishPracticeStore.show called with practiceId:", practiceId);
    set({ isOpen: true, practiceId });
  },
  hide: () => {
    console.log("FinishPracticeStore.hide called");
    set({ isOpen: false, practiceId: null });
  },
}));
