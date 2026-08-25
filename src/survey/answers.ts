import { questions, questionById } from "./questions";
import type {
  Answer,
  Answers,
  Choice,
  MultiAnswer,
  Question,
  SingleAnswer,
  SurveyResponse,
} from "./types";

export function emptyAnswerFor(question: Question): Answer {
  switch (question.kind) {
    case "single":
      return { kind: "single", choiceId: "" };
    case "multi":
      return { kind: "multi", choiceIds: [] };
    case "text":
      return { kind: "text", text: "" };
    case "scale":
      return { kind: "scale", value: 0 };
    case "details":
      return {
        kind: "details",
        age: "",
        careerYears: "",
        livesWithPartner: "",
        region: "",
      };
    case "contact":
      return { kind: "contact", email: "", consent: false };
  }
}

/** True when the respondent has put something real in this question. */
export function isAnswered(answer: Answer | undefined): boolean {
  if (!answer) return false;
  switch (answer.kind) {
    case "single":
      return answer.choiceId !== "";
    case "multi":
      return answer.choiceIds.length > 0;
    case "text":
      return answer.text.trim() !== "";
    case "scale":
      return answer.value > 0;
    case "details":
      return Boolean(
        answer.age.trim() ||
          answer.careerYears.trim() ||
          answer.livesWithPartner ||
          answer.region.trim(),
      );
    case "contact":
      return answer.email.trim() !== "";
  }
}

export function answeredCount(answers: Answers): number {
  return questions.filter((q) => isAnswered(answers[q.id])).length;
}

function choiceLabel(question: Question, choiceId: string): string {
  if (question.kind !== "single" && question.kind !== "multi") return choiceId;
  const choice = question.choices.find((c: Choice) => c.id === choiceId);
  return choice ? choice.label : choiceId;
}

function withOther(
  question: Question,
  label: string,
  choiceId: string,
  otherText?: string,
): string {
  if (question.kind !== "single" && question.kind !== "multi") return label;
  const choice = question.choices.find((c: Choice) => c.id === choiceId);
  if (choice?.allowsText && otherText?.trim()) {
    return `${label}: ${otherText.trim()}`;
  }
  return label;
}

/** One-line, human-readable rendering of an answer — used by the report. */
export function formatAnswer(question: Question, answer: Answer | undefined): string {
  if (!isAnswered(answer) || !answer) return "(skipped)";
  switch (answer.kind) {
    case "single":
      return withOther(
        question,
        choiceLabel(question, answer.choiceId),
        answer.choiceId,
        answer.otherText,
      );
    case "multi":
      return answer.choiceIds
        .map((id) => withOther(question, choiceLabel(question, id), id, answer.otherText))
        .join("; ");
    case "text":
      return answer.text.trim();
    case "scale": {
      const scale = question.kind === "scale" ? question : null;
      return scale
        ? `${answer.value} out of ${scale.max}`
        : String(answer.value);
    }
    case "details": {
      const parts: string[] = [];
      if (answer.age.trim()) parts.push(`Age ${answer.age.trim()}`);
      if (answer.careerYears.trim())
        parts.push(`${answer.careerYears.trim()} years in main career`);
      if (answer.livesWithPartner)
        parts.push(
          answer.livesWithPartner === "yes"
            ? "Lives with a partner"
            : "Does not live with a partner",
        );
      if (answer.region.trim()) parts.push(answer.region.trim());
      return parts.join(" · ");
    }
    case "contact":
      return `${answer.email.trim()}${answer.consent ? " (consented to contact)" : " (no contact consent given)"}`;
  }
}

function singleChoiceId(answers: Answers, questionId: string): string {
  const answer = answers[questionId];
  return answer && answer.kind === "single" ? answer.choiceId : "";
}

function multiChoiceIds(answers: Answers, questionId: string): string[] {
  const answer = answers[questionId];
  return answer && answer.kind === "multi" ? answer.choiceIds : [];
}

export interface Signal {
  label: string;
  value: string;
}

/**
 * The handful of cross-cut readings that make one response useful next to a
 * hundred others: how close they are, what they fear, whether the day is
 * planned, and whether anyone has helped them think about it.
 */
