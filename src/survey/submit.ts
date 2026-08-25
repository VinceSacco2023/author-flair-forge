import { buildReportDocx, reportFileName } from "./docx";
import { bytesToBase64 } from "./zip";
import { answeredCount, deriveSignals, profileLine, toFlatRecord } from "./answers";
import { questions } from "./questions";
import { queueForRetry, removeFromOutbox } from "./storage";
import type { Answers, SurveyResponse } from "./types";

const ENDPOINT =
  (import.meta.env?.VITE_REPORT_ENDPOINT as string | undefined) ||
  "/api/send-report";

export type DeliveryStatus = "sent" | "queued";

export interface DeliveryResult {
  status: DeliveryStatus;
  response: SurveyResponse;
  fileName: string;
  /** Reason delivery failed, when it did. Shown only in the console. */
  error?: string;
}

function randomId(): string {
  const bytes = new Uint8Array(4);
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function buildResponse(answers: Answers, startedAt: string): SurveyResponse {
  const submittedAt = new Date();
  const started = new Date(startedAt);
  const minutes = Number.isNaN(started.getTime())
    ? 0
    : Math.max(0, Math.round((submittedAt.getTime() - started.getTime()) / 60000));
  return {
    responseId: randomId(),
    submittedAt: submittedAt.toISOString(),
    minutesTaken: minutes,
    locale:
      typeof navigator !== "undefined" ? navigator.language || "unknown" : "unknown",
    timezone:
      typeof Intl !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown"
        : "unknown",
    answers,
  };
}

/** Plain-text digest for the body of the email, so it reads on a phone. */
export function emailSummary(response: SurveyResponse): string {
  const lines = [
    `New response to "What Will I Do All Day?"`,
    "",
    profileLine(response.answers),
    "",
    ...deriveSignals(response.answers).map((s) => `${s.label}: ${s.value}`),
    "",
    `Answered ${answeredCount(response.answers)} of ${questions.length} questions in ${response.minutesTaken} minute(s).`,
    "",
    "The full report is attached as a Word document.",
  ];
  return lines.join("\n");
}

export async function deliverResponse(
  response: SurveyResponse,
): Promise<DeliveryResult> {
  const docx = buildReportDocx(response);
  const fileName = reportFileName(response);

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        responseId: response.responseId,
        submittedAt: response.submittedAt,
        summary: emailSummary(response),
        fileName,
        docxBase64: bytesToBase64(docx),
        data: toFlatRecord(response),
      }),
    });
    if (!res.ok) {
      throw new Error(`Report endpoint responded ${res.status}`);
    }
    removeFromOutbox(response.responseId);
    return { status: "sent", response, fileName };
  } catch (error) {
    queueForRetry(response);
    return {
      status: "queued",
      response,
      fileName,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/** Retries anything left in the outbox by an earlier visit. */
export async function flushOutbox(pending: SurveyResponse[]): Promise<number> {
  let sent = 0;
  for (const response of pending) {
    const result = await deliverResponse(response);
    if (result.status === "sent") sent += 1;
  }
  return sent;
}

/** Saves the Word report to the device — the respondent's own copy. */
export function downloadReport(response: SurveyResponse) {
  const bytes = buildReportDocx(response);
  const blob = new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = reportFileName(response);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/** iOS and Android share sheet, when the browser offers it. */
export async function shareReport(response: SurveyResponse): Promise<boolean> {
  const bytes = buildReportDocx(response);
  const file = new File([bytes], reportFileName(response), {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
  };
  if (typeof navigator.share !== "function" || !nav.canShare?.({ files: [file] })) {
    return false;
  }
  try {
    await navigator.share({
      files: [file],
      title: "What Will I Do All Day? — my answers",
    });
    return true;
  } catch {
    return false;
  }
}
