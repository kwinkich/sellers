import { create } from "zustand";
import type { PracticeCard } from "@/entities/practices";

interface PracticeJoinState {
  isOpen: boolean;
  practice?: PracticeCard;
  open: (practice: PracticeCard) => void;
  close: () => void;
  setPractice: (practice: PracticeCard | undefined) => void;
}

export const usePracticeJoinStore = create<PracticeJoinState>((set) => ({
  isOpen: false,
  practice: undefined,
  open: (practice) => set({ isOpen: true, practice }),
  close: () => set({ isOpen: false, practice: undefined }),
  setPractice: (practice) => set({ practice }),
}));
