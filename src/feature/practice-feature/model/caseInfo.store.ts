import { create } from "zustand";
import type { PracticeCard } from "@/entities/practices";

interface CaseInfoState {
  isOpen: boolean;
  practice?: PracticeCard;
  open: (practice: PracticeCard) => void;
  close: () => void;
}

export const useCaseInfoStore = create<CaseInfoState>((set) => ({
  isOpen: false,
  practice: undefined,
  open: (practice) => set({ isOpen: true, practice }),
  close: () => set({ isOpen: false, practice: undefined }),
}));


