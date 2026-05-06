import type { QuizAnswers } from '../types';

/** Encode/decode answers as a URL-safe string for shareable estimate links. */
export function encodeAnswers(a: QuizAnswers): string {
  const json = JSON.stringify(a);
  return btoa(unescape(encodeURIComponent(json)));
}

export function decodeAnswers(s: string): QuizAnswers | null {
  try {
    const json = decodeURIComponent(escape(atob(s)));
    return JSON.parse(json) as QuizAnswers;
  } catch {
    return null;
  }
}
