import { create } from "zustand";

import type { PracticeCard } from "@/entities/practices";

interface TermsState {
  isOpen: boolean;
  role?: "MODERATOR";
  practice?: PracticeCard;
  open: (role?: "MODERATOR", practice?: PracticeCard) => void;
  close: () => void;
}

export const useTermsStore = create<TermsState>((set) => ({
  isOpen: false,
  role: undefined,
  practice: undefined,
  open: (role, practice) => set({ isOpen: true, role, practice }),
  close: () => set({ isOpen: false, role: undefined, practice: undefined }),
}));


