import { create } from "zustand";

interface UploadRecordingState {
  isOpen: boolean;
  practiceId?: number;
  show: (practiceId: number) => void;
  hide: () => void;
}

export const useUploadRecordingStore = create<UploadRecordingState>((set) => ({
  isOpen: false,
  practiceId: undefined,
  show: (practiceId) => set({ isOpen: true, practiceId }),
  hide: () => set({ isOpen: false, practiceId: undefined }),
}));

