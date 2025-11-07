import { create } from "zustand";

import type { PracticeCard } from "@/entities/practices";

interface TermsState {
  isOpen: boolean;
  role?: "MODERATOR";
  practice?: PracticeCard;
  showSuccessOnConfirm: boolean;
  open: (
    role?: "MODERATOR",
    payload?: { practice?: PracticeCard; showSuccessOnConfirm?: boolean }
  ) => void;
  close: () => void;
}

export const useTermsStore = create<TermsState>((set) => ({
  isOpen: false,
  role: undefined,
  practice: undefined,
  showSuccessOnConfirm: false,
  open: (role, payload) =>
    set({
      isOpen: true,
      role,
      practice: payload?.practice,
      showSuccessOnConfirm: payload?.showSuccessOnConfirm ?? false,
    }),
  close: () =>
    set({
      isOpen: false,
      role: undefined,
      practice: undefined,
      showSuccessOnConfirm: false,
    }),
}));


