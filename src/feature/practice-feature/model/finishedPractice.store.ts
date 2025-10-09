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
  show: (practiceId) => set({ isOpen: true, practiceId }),
  hide: () => set({ isOpen: false, practiceId: undefined }),
}));

