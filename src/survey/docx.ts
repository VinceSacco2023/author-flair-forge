import { CLOSING_NOTE, PARTS, questions, SURVEY_TITLE } from "./questions";
import {
  answeredCount,
  deriveSignals,
  formatAnswer,
  isAnswered,
  profileLine,
  quotableAnswers,
} from "./answers";
import { bytesToBase64, createZip } from "./zip";
import type { SurveyResponse } from "./types";

function esc(text: string): string {
  return text
    // Word rejects most control characters outright.
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

interface ParaOptions {
  style?: string;
  bold?: boolean;
  italic?: boolean;
  color?: string;
  size?: number; // half-points
  spaceAfter?: number; // twentieths of a point
}

function para(text: string, options: ParaOptions = {}): string {
  const { style, bold, italic, color, size, spaceAfter } = options;
  const pPr = [
    style ? `<w:pStyle w:val="${style}"/>` : "",
    spaceAfter !== undefined ? `<w:spacing w:after="${spaceAfter}"/>` : "",
  ].join("");
  const rPr = [
    bold ? "<w:b/>" : "",
    italic ? "<w:i/>" : "",
    color ? `<w:color w:val="${color}"/>` : "",
    size ? `<w:sz w:val="${size}"/>` : "",
  ].join("");
  return (
    `<w:p>${pPr ? `<w:pPr>${pPr}</w:pPr>` : ""}` +
    `<w:r>${rPr ? `<w:rPr>${rPr}</w:rPr>` : ""}` +
    `<w:t xml:space="preserve">${esc(text)}</w:t></w:r></w:p>`
  );
}

/** Keeps the respondent's own line breaks — quotes read as they were typed. */
function multilineParas(text: string, options: ParaOptions = {}): string {
  return text
    .split(/\r?\n/)
    .map((line) => para(line, options))
    .join("");
}

function cell(text: string, widthPct: number, bold = false): string {
  return (
    `<w:tc><w:tcPr><w:tcW w:w="${widthPct * 50}" w:type="pct"/>` +
    `<w:tcMar><w:top w:w="80" w:type="dxa"/><w:bottom w:w="80" w:type="dxa"/>` +
    `<w:left w:w="120" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tcMar></w:tcPr>` +
    para(text, { bold, spaceAfter: 0 }) +
    `</w:tc>`
  );
}

function table(rows: [string, string][]): string {
  const borders =
    `<w:tblBorders>` +
    ["top", "left", "bottom", "right", "insideH", "insideV"]
      .map(
        (side) =>
          `<w:${side} w:val="single" w:sz="4" w:space="0" w:color="D9D9D9"/>`,
      )
      .join("") +
    `</w:tblBorders>`;
  const body = rows
    .map(([label, value]) => `<w:tr>${cell(label, 34, true)}${cell(value, 66)}</w:tr>`)
    .join("");
  return `<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/>${borders}</w:tblPr>${body}</w:tbl>`;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" });
}

function buildDocumentXml(response: SurveyResponse): string {
  const { answers } = response;
  const blocks: string[] = [];

  blocks.push(para(SURVEY_TITLE, { style: "Title" }));
  blocks.push(para("Survey response report", { style: "Subtitle" }));
  blocks.push(
    para(
      `Response ${response.responseId} · submitted ${formatDate(response.submittedAt)}`,
      { italic: true, color: "666666", size: 18 },
    ),
  );

  blocks.push(para("At a glance", { style: "Heading1" }));
  blocks.push(para(profileLine(answers), { bold: true }));
  blocks.push(
    table([
      ...deriveSignals(answers).map(
        (signal) => [signal.label, signal.value] as [string, string],
      ),
      ["Questions answered", `${answeredCount(answers)} of ${questions.length}`],
      [
        "Time taken",
        `${response.minutesTaken} minute${response.minutesTaken === 1 ? "" : "s"}`,
      ],
      ["Timezone", response.timezone || "Not given"],
    ]),
  );
  blocks.push(para(""));

  const quotes = quotableAnswers(answers);
  if (quotes.length > 0) {
    blocks.push(para("In their own words", { style: "Heading1" }));
    for (const quote of quotes) {
      blocks.push(para(quote.question.title, { bold: true, spaceAfter: 60 }));
      blocks.push(multilineParas(quote.text, { style: "Quote" }));
    }
    blocks.push(para(""));
  }

  blocks.push(para("Every answer", { style: "Heading1" }));
  for (const part of PARTS) {
    const partQuestions = questions.filter((q) => q.part === part);
    if (partQuestions.length === 0) continue;
    blocks.push(para(part, { style: "Heading2" }));
    for (const question of partQuestions) {
      blocks.push(
        para(`${question.number}. ${question.title}`, { bold: true, spaceAfter: 40 }),
      );
      const answer = answers[question.id];
      if (!isAnswered(answer)) {
        blocks.push(para("Skipped", { italic: true, color: "888888" }));
        continue;
      }
      if (question.kind === "text") {
        blocks.push(multilineParas(formatAnswer(question, answer), { style: "Quote" }));
      } else {
        blocks.push(para(formatAnswer(question, answer)));
      }
    }
  }

  const contact = answers["contact"];
  if (contact && contact.kind === "contact" && contact.email.trim()) {
    blocks.push(para("Follow-up", { style: "Heading1" }));
    blocks.push(para(`Email: ${contact.email.trim()}`));
    blocks.push(
      para(
        contact.consent
          ? "This person consented to being contacted about the survey and the free personalised plan."
          : "This person left an email address but did not tick the consent box. Do not contact them.",
        { bold: !contact.consent },
      ),
    );
  }

  blocks.push(para(""));
  blocks.push(para(CLOSING_NOTE, { italic: true, color: "666666", size: 18 }));

  const sectPr =
    `<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>` +
    `<w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" ` +
    `w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>`;

  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">` +
    `<w:body>${blocks.join("")}${sectPr}</w:body></w:document>`
  );
}

