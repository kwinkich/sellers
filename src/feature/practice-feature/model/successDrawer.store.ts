import { create } from "zustand";
import type { PracticeCard } from "@/entities/practices";

interface SuccessState {
  isOpen: boolean;
  practice?: PracticeCard;
  open: (practice: PracticeCard) => void;
  close: () => void;
}

export const useSuccessDrawerStore = create<SuccessState>((set) => ({
  isOpen: false,
  practice: undefined,
  open: (practice) => set({ isOpen: true, practice }),
  close: () => set({ isOpen: false, practice: undefined }),
}));


