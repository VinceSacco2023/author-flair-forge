import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Survey from "../Survey";
import { questions } from "@/survey/questions";
import { loadDraft, loadOutbox } from "@/survey/storage";

function renderSurvey() {
  return render(
    <MemoryRouter>
      <Survey />
    </MemoryRouter>,
  );
}

/** Walks from the intro to the review screen, answering nothing else. */
async function walkToReview(user: ReturnType<typeof userEvent.setup>) {
  for (let index = 0; index < questions.length; index++) {
    const button = screen.getByRole("button", {
      name: index === questions.length - 1 ? /review/i : /continue/i,
    });
    await user.click(button);
  }
  await screen.findByText(/one last look/i);
}

beforeEach(() => {
  window.localStorage.clear();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 200 })));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Survey", () => {
  it("opens on the introduction with the promises from the paper survey", () => {
    renderSurvey();
    expect(
      screen.getByRole("heading", { name: /what will i do all day\?/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/about four minutes/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/15 questions/i)).toBeInTheDocument();
  });

  it("moves on by itself once a single-choice answer is tapped", async () => {
    const user = userEvent.setup();
    renderSurvey();
    await user.click(screen.getByRole("button", { name: /start the survey/i }));

    await screen.findByRole("heading", {
      name: /where are you in the retirement process/i,
    });

    await user.click(
      await screen.findByRole("button", { name: /retiring within the next 12 months/i }),
    );

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /what kind of work did you do/i }),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText("2 / 15")).toBeInTheDocument();
  });

  it("keeps several answers on a tick-all-that-apply question", async () => {
    const user = userEvent.setup();
    renderSurvey();
    await user.click(screen.getByRole("button", { name: /start the survey/i }));

    // Question 7 is the first multi-select.
    for (let index = 0; index < 6; index++) {
      await user.click(screen.getByRole("button", { name: /continue/i }));
    }
    await screen.findByRole("heading", { name: /never want to do again/i });

    await user.click(screen.getByRole("button", { name: /^commuting$/i }));
    await user.click(screen.getByRole("button", { name: /^meetings$/i }));
    expect(screen.getByRole("button", { name: /^commuting$/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /^meetings$/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    // "Nothing — I liked my job" contradicts the rest, so it clears them.
    await user.click(screen.getByRole("button", { name: /nothing — i liked my job/i }));
    expect(screen.getByRole("button", { name: /^commuting$/i })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("saves progress so the survey can be resumed later", async () => {
    const user = userEvent.setup();
    const { unmount } = renderSurvey();
    await user.click(screen.getByRole("button", { name: /start the survey/i }));
    await user.click(
      await screen.findByRole("button", { name: /retired more than two years ago/i }),
    );
    // Wait until the answer has been stored and the survey has moved on.
    await screen.findByRole("heading", { name: /what kind of work did you do/i });
    await waitFor(() => expect(loadDraft()?.step).toBe(1));

    unmount();
    renderSurvey();
    const resume = await screen.findByRole("button", {
      name: /continue where you left off \(1 answered\)/i,
    });
    await user.click(resume);

    // Back on the question they left, with the earlier answer still selected.
    await screen.findByRole("heading", { name: /what kind of work did you do/i });
    await user.click(screen.getByRole("button", { name: /back/i }));
    expect(
      await screen.findByRole("button", { name: /retired more than two years ago/i }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("lets an answer be changed from the review screen", async () => {
    const user = userEvent.setup();
    renderSurvey();
    await user.click(screen.getByRole("button", { name: /start the survey/i }));
    await walkToReview(user);

    // Nothing was answered on the way through, so every row reads "Skipped".
    expect(screen.getAllByText(/skipped/i)).toHaveLength(questions.length);

    await user.click(
      screen.getByRole("button", { name: /where are you in the retirement process/i }),
    );
    await screen.findByRole("heading", {
      name: /where are you in the retirement process/i,
    });
    await user.click(
      await screen.findByRole("button", {
        name: /^retired within the last two years$/i,
      }),
    );
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /what kind of work did you do/i }))
        .toBeInTheDocument(),
    );
  });

  it("sends the report and confirms delivery at the end", async () => {
    const user = userEvent.setup();
    renderSurvey();
    await user.click(screen.getByRole("button", { name: /start the survey/i }));
    await walkToReview(user);

    await user.click(screen.getByRole("button", { name: /send my answers/i }));

    await screen.findByText(/thank you — that is the whole survey/i);
    expect(screen.getByText(/on their way to vincenzo/i)).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      "/api/send-report",
      expect.objectContaining({ method: "POST" }),
    );
    // The draft is cleared once the answers are safely on their way.
    expect(loadDraft()).toBeNull();
  });

  it("holds the answers on the device when delivery fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const user = userEvent.setup();
    renderSurvey();
    await user.click(screen.getByRole("button", { name: /start the survey/i }));
    await walkToReview(user);

    await user.click(screen.getByRole("button", { name: /send my answers/i }));

    await screen.findByText(/saved on this device/i);
    expect(loadOutbox()).toHaveLength(1);
  });
});
