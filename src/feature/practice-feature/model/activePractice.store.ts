import { create } from "zustand";
import type { PracticeCard } from "@/entities/practices";

interface ActivePracticeState {
  blocking: boolean;
  practice?: PracticeCard;
  show: (practice: PracticeCard) => void;
  hide: () => void;
}

export const useActivePracticeStore = create<ActivePracticeState>((set) => ({
  blocking: false,
  practice: undefined,
  show: (practice) => set({ blocking: true, practice }),
  hide: () => set({ blocking: false, practice: undefined }),
}));


