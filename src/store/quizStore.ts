import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FIRST_STEP_ID, nextStepId } from '../quiz/schema';
import type { QuizAnswers } from '../types';

interface QuizState {
  currentId: string;
  history: string[];
  answers: QuizAnswers;
  startedAt: number | null;
  setAnswer: (id: string, value: QuizAnswers[string]) => void;
  goNext: () => string | null;
  goBack: () => void;
  reset: () => void;
  hydrateFromShared: (answers: QuizAnswers) => void;
}

export const useQuiz = create<QuizState>()(
  persist(
    (set, get) => ({
      currentId: FIRST_STEP_ID,
      history: [FIRST_STEP_ID],
      answers: {},
      startedAt: null,
      setAnswer: (id, value) =>
        set((s) => ({
          answers: { ...s.answers, [id]: value },
          startedAt: s.startedAt ?? Date.now(),
        })),
      goNext: () => {
        const { currentId, answers, history } = get();
        const next = nextStepId(currentId, answers);
        if (next) {
          set({ currentId: next, history: [...history, next] });
        }
        return next;
      },
      goBack: () => {
        const { history } = get();
        if (history.length <= 1) return;
        const newHist = history.slice(0, -1);
        set({ currentId: newHist[newHist.length - 1], history: newHist });
      },
      reset: () => set({ currentId: FIRST_STEP_ID, history: [FIRST_STEP_ID], answers: {}, startedAt: null }),
      hydrateFromShared: (answers) =>
        set({ answers, currentId: FIRST_STEP_ID, history: [FIRST_STEP_ID], startedAt: Date.now() }),
    }),
    { name: 'quotenest-quiz-v1' }
  )
);
