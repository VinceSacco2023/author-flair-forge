import type { Answers, SurveyResponse } from "./types";

const DRAFT_KEY = "wwidad.survey.draft.v1";
const OUTBOX_KEY = "wwidad.survey.outbox.v1";

export interface SurveyDraft {
  answers: Answers;
  /** Index of the screen the respondent was last on. */
  step: number;
  startedAt: string;
  updatedAt: string;
}

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    // Private browsing on iOS can throw on access; the survey still works,
    // it just cannot be resumed later.
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* nothing we can do, and nothing the respondent should see */
  }
}

function safeRemove(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function loadDraft(): SurveyDraft | null {
  const raw = safeGet(DRAFT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SurveyDraft;
    if (!parsed || typeof parsed !== "object" || typeof parsed.answers !== "object") {
      return null;
    }
    return {
      answers: parsed.answers ?? {},
      step: typeof parsed.step === "number" ? parsed.step : 0,
      startedAt: parsed.startedAt ?? new Date().toISOString(),
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveDraft(draft: SurveyDraft) {
  safeSet(DRAFT_KEY, JSON.stringify(draft));
}

export function clearDraft() {
  safeRemove(DRAFT_KEY);
}

/**
 * Responses that were completed but could not be delivered — a dropped
 * connection on a train, a serverless function that was cold. They are
 * retried the next time the app loads, so an answer is never lost.
 */
export function loadOutbox(): SurveyResponse[] {
  const raw = safeGet(OUTBOX_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SurveyResponse[]) : [];
  } catch {
    return [];
  }
}

export function queueForRetry(response: SurveyResponse) {
  const outbox = loadOutbox().filter((r) => r.responseId !== response.responseId);
  outbox.push(response);
  safeSet(OUTBOX_KEY, JSON.stringify(outbox.slice(-10)));
}

export function removeFromOutbox(responseId: string) {
  const outbox = loadOutbox().filter((r) => r.responseId !== responseId);
  if (outbox.length === 0) safeRemove(OUTBOX_KEY);
  else safeSet(OUTBOX_KEY, JSON.stringify(outbox));
}
