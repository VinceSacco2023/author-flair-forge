/**
 * Data model for the "What Will I Do All Day?" survey.
 *
 * The survey is intentionally described as data rather than JSX so the same
 * definitions drive the interactive UI, the Word report and the raw data
 * export that feeds the book research.
 */

export type QuestionKind =
  | "single"
  | "multi"
  | "text"
  | "scale"
  | "details"
  | "contact";

export interface Choice {
  id: string;
  label: string;
  /** Reveals a free-text box, e.g. "Other: ______" */
  allowsText?: boolean;
}

interface BaseQuestion {
  id: string;
  /** Number as printed on the paper survey. */
  number: number;
  part: string;
  title: string;
  /** Short helper line shown under the title. */
  help?: string;
  kind: QuestionKind;
}

export interface SingleQuestion extends BaseQuestion {
  kind: "single";
  choices: Choice[];
}

export interface MultiQuestion extends BaseQuestion {
  kind: "multi";
  choices: Choice[];
  /** Choice that clears every other selection, e.g. "Nobody" / "Nothing yet". */
  exclusiveChoiceIds?: string[];
}

export interface TextQuestion extends BaseQuestion {
  kind: "text";
  placeholder: string;
  rows: number;
}

export interface ScaleQuestion extends BaseQuestion {
  kind: "scale";
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
}

export interface DetailsQuestion extends BaseQuestion {
  kind: "details";
}

export interface ContactQuestion extends BaseQuestion {
  kind: "contact";
  consentLabel: string;
}

export type Question =
  | SingleQuestion
  | MultiQuestion
  | TextQuestion
  | ScaleQuestion
  | DetailsQuestion
  | ContactQuestion;

export interface SingleAnswer {
  kind: "single";
  choiceId: string;
  otherText?: string;
}

export interface MultiAnswer {
  kind: "multi";
  choiceIds: string[];
  otherText?: string;
}

export interface TextAnswer {
  kind: "text";
  text: string;
}

export interface ScaleAnswer {
  kind: "scale";
  value: number;
}

export interface DetailsAnswer {
  kind: "details";
  age: string;
  careerYears: string;
  livesWithPartner: "yes" | "no" | "";
  region: string;
}

export interface ContactAnswer {
  kind: "contact";
  email: string;
  consent: boolean;
}

export type Answer =
  | SingleAnswer
  | MultiAnswer
  | TextAnswer
  | ScaleAnswer
  | DetailsAnswer
  | ContactAnswer;

export type Answers = Record<string, Answer>;

export interface SurveyResponse {
  /** Random id so a response can be referenced without knowing who sent it. */
  responseId: string;
  /** ISO timestamp of submission. */
  submittedAt: string;
  /** Whole minutes spent from first question to submit. */
  minutesTaken: number;
  /** Browser locale + timezone, useful when sorting responses by region. */
  locale: string;
  timezone: string;
  answers: Answers;
}
