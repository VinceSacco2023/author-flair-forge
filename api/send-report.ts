/**
 * Emails one completed survey response, with the Word report attached.
 *
 * The handler is a plain Web `Request` -> `Response` function so the same file
 * runs on Vercel (Edge Functions), Netlify (via netlify/functions/send-report.ts),
 * Cloudflare Pages and Deno Deploy without changes.
 *
 * Required environment variables:
 *   RESEND_API_KEY     API key from resend.com
 *   REPORT_TO_EMAIL    where reports are delivered
 *   REPORT_FROM_EMAIL  a verified sender on your domain
 */

export const config = { runtime: "edge" };

const MAX_BODY_BYTES = 3_000_000; // a report is a few tens of KB; this is generous
const MAX_SUMMARY_CHARS = 20_000;

interface ReportPayload {
  responseId?: unknown;
  submittedAt?: unknown;
  summary?: unknown;
  fileName?: unknown;
  docxBase64?: unknown;
  data?: unknown;
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function safeFileName(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const cleaned = value.replace(/[^A-Za-z0-9._-]/g, "-").slice(0, 120);
  return cleaned.endsWith(".docx") ? cleaned : fallback;
}

function isBase64(value: string): boolean {
  return /^[A-Za-z0-9+/\r\n]*={0,2}$/.test(value);
}

function base64Utf8(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.REPORT_TO_EMAIL;
  const from = process.env.REPORT_FROM_EMAIL;
  if (!apiKey || !to || !from) {
    return json(
      {
        error:
          "Email is not configured. Set RESEND_API_KEY, REPORT_TO_EMAIL and REPORT_FROM_EMAIL.",
      },
      503,
    );
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return json({ error: "Payload too large" }, 413);
  }

  let payload: ReportPayload;
  try {
    payload = JSON.parse(raw) as ReportPayload;
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const docxBase64 = payload.docxBase64;
  if (typeof docxBase64 !== "string" || docxBase64.length < 100 || !isBase64(docxBase64)) {
    return json({ error: "Missing or invalid report attachment" }, 400);
  }

  const responseId =
    typeof payload.responseId === "string"
      ? payload.responseId.replace(/[^A-Za-z0-9-]/g, "").slice(0, 32)
      : "unknown";
  const fileName = safeFileName(payload.fileName, `WhatWillIDoAllDay-${responseId}.docx`);
  const summary =
    typeof payload.summary === "string"
      ? payload.summary.slice(0, MAX_SUMMARY_CHARS)
      : "A new survey response is attached.";

  const attachments: { filename: string; content: string }[] = [
    { filename: fileName, content: docxBase64 },
  ];

  // A machine-readable copy makes it easy to pile responses into a spreadsheet
  // later without re-typing anything out of the Word documents.
  if (payload.data && typeof payload.data === "object") {
    const dataJson = JSON.stringify(payload.data, null, 2);
    if (dataJson.length < 200_000) {
      attachments.push({
        filename: fileName.replace(/\.docx$/, ".json"),
        content: base64Utf8(dataJson),
      });
    }
  }

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `What Will I Do All Day? — response ${responseId}`,
      text: summary,
      attachments,
    }),
  });

  if (!emailResponse.ok) {
    const detail = await emailResponse.text();
    console.error("Resend rejected the report", emailResponse.status, detail);
    return json({ error: "Could not send the report" }, 502);
  }

  return json({ ok: true, responseId }, 200);
}
