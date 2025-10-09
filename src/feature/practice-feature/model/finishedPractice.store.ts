import { create } from "zustand";

interface FinishedPracticeState {
  isOpen: boolean;
  practiceId?: number;
  show: (practiceId: number) => void;
  hide: () => void;
}

export const useFinishedPracticeStore = create<FinishedPracticeState>((set) => ({
  isOpen: false,
  practiceId: undefined,
  show: (practiceId) => {
    console.log("FinishedPracticeStore.show called with practiceId:", practiceId);
    set({ isOpen: true, practiceId });
  },
  hide: () => {
    console.log("FinishedPracticeStore.hide called");
    set({ isOpen: false, practiceId: undefined });
  },
}));

