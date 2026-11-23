
import { create } from "zustand";

import {
  saveResume,
  getResume,
  updateResume,
  type ResumeData,
} from "@/lib/resume-service";

// ----------------------------------
// Types
// ----------------------------------

export type PersonalInfo = {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
};

export type Experience = {
  id: number;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type Education = {
  id: number;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

type ResumeStore = {
  personal: PersonalInfo;
  summary: string;
  experiences: Experience[];
  educations: Education[];
  skills: string;

  // Database state
  resumeId: string | null;
  saveStatus: SaveStatus;
  saveError: string | null;
  hasUnsavedChanges: boolean;

  // Undo / redo history
  past: ResumeData[];
  future: ResumeData[];
  canUndo: boolean;
  canRedo: boolean;

  // Editor actions
  updatePersonal: (field: keyof PersonalInfo, value: string) => void;
  updateSummary: (value: string) => void;

  addExperience: () => void;
  updateExperience: (
    id: number,
    field: keyof Experience,
    value: string
  ) => void;
  removeExperience: (id: number) => void;
  reorderExperience: (id: number, newIndex: number) => void;

  addEducation: () => void;
  updateEducation: (
    id: number,
    field: keyof Education,
    value: string
  ) => void;
  removeEducation: (id: number) => void;
  reorderEducation: (id: number, newIndex: number) => void;

  updateSkills: (value: string) => void;
  resetResume: () => void;

  // Undo / redo actions
  undo: () => void;
  redo: () => void;

  // Database actions
  saveToDatabase: () => Promise<void>;
  loadFromDatabase: (id: string) => Promise<void>;
  resetSaveStatus: () => void;
};

// ----------------------------------
// Initial data
// ----------------------------------

const initialPersonal: PersonalInfo = {
  fullName: "",
  jobTitle: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  website: "",
};

const initialExperience: Experience = {
  id: 1,
  company: "",
  position: "",
  location: "",
  startDate: "",
  endDate: "",
  description: "",
};

const initialEducation: Education = {
  id: 1,
  school: "",
  degree: "",
  field: "",
  startDate: "",
  endDate: "",
};

const initialData = {
  personal: initialPersonal,
  summary: "",
  experiences: [{ ...initialExperience }],
  educations: [{ ...initialEducation }],
  skills: "",
};

// ----------------------------------
// Reordering helper
// ----------------------------------

const moveItem = <T,>(
  items: T[],
  fromIndex: number,
  toIndex: number
): T[] => {
  if (
    fromIndex < 0 ||
    fromIndex >= items.length ||
    toIndex < 0 ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return items;
  }

  const reordered = [...items];

  const [movedItem] = reordered.splice(fromIndex, 1);

  reordered.splice(toIndex, 0, movedItem);

  return reordered;
};

// ----------------------------------
// Resume snapshots and history
// ----------------------------------

const createResumeSnapshot = (state: ResumeStore): ResumeData => ({
  personal: { ...state.personal },
  summary: state.summary,
  experiences: state.experiences.map((item) => ({ ...item })),
  educations: state.educations.map((item) => ({ ...item })),
  skills: state.skills,
});

// Keep a maximum of 50 previous versions.
const MAX_HISTORY = 50;

// Group continuous typing in the same field into a single Undo step.
const TYPING_GROUP_DELAY = 1000;

let lastTypingGroupKey: string | null = null;
let lastTypingTime = 0;

const resetTypingGroup = () => {
  lastTypingGroupKey = null;
  lastTypingTime = 0;
};

const addHistory = (
  state: ResumeStore,
  groupKey?: string
) => {
  const now = Date.now();

  const shouldGroup =
    groupKey !== undefined &&
    groupKey === lastTypingGroupKey &&
    now - lastTypingTime < TYPING_GROUP_DELAY;

  if (groupKey !== undefined) {
    lastTypingGroupKey = groupKey;
    lastTypingTime = now;
  } else {
    resetTypingGroup();
  }

  const past = shouldGroup
    ? state.past
    : [...state.past, createResumeSnapshot(state)].slice(
        -MAX_HISTORY
      );

  return {
    past,
    future: [] as ResumeData[],
    canUndo: past.length > 0,
    canRedo: false,
    hasUnsavedChanges: true,
    saveStatus: "idle" as SaveStatus,
    saveError: null,
  };
};

// One shared promise prevents overlapping database saves.
let savePromise: Promise<void> | null = null;

// ----------------------------------
// Zustand store
// ----------------------------------

export const useResumeStore = create<ResumeStore>((set, get) => ({
  ...initialData,

  // Database state
  resumeId: null,
  saveStatus: "idle",
  saveError: null,
  hasUnsavedChanges: false,

  // History state
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  // ----------------------------------
  // Personal information
  // ----------------------------------

  updatePersonal: (field, value) =>
    set((state) => {
      if (state.personal[field] === value) {
        return state;
      }

      return {
        ...addHistory(state, `personal.${field}`),
        personal: {
          ...state.personal,
          [field]: value,
        },
      };
    }),

  // ----------------------------------
  // Professional summary
  // ----------------------------------

  updateSummary: (value) =>
    set((state) => {
      if (state.summary === value) {
        return state;
      }

      return {
        ...addHistory(state, "summary"),
        summary: value,
      };
    }),

  // ----------------------------------
  // Work experience
  // ----------------------------------

  addExperience: () => {
    resetTypingGroup();

    set((state) => ({
      ...addHistory(state),
      experiences: [
        ...state.experiences,
        {
          ...initialExperience,
          id: Date.now(),
        },
      ],
    }));
  },

  updateExperience: (id, field, value) =>
    set((state) => {
      const current = state.experiences.find(
        (item) => item.id === id
      );

      if (!current || current[field] === value) {
        return state;
      }

      return {
        ...addHistory(state, `experience.${id}.${field}`),
        experiences: state.experiences.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        ),
      };
    }),

  removeExperience: (id) => {
    resetTypingGroup();

    set((state) => {
      if (!state.experiences.some((item) => item.id === id)) {
        return state;
      }

      return {
        ...addHistory(state),
        experiences: state.experiences.filter(
          (item) => item.id !== id
        ),
      };
    });
  },

  // Actual experience reordering
  reorderExperience: (id, newIndex) => {
    resetTypingGroup();

    set((state) => {
      const currentIndex = state.experiences.findIndex(
        (item) => item.id === id
      );

      if (
        currentIndex === -1 ||
        !Number.isInteger(newIndex) ||
        newIndex < 0 ||
        newIndex >= state.experiences.length ||
        currentIndex === newIndex
      ) {
        return state;
      }

      return {
        ...addHistory(state),
        experiences: moveItem(
          state.experiences,
          currentIndex,
          newIndex
        ),
      };
    });
  },

  // ----------------------------------
  // Education
  // ----------------------------------

  addEducation: () => {
    resetTypingGroup();

    set((state) => ({
      ...addHistory(state),
      educations: [
        ...state.educations,
        {
          ...initialEducation,
          id: Date.now(),
        },
      ],
    }));
  },

  updateEducation: (id, field, value) =>
    set((state) => {
      const current = state.educations.find(
        (item) => item.id === id
      );

      if (!current || current[field] === value) {
        return state;
      }

      return {
        ...addHistory(state, `education.${id}.${field}`),
        educations: state.educations.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        ),
      };
    }),

  removeEducation: (id) => {
    resetTypingGroup();

    set((state) => {
      if (!state.educations.some((item) => item.id === id)) {
        return state;
      }

      return {
        ...addHistory(state),
        educations: state.educations.filter(
          (item) => item.id !== id
        ),
      };
    });
  },

  // Actual education reordering
  reorderEducation: (id, newIndex) => {
    resetTypingGroup();

    set((state) => {
      const currentIndex = state.educations.findIndex(
        (item) => item.id === id
      );

      if (
        currentIndex === -1 ||
        !Number.isInteger(newIndex) ||
        newIndex < 0 ||
        newIndex >= state.educations.length ||
        currentIndex === newIndex
      ) {
        return state;
      }

      return {
        ...addHistory(state),
        educations: moveItem(
          state.educations,
          currentIndex,
          newIndex
        ),
      };
    });
  },

  // ----------------------------------
  // Skills
  // ----------------------------------

  updateSkills: (value) =>
    set((state) => {
      if (state.skills === value) {
        return state;
      }

      return {
        ...addHistory(state, "skills"),
        skills: value,
      };
    }),

  // ----------------------------------
  // Reset editor
  // ----------------------------------

  resetResume: () => {
    resetTypingGroup();

    set((state) => ({
      ...addHistory(state),
      ...initialData,
      personal: { ...initialPersonal },
      experiences: [{ ...initialExperience }],
      educations: [{ ...initialEducation }],
      resumeId: null,
    }));
  },

  // ----------------------------------
  // Undo
  // ----------------------------------

  undo: () => {
    resetTypingGroup();

    set((state) => {
      if (state.past.length === 0) {
        return state;
      }

      const previous = state.past[state.past.length - 1];
      const current = createResumeSnapshot(state);
      const newPast = state.past.slice(0, -1);
      const newFuture = [...state.future, current];

      return {
        personal: previous.personal,
        summary: previous.summary,
        experiences: previous.experiences,
        educations: previous.educations,
        skills: previous.skills,

        past: newPast,
        future: newFuture,
        canUndo: newPast.length > 0,
        canRedo: true,

        hasUnsavedChanges: true,
        saveStatus: "idle",
        saveError: null,
      };
    });
  },

  // ----------------------------------
  // Redo
  // ----------------------------------

  redo: () => {
    resetTypingGroup();

    set((state) => {
      if (state.future.length === 0) {
        return state;
      }

      const next = state.future[state.future.length - 1];
      const current = createResumeSnapshot(state);
      const newFuture = state.future.slice(0, -1);
      const newPast = [...state.past, current].slice(-MAX_HISTORY);

      return {
        personal: next.personal,
        summary: next.summary,
        experiences: next.experiences,
        educations: next.educations,
        skills: next.skills,

        past: newPast,
        future: newFuture,
        canUndo: newPast.length > 0,
        canRedo: newFuture.length > 0,

        hasUnsavedChanges: true,
        saveStatus: "idle",
        saveError: null,
      };
    });
  },

  // ----------------------------------
  // Save to Supabase
  // ----------------------------------

  saveToDatabase: async () => {
    if (savePromise) {
      return savePromise;
    }

    const currentSave = (async () => {
      set({
        saveStatus: "saving",
        saveError: null,
      });

      try {
        while (true) {
          const state = get();
          const resumeData = createResumeSnapshot(state);
          const snapshot = JSON.stringify(resumeData);

          const title =
            resumeData.personal.fullName.trim() ||
            resumeData.personal.jobTitle.trim() ||
            "Untitled Resume";

          let result;

          if (state.resumeId) {
            result = await updateResume(
              state.resumeId,
              resumeData,
              title
            );
          } else {
            result = await saveResume(resumeData, title);
          }

          set({ resumeId: result.id });

          const latestSnapshot = JSON.stringify(
            createResumeSnapshot(get())
          );

          if (latestSnapshot === snapshot) {
            set({
              saveStatus: "saved",
              saveError: null,
              hasUnsavedChanges: false,
            });

            break;
          }
        }
      } catch (error) {
        set({
          saveStatus: "error",
          saveError:
            error instanceof Error
              ? error.message
              : "Something went wrong while saving your resume.",
        });
      }
    })();

    savePromise = currentSave;

    try {
      await currentSave;
    } finally {
      if (savePromise === currentSave) {
        savePromise = null;
      }
    }
  },

  // ----------------------------------
  // Load from Supabase
  // ----------------------------------

  loadFromDatabase: async (id) => {
    resetTypingGroup();

    set({
      saveStatus: "saving",
      saveError: null,
    });

    try {
      const result = await getResume(id);
      const resumeData = result.resume_data as ResumeData;

      set({
        personal: resumeData.personal,
        summary: resumeData.summary,
        experiences: resumeData.experiences,
        educations: resumeData.educations,
        skills: resumeData.skills,

        resumeId: result.id,
        saveStatus: "saved",
        saveError: null,
        hasUnsavedChanges: false,

        past: [],
        future: [],
        canUndo: false,
        canRedo: false,
      });
    } catch (error) {
      set({
        saveStatus: "error",
        saveError:
          error instanceof Error
            ? error.message
            : "Failed to load resume.",
      });
    }
  },

  // ----------------------------------
  // Reset save status
  // ----------------------------------

  resetSaveStatus: () =>
    set({
      saveStatus: "idle",
      saveError: null,
    }),
}));