const STYLES_XML =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">` +
  `<w:docDefaults><w:rPrDefault><w:rPr>` +
  `<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:sz w:val="22"/>` +
  `</w:rPr></w:rPrDefault><w:pPrDefault><w:pPr>` +
  `<w:spacing w:after="140" w:line="276" w:lineRule="auto"/>` +
  `</w:pPr></w:pPrDefault></w:docDefaults>` +
  `<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>` +
  `<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/>` +
  `<w:pPr><w:spacing w:after="60"/></w:pPr>` +
  `<w:rPr><w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/><w:b/><w:sz w:val="48"/>` +
  `<w:color w:val="1A1F2B"/></w:rPr></w:style>` +
  `<w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/>` +
  `<w:pPr><w:spacing w:after="40"/></w:pPr>` +
  `<w:rPr><w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/><w:sz w:val="28"/>` +
  `<w:color w:val="B8862B"/></w:rPr></w:style>` +
  `<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/>` +
  `<w:pPr><w:spacing w:before="360" w:after="120"/>` +
  `<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="4" w:color="B8862B"/></w:pBdr></w:pPr>` +
  `<w:rPr><w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/><w:b/><w:sz w:val="30"/>` +
  `<w:color w:val="1A1F2B"/></w:rPr></w:style>` +
  `<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/>` +
  `<w:pPr><w:spacing w:before="280" w:after="100"/></w:pPr>` +
  `<w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="4A4F5C"/></w:rPr></w:style>` +
  `<w:style w:type="paragraph" w:styleId="Quote"><w:name w:val="Quote"/>` +
  `<w:pPr><w:ind w:left="360"/><w:spacing w:after="80"/>` +
  `<w:pBdr><w:left w:val="single" w:sz="12" w:space="8" w:color="B8862B"/></w:pBdr></w:pPr>` +
  `<w:rPr><w:i/><w:color w:val="2B2F3A"/></w:rPr></w:style>` +
  `</w:styles>`;

const CONTENT_TYPES_XML =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
  `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
  `<Default Extension="xml" ContentType="application/xml"/>` +
  `<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>` +
  `<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>` +
  `<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>` +
  `</Types>`;

const ROOT_RELS_XML =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
  `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>` +
  `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>` +
  `</Relationships>`;

const DOCUMENT_RELS_XML =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
  `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
  `</Relationships>`;

function coreXml(response: SurveyResponse): string {
  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<cp:coreProperties ` +
    `xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" ` +
    `xmlns:dc="http://purl.org/dc/elements/1.1/" ` +
    `xmlns:dcterms="http://purl.org/dc/terms/" ` +
    `xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">` +
    `<dc:title>${esc(`${SURVEY_TITLE} - response ${response.responseId}`)}</dc:title>` +
    `<dc:subject>Retirement survey response</dc:subject>` +
    `<dc:creator>What Will I Do All Day? survey</dc:creator>` +
    `<cp:lastModifiedBy>What Will I Do All Day? survey</cp:lastModifiedBy>` +
    `<dcterms:created xsi:type="dcterms:W3CDTF">${esc(response.submittedAt)}</dcterms:created>` +
    `<dcterms:modified xsi:type="dcterms:W3CDTF">${esc(response.submittedAt)}</dcterms:modified>` +
    `</cp:coreProperties>`
  );
}

/** The .docx bytes for one survey response. */
export function buildReportDocx(response: SurveyResponse): Uint8Array {
  const created = new Date(response.submittedAt);
  return createZip(
    [
      { path: "[Content_Types].xml", content: CONTENT_TYPES_XML },
      { path: "_rels/.rels", content: ROOT_RELS_XML },
      { path: "docProps/core.xml", content: coreXml(response) },
      { path: "word/_rels/document.xml.rels", content: DOCUMENT_RELS_XML },
      { path: "word/document.xml", content: buildDocumentXml(response) },
      { path: "word/styles.xml", content: STYLES_XML },
    ],
    Number.isNaN(created.getTime()) ? new Date() : created,
  );
}

export function reportFileName(response: SurveyResponse): string {
  const date = new Date(response.submittedAt);
  const stamp = Number.isNaN(date.getTime())
    ? "undated"
    : date.toISOString().slice(0, 10);
  return `WhatWillIDoAllDay-${stamp}-${response.responseId}.docx`;
}

export function buildReportDocxBase64(response: SurveyResponse): string {
  return bytesToBase64(buildReportDocx(response));
}
