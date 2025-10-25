import { create } from "zustand";

import type { PracticeType } from "@/shared/types/practice.types";
import type { PracticeParticipantRole } from "@/shared/types/user.types";

interface CreatePracticeState {
  scenarioId?: number;
  scenarioTitle?: string;
  practiceType?: PracticeType;
  caseId?: number;
  caseTitle?: string;
  skillIds: number[];
  skillNames: string[];
  startAt?: string; // ISO string
  zoomLink?: string;
  initialRole?: PracticeParticipantRole;
  close: () => void;
  setScenario: (id: number | undefined, title?: string) => void;
  setPracticeType: (type?: PracticeType) => void;
  setCase: (id: number | undefined, title?: string) => void;
  setSkills: (ids: number[]) => void;
  setSkillNames: (names: string[]) => void;
  setStartAt: (iso?: string) => void;
  setZoom: (url: string) => void;
  setRole: (r: PracticeParticipantRole | undefined) => void;
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
  setScenario: (id, title) =>
    set({
      scenarioId: id,
      scenarioTitle: title,
    }),
  setPracticeType: (type) => set({ practiceType: type }),
  setCase: (id, title) => set({ caseId: id ?? undefined, caseTitle: title }),
  setSkills: (ids) => set({ skillIds: ids }),
  setSkillNames: (names) => set({ skillNames: names }),
  setStartAt: (iso) => set({ startAt: iso }),
  setZoom: (url) => set({ zoomLink: url }),
  setRole: (r) => set({ initialRole: r }),
}));