export function deriveSignals(answers: Answers): Signal[] {
  const signals: Signal[] = [];

  const stage = singleChoiceId(answers, "stage");
  const retiredAlready = stage === "retired_2plus" || stage === "retired_recent";
  const imminent = stage === "retiring_12m";
  signals.push({
    label: "Horizon",
    value: retiredAlready
      ? "Already retired"
      : imminent
        ? "Retiring within 12 months"
        : stage
          ? formatAnswer(questionById("stage")!, answers["stage"])
          : "Not given",
  });

  const worry = singleChoiceId(answers, "bigger_worry");
  signals.push({
    label: "Bigger worry",
    value:
      worry === "things_to_do"
        ? "Time, not money"
        : worry === "money"
          ? "Money, not time"
          : worry === "both"
            ? "Both equally"
            : worry === "neither"
              ? "Feels ready"
              : "Not given",
  });

  const tuesday = singleChoiceId(answers, "normal_tuesday");
  const vague = tuesday === "not_really" || tuesday === "no_idea";
  signals.push({
    label: "Day clarity",
    value: !tuesday
      ? "Not given"
      : vague
        ? "Cannot picture a normal Tuesday"
        : tuesday === "hour_by_hour"
          ? "Can picture it hour by hour"
          : "Can picture it roughly",
  });

  const earn = singleChoiceId(answers, "earn_money");
  const hours = singleChoiceId(answers, "hours_week");
  const hoursLabel = hours
    ? choiceLabel(questionById("hours_week")!, hours).toLowerCase()
    : "";
  signals.push({
    label: "Work intent",
    value: !earn
      ? "Not given"
      : earn === "done_earning"
        ? "Done earning"
        : earn === "need_income"
          ? `Needs real income${hoursLabel ? `, ${hoursLabel} hours a week` : ""}`
          : earn === "supplemental"
            ? `Supplemental only${hoursLabel ? `, ${hoursLabel} hours a week` : ""}`
            : earn === "if_it_pays"
              ? "Would work, pay is a bonus"
              : "Undecided",
  });

  const confidence = answers["confidence"];
  signals.push({
    label: "Confidence",
    value:
      confidence && confidence.kind === "scale" && confidence.value > 0
        ? `${confidence.value} out of 5`
        : "Not given",
  });

  const talked = multiChoiceIds(answers, "talked_to");
  signals.push({
    label: "Support",
    value:
      talked.length === 0
        ? "Not given"
        : talked.includes("nobody")
          ? "Has talked to nobody"
          : `Has talked to ${talked.length} source${talked.length > 1 ? "s" : ""}`,
  });

  const tried = multiChoiceIds(answers, "tried");
  signals.push({
    label: "Prior effort",
    value:
      tried.length === 0
        ? "Not given"
        : tried.includes("nothing_yet")
          ? "Has tried nothing yet"
          : `Has tried ${tried.length} approach${tried.length > 1 ? "es" : ""}`,
  });

  return signals;
}

/**
 * The sentence a researcher wants at the top of a response: who this person
 * is, in one line, before reading a word of their free text.
 */
export function profileLine(answers: Answers): string {
  const bits: string[] = [];
  const stage = answers["stage"];
  if (isAnswered(stage)) bits.push(formatAnswer(questionById("stage")!, stage));
  const work = answers["work_type"];
  if (isAnswered(work))
    bits.push(formatAnswer(questionById("work_type")!, work).toLowerCase());
  const details = answers["about_you"];
  if (details && details.kind === "details") {
    if (details.age.trim()) bits.push(`age ${details.age.trim()}`);
    if (details.region.trim()) bits.push(details.region.trim());
  }
  return bits.length ? bits.join(", ") : "No profile details given";
}

/** Free-text answers, the raw material for quotes in the book. */
export function quotableAnswers(
  answers: Answers,
): { question: Question; text: string }[] {
  return questions
    .filter((q) => q.kind === "text")
    .map((q) => ({ question: q, answer: answers[q.id] }))
    .filter((entry) => isAnswered(entry.answer))
    .map((entry) => ({
      question: entry.question,
      text: (entry.answer as { text: string }).text.trim(),
    }));
}

/** Flat key/value rows for spreadsheets — one response per row. */
export function toFlatRecord(response: SurveyResponse): Record<string, string> {
  const row: Record<string, string> = {
    response_id: response.responseId,
    submitted_at: response.submittedAt,
    minutes_taken: String(response.minutesTaken),
    timezone: response.timezone,
    locale: response.locale,
  };
  for (const question of questions) {
    row[question.id] = formatAnswer(question, response.answers[question.id]);
  }
  return row;
}
