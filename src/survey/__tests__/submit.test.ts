import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildResponse, deliverResponse, emailSummary } from "../submit";
import { loadOutbox } from "../storage";
import type { Answers } from "../types";

const answers: Answers = {
  stage: { kind: "single", choiceId: "retiring_12m" },
  bigger_worry: { kind: "single", choiceId: "things_to_do" },
  normal_tuesday: { kind: "single", choiceId: "no_idea" },
  confidence: { kind: "scale", value: 2 },
};

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("buildResponse", () => {
  it("stamps the response with an id, the clock and the timezone", () => {
    const startedAt = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const response = buildResponse(answers, startedAt);
    expect(response.responseId).toMatch(/^[0-9a-f]{8}$/);
    expect(response.minutesTaken).toBe(5);
    expect(response.timezone).toBeTruthy();
    expect(response.answers).toBe(answers);
  });

  it("never reports a negative duration when the clock moves", () => {
    const response = buildResponse(answers, new Date(Date.now() + 60_000).toISOString());
    expect(response.minutesTaken).toBeGreaterThanOrEqual(0);
  });
});

describe("emailSummary", () => {
  it("leads with the signals that matter, for reading on a phone", () => {
    const summary = emailSummary(buildResponse(answers, new Date().toISOString()));
    expect(summary).toContain("Bigger worry: Time, not money");
    expect(summary).toContain("Day clarity: Cannot picture a normal Tuesday");
    expect(summary).toContain("Answered 4 of 15 questions");
  });
});

describe("deliverResponse", () => {
  it("posts the report to the endpoint and reports it sent", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = buildResponse(answers, new Date().toISOString());
    const result = await deliverResponse(response);

    expect(result.status).toBe("sent");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(init.body as string);
    expect(body.fileName).toMatch(/\.docx$/);
    expect(body.docxBase64.length).toBeGreaterThan(1000);
    expect(body.data.bigger_worry).toBe("Running out of things to do");
    expect(loadOutbox()).toHaveLength(0);
  });

  it("keeps the response for a later retry when the endpoint is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    const response = buildResponse(answers, new Date().toISOString());
    const result = await deliverResponse(response);

    expect(result.status).toBe("queued");
    expect(loadOutbox().map((queued) => queued.responseId)).toEqual([
      response.responseId,
    ]);
  });

  it("treats a server error as undelivered rather than losing the answers", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("nope", { status: 503 })),
    );

    const result = await deliverResponse(
      buildResponse(answers, new Date().toISOString()),
    );

    expect(result.status).toBe("queued");
    expect(result.error).toContain("503");
    expect(loadOutbox()).toHaveLength(1);
  });
});
