import { describe, expect, it } from "vitest";
import { buildReportDocx, reportFileName } from "../docx";
import { createZip } from "../zip";
import type { Answers, SurveyResponse } from "../types";

/** Walks the local file headers — the package has to be a real ZIP to pass. */
function readPart(zip: Uint8Array, path: string): string {
  const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
  const decoder = new TextDecoder();
  let offset = 0;
  while (offset + 30 <= zip.length && view.getUint32(offset, true) === 0x04034b50) {
    const size = view.getUint32(offset + 18, true);
    const nameLength = view.getUint16(offset + 26, true);
    const extraLength = view.getUint16(offset + 28, true);
    const name = decoder.decode(zip.subarray(offset + 30, offset + 30 + nameLength));
    const dataStart = offset + 30 + nameLength + extraLength;
    if (name === path) {
      return decoder.decode(zip.subarray(dataStart, dataStart + size));
    }
    offset = dataStart + size;
  }
  throw new Error(`part ${path} not found in package`);
}

function countSignature(zip: Uint8Array, signature: number[]): number {
  let count = 0;
  for (let i = 0; i <= zip.length - signature.length; i++) {
    if (signature.every((byte, offset) => zip[i + offset] === byte)) count += 1;
  }
  return count;
}

function makeResponse(answers: Answers): SurveyResponse {
  return {
    responseId: "a1b2c3d4",
    submittedAt: "2026-03-04T10:20:30.000Z",
    minutesTaken: 4,
    locale: "en-GB",
    timezone: "Europe/Rome",
    answers,
  };
}

const fullAnswers: Answers = {
  stage: { kind: "single", choiceId: "retiring_12m" },
  work_type: { kind: "single", choiceId: "healthcare" },
  bigger_worry: { kind: "single", choiceId: "things_to_do" },
  normal_tuesday: { kind: "single", choiceId: "no_idea" },
  good_at: { kind: "text", text: "Listening to people & staying calm" },
  love_doing: { kind: "text", text: "First line\nSecond line" },
  never_again: { kind: "multi", choiceIds: ["early_mornings", "on_call"] },
  earn_money: { kind: "single", choiceId: "supplemental" },
  hours_week: { kind: "single", choiceId: "5_10" },
  talked_to: { kind: "multi", choiceIds: ["spouse", "friends"] },
  tried: { kind: "multi", choiceIds: ["nothing_yet"] },
  first_year_worry: { kind: "text", text: "Losing the <structure> of a day" },
  confidence: { kind: "scale", value: 3 },
  about_you: {
    kind: "details",
    age: "61",
    careerYears: "35",
    livesWithPartner: "yes",
    region: "Kent",
  },
  contact: { kind: "contact", email: "reader@example.com", consent: true },
};

describe("buildReportDocx", () => {
  it("writes a ZIP package containing the Word parts", () => {
    const zip = buildReportDocx(makeResponse(fullAnswers));
    expect(Array.from(zip.slice(0, 4))).toEqual([0x50, 0x4b, 0x03, 0x04]);
    const text = new TextDecoder("utf-8", { fatal: false }).decode(zip);
    for (const part of [
      "[Content_Types].xml",
      "_rels/.rels",
      "docProps/core.xml",
      "word/_rels/document.xml.rels",
      "word/document.xml",
      "word/styles.xml",
    ]) {
      expect(text, `${part} missing`).toContain(part);
    }
  });

  it("produces well-formed document XML", () => {
    const zip = buildReportDocx(makeResponse(fullAnswers));
    const xml = readPart(zip, "word/document.xml");
    const parsed = new DOMParser().parseFromString(xml, "application/xml");
    expect(parsed.getElementsByTagName("parsererror")).toHaveLength(0);
    expect(parsed.documentElement.localName).toBe("document");
  });

  it("includes the summary signals, the answers and the free text", () => {
    const xml = readPart(buildReportDocx(makeResponse(fullAnswers)), "word/document.xml");
    expect(xml).toContain("At a glance");
    expect(xml).toContain("Retiring within 12 months");
    expect(xml).toContain("Cannot picture a normal Tuesday");
    expect(xml).toContain("In their own words");
    expect(xml).toContain("Early mornings; Being on call");
    expect(xml).toContain("3 out of 5");
    expect(xml).toContain("15 of 15");
  });

  it("escapes characters that would otherwise break the document", () => {
    const xml = readPart(buildReportDocx(makeResponse(fullAnswers)), "word/document.xml");
    expect(xml).toContain("Listening to people &amp; staying calm");
    expect(xml).toContain("Losing the &lt;structure&gt; of a day");
    expect(xml).not.toContain("<structure>");
  });

  it("keeps line breaks in long-form answers as separate paragraphs", () => {
    const xml = readPart(buildReportDocx(makeResponse(fullAnswers)), "word/document.xml");
    expect(xml).toContain("First line");
    expect(xml).toContain("Second line");
    expect(xml).not.toContain("First line\nSecond line");
  });

  it("marks skipped questions instead of leaving a gap", () => {
    const xml = readPart(
      buildReportDocx(
        makeResponse({ stage: { kind: "single", choiceId: "never_fully" } }),
      ),
      "word/document.xml",
    );
    expect(xml).toContain("Skipped");
    expect(xml).toContain("1 of 15");
  });

  it("warns when an email was left without consent", () => {
    const xml = readPart(
      buildReportDocx(
        makeResponse({
          contact: { kind: "contact", email: "quiet@example.com", consent: false },
        }),
      ),
      "word/document.xml",
    );
    expect(xml).toContain("Do not contact them.");
  });

  it("omits the follow-up section for anonymous responses", () => {
    const xml = readPart(buildReportDocx(makeResponse({})), "word/document.xml");
    expect(xml).not.toContain("Follow-up");
  });

  it("names the file by date and response id", () => {
    expect(reportFileName(makeResponse({}))).toBe(
      "WhatWillIDoAllDay-2026-03-04-a1b2c3d4.docx",
    );
  });
});

describe("createZip", () => {
  it("records one central directory entry per file", () => {
    const zip = createZip([
      { path: "a.txt", content: "hello" },
      { path: "b.txt", content: "world" },
    ]);
    // Local file header, central directory header, end of central directory.
    expect(countSignature(zip, [0x50, 0x4b, 0x03, 0x04])).toBe(2);
    expect(countSignature(zip, [0x50, 0x4b, 0x01, 0x02])).toBe(2);
    expect(countSignature(zip, [0x50, 0x4b, 0x05, 0x06])).toBe(1);
    const text = new TextDecoder().decode(zip);
    expect(text).toContain("hello");
    expect(text).toContain("world");
  });
});
