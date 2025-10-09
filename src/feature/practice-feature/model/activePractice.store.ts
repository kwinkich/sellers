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
  show: (practice) => {
    console.log("ActivePracticeStore.show called with practice:", practice);
    set({ blocking: true, practice });
  },
  hide: () => {
    console.log("ActivePracticeStore.hide called");
    set({ blocking: false, practice: undefined });
  },
}));


