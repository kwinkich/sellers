import { create } from "zustand";

interface CreatePracticeState {
  scenarioId?: number;
  scenarioTitle?: string;
  practiceType?: string;
  caseId?: number;
  caseTitle?: string;
  skillIds: number[];
  skillNames: string[];
  startAt?: string; // ISO string
  zoomLink?: string;
  initialRole?: "SELLER" | "BUYER" | "MODERATOR";
  close: () => void;
  setScenario: (id: number | undefined, title?: string) => void;
  setPracticeType: (type?: string) => void;
  setCase: (id: number | undefined, title?: string) => void;
  setSkills: (ids: number[]) => void;
  setSkillNames: (names: string[]) => void;
  setStartAt: (iso?: string) => void;
  setZoom: (url: string) => void;
  setRole: (r: "SELLER" | "BUYER" | "MODERATOR" | undefined) => void;
}

export const useCreatePracticeStore = create<CreatePracticeState>((set) => ({
  scenarioId: undefined,
  scenarioTitle: undefined,
  practiceType: undefined,
  caseId: undefined,
  caseTitle: undefined,
  skillIds: [],
  skillNames: [],
  startAt: undefined,
  zoomLink: "",
  initialRole: undefined,
  close: () =>
    set({
      scenarioId: undefined,
      scenarioTitle: undefined,
      practiceType: undefined,
      caseId: undefined,
      caseTitle: undefined,
      skillIds: [],
      skillNames: [],
      startAt: undefined,
      zoomLink: "",
      initialRole: undefined,
    }),
  setScenario: (id, title) => set({ scenarioId: id, scenarioTitle: title, caseId: undefined, caseTitle: undefined }),
  setPracticeType: (type) => set({ practiceType: type }),
  setCase: (id, title) => set({ caseId: id ?? undefined, caseTitle: title }),
  setSkills: (ids) => set({ skillIds: ids }),
  setSkillNames: (names) => set({ skillNames: names }),
  setStartAt: (iso) => set({ startAt: iso }),
  setZoom: (url) => set({ zoomLink: url }),
  setRole: (r) => set({ initialRole: r as any }),
}));


