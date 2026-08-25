import { describe, expect, it } from "vitest";
import {
  answeredCount,
  deriveSignals,
  formatAnswer,
  isAnswered,
  profileLine,
  quotableAnswers,
  toFlatRecord,
} from "../answers";
import { questionById } from "../questions";
import type { Answers } from "../types";

const answers: Answers = {
  stage: { kind: "single", choiceId: "retiring_12m" },
  work_type: { kind: "single", choiceId: "other", otherText: "Lighthouse keeper" },
  bigger_worry: { kind: "single", choiceId: "things_to_do" },
  normal_tuesday: { kind: "single", choiceId: "no_idea" },
  good_at: { kind: "text", text: "Fixing engines" },
  never_again: {
    kind: "multi",
    choiceIds: ["commuting", "other"],
    otherText: "Night shifts",
  },
  earn_money: { kind: "single", choiceId: "supplemental" },
  hours_week: { kind: "single", choiceId: "5_10" },
  talked_to: { kind: "multi", choiceIds: ["nobody"] },
  confidence: { kind: "scale", value: 2 },
  about_you: {
    kind: "details",
    age: "63",
    careerYears: "40",
    livesWithPartner: "yes",
    region: "Ohio",
  },
  contact: { kind: "contact", email: "reader@example.com", consent: true },
};

describe("isAnswered", () => {
  it("treats blank and untouched answers as unanswered", () => {
    expect(isAnswered(undefined)).toBe(false);
    expect(isAnswered({ kind: "single", choiceId: "" })).toBe(false);
    expect(isAnswered({ kind: "multi", choiceIds: [] })).toBe(false);
    expect(isAnswered({ kind: "text", text: "   " })).toBe(false);
    expect(isAnswered({ kind: "scale", value: 0 })).toBe(false);
    expect(
      isAnswered({
        kind: "details",
        age: "",
        careerYears: "",
        livesWithPartner: "",
        region: "",
      }),
    ).toBe(false);
    expect(isAnswered({ kind: "contact", email: "", consent: true })).toBe(false);
  });

  it("counts only the questions that were really answered", () => {
    expect(answeredCount(answers)).toBe(12);
  });
});

describe("formatAnswer", () => {
  it("appends the free-text part of an Other choice", () => {
    expect(formatAnswer(questionById("work_type")!, answers.work_type)).toBe(
      "Other: Lighthouse keeper",
    );
  });

  it("joins multi-select answers and keeps their Other text", () => {
    expect(formatAnswer(questionById("never_again")!, answers.never_again)).toBe(
      "Commuting; Other: Night shifts",
    );
  });

  it("renders the confidence scale out of five", () => {
    expect(formatAnswer(questionById("confidence")!, answers.confidence)).toBe(
      "2 out of 5",
    );
  });

  it("assembles the optional details into one line", () => {
    expect(formatAnswer(questionById("about_you")!, answers.about_you)).toBe(
      "Age 63 · 40 years in main career · Lives with a partner · Ohio",
    );
  });

  it("flags contact consent explicitly", () => {
    expect(formatAnswer(questionById("contact")!, answers.contact)).toContain(
      "consented to contact",
    );
    expect(
      formatAnswer(questionById("contact")!, {
        kind: "contact",
        email: "a@b.co",
        consent: false,
      }),
    ).toContain("no contact consent");
  });

  it("marks skipped questions", () => {
    expect(formatAnswer(questionById("love_doing")!, undefined)).toBe("(skipped)");
  });
});

describe("deriveSignals", () => {
  it("reads the cross-cut signals a researcher wants first", () => {
    const signals = Object.fromEntries(
      deriveSignals(answers).map((signal) => [signal.label, signal.value]),
    );
    expect(signals["Horizon"]).toBe("Retiring within 12 months");
    expect(signals["Bigger worry"]).toBe("Time, not money");
    expect(signals["Day clarity"]).toBe("Cannot picture a normal Tuesday");
    expect(signals["Work intent"]).toBe("Supplemental only, 5 to 10 hours a week");
    expect(signals["Confidence"]).toBe("2 out of 5");
    expect(signals["Support"]).toBe("Has talked to nobody");
  });

  it("says so plainly when nothing was answered", () => {
    for (const signal of deriveSignals({})) {
      expect(signal.value).toBe("Not given");
    }
  });
});

describe("profileLine and quotes", () => {
  it("summarises who answered in one line", () => {
    expect(profileLine(answers)).toBe(
      "Retiring within the next 12 months, other: lighthouse keeper, age 63, Ohio",
    );
  });

  it("returns only the free-text answers for quoting", () => {
    const quotes = quotableAnswers(answers);
    expect(quotes).toHaveLength(1);
    expect(quotes[0].text).toBe("Fixing engines");
  });
});

describe("toFlatRecord", () => {
  it("produces one spreadsheet-ready row per response", () => {
    const row = toFlatRecord({
      responseId: "abc123",
      submittedAt: "2026-01-02T03:04:05.000Z",
      minutesTaken: 4,
      locale: "en-GB",
      timezone: "Europe/Rome",
      answers,
    });
    expect(row.response_id).toBe("abc123");
    expect(row.minutes_taken).toBe("4");
    expect(row.bigger_worry).toBe("Running out of things to do");
    expect(row.love_doing).toBe("(skipped)");
  });
});
