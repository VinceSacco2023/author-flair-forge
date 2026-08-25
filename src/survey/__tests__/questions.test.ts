import { describe, expect, it } from "vitest";
import { PARTS, questions, questionById } from "../questions";

describe("survey definition", () => {
  it("carries all fifteen questions from the printed survey", () => {
    expect(questions).toHaveLength(15);
    expect(questions.map((q) => q.number)).toEqual(
      Array.from({ length: 15 }, (_, i) => i + 1),
    );
  });

  it("uses unique question ids", () => {
    const ids = questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses unique choice ids inside each question", () => {
    for (const question of questions) {
      if (question.kind !== "single" && question.kind !== "multi") continue;
      const ids = question.choices.map((c) => c.id);
      expect(new Set(ids).size, `duplicate choice in ${question.id}`).toBe(ids.length);
    }
  });

  it("only marks exclusive choices that actually exist", () => {
    for (const question of questions) {
      if (question.kind !== "multi" || !question.exclusiveChoiceIds) continue;
      for (const id of question.exclusiveChoiceIds) {
        expect(
          question.choices.some((choice) => choice.id === id),
          `${question.id} has no choice ${id}`,
        ).toBe(true);
      }
    }
  });

  it("assigns every question to one of the six parts", () => {
    for (const question of questions) {
      expect(PARTS).toContain(question.part);
    }
  });

  it("finds questions by id", () => {
    expect(questionById("confidence")?.number).toBe(13);
    expect(questionById("nope")).toBeUndefined();
  });
});
