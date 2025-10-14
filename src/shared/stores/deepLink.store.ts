import { create } from "zustand";
import type { DeepLinkTarget } from "../lib/startParam";

type DeepLinkState = {
  pending: DeepLinkTarget | null;
  setPending: (t: DeepLinkTarget | null) => void;
};

export const useDeepLinkStore = create<DeepLinkState>((set) => ({
  pending: null,
  setPending: (t) => set({ pending: t }),
}));
