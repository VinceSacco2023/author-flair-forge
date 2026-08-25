import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import SurveyProgress from "@/components/survey/SurveyProgress";
import QuestionScreen from "@/components/survey/QuestionScreen";
import IntroScreen from "@/components/survey/IntroScreen";
import ReviewScreen from "@/components/survey/ReviewScreen";
import DoneScreen from "@/components/survey/DoneScreen";
import { questions, SURVEY_TITLE } from "@/survey/questions";
import { answeredCount, isAnswered } from "@/survey/answers";
import {
  clearDraft,
  loadDraft,
  loadOutbox,
  saveDraft,
  type SurveyDraft,
} from "@/survey/storage";
import { buildResponse, deliverResponse, flushOutbox } from "@/survey/submit";
import type { Answer, Answers } from "@/survey/types";
import type { DeliveryResult } from "@/survey/submit";

type Phase = "intro" | "question" | "review" | "done";

const AUTO_ADVANCE_MS = 260;

const Survey = () => {
  const [phase, setPhase] = useState<Phase>("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());
  const [draft, setDraft] = useState<SurveyDraft | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<DeliveryResult | null>(null);
  const [direction, setDirection] = useState(1);
  const advanceTimer = useRef<ReturnType<typeof setTimeout>>();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = `${SURVEY_TITLE} — survey`;
    setDraft(loadDraft());
    // Anything a previous visit could not deliver goes out now.
    const pending = loadOutbox();
    if (pending.length > 0) void flushOutbox(pending);
    return () => clearTimeout(advanceTimer.current);
  }, []);

  // Persist after every change so a dropped call or a locked phone costs nothing.
  useEffect(() => {
    if (phase !== "question" && phase !== "review") return;
    saveDraft({
      answers,
      step,
      startedAt,
      updatedAt: new Date().toISOString(),
    });
  }, [answers, step, phase, startedAt]);

  useEffect(() => {
    scrollRef.current?.scrollTo?.({ top: 0, behavior: "auto" });
    window.scrollTo?.({ top: 0, behavior: "auto" });
  }, [step, phase]);

  const question = questions[step];
  const total = questions.length;
  const answered = useMemo(() => answeredCount(answers), [answers]);

  const goTo = useCallback((nextStep: number, nextDirection: number) => {
    clearTimeout(advanceTimer.current);
    setDirection(nextDirection);
    setStep(nextStep);
  }, []);

  const goNext = useCallback(() => {
    if (step >= total - 1) {
      clearTimeout(advanceTimer.current);
      setDirection(1);
      setPhase("review");
      return;
    }
    goTo(step + 1, 1);
  }, [goTo, step, total]);

  const goBack = useCallback(() => {
    if (step === 0) {
      setPhase("intro");
      return;
    }
    goTo(step - 1, -1);
  }, [goTo, step]);

  // Keeps handleChange stable while still writing to the current question.
  const stepRef = useRef(step);
  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  const handleChange = useCallback((answer: Answer) => {
    setAnswers((previous) => ({ ...previous, [questions[stepRef.current].id]: answer }));
  }, []);

  const handleAdvance = useCallback(() => {
    clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(goNext, AUTO_ADVANCE_MS);
  }, [goNext]);

  const startFresh = () => {
    clearTimeout(advanceTimer.current);
    setAnswers({});
    setStep(0);
    setStartedAt(new Date().toISOString());
    setDirection(1);
    setPhase("question");
  };

  const resume = () => {
    if (!draft) return startFresh();
    setAnswers(draft.answers);
    setStep(Math.min(Math.max(draft.step, 0), total - 1));
    setStartedAt(draft.startedAt);
    setDirection(1);
    setPhase("question");
  };

  const submit = async () => {
    setSubmitting(true);
    const response = buildResponse(answers, startedAt);
    const delivery = await deliverResponse(response);
    clearDraft();
    setResult(delivery);
    setPhase("done");
    setSubmitting(false);
  };

  const currentAnswered = isAnswered(answers[question?.id ?? ""]);

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-md border-b border-border/60">
        <div className="mx-auto w-full max-w-2xl px-5 py-3 flex items-center gap-4">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 shrink-0"
            aria-label="Leave the survey"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Exit</span>
          </Link>
          <div className="flex-1 min-w-0">
            {phase === "question" && question ? (
              <SurveyProgress
                current={step + 1}
                total={total}
                part={question.part}
                answeredCount={answered}
              />
            ) : (
              <p className="font-display text-base text-foreground/80 truncate">
                {SURVEY_TITLE}
              </p>
            )}
          </div>
        </div>
      </header>

      <main
        ref={scrollRef}
        className="flex-1 w-full mx-auto max-w-2xl px-5 py-8 pb-40 sm:pb-32"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${phase}-${phase === "question" ? step : ""}`}
            initial={{ opacity: 0, x: direction * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -24 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {phase === "intro" && (
              <IntroScreen
                onStart={startFresh}
                onResume={draft ? resume : undefined}
                resumeAnswered={draft ? answeredCount(draft.answers) : 0}
              />
            )}
            {phase === "question" && question && (
              <QuestionScreen
                question={question}
                answer={answers[question.id]}
                onChange={handleChange}
                onAdvance={handleAdvance}
              />
            )}
            {phase === "review" && (
              <ReviewScreen
                answers={answers}
                submitting={submitting}
                onEdit={(index) => {
                  setDirection(-1);
                  setStep(index);
                  setPhase("question");
                }}
                onSubmit={() => void submit()}
              />
            )}
            {phase === "done" && result && <DoneScreen result={result} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {phase === "question" && (
        <div className="fixed bottom-0 inset-x-0 z-20 border-t border-border/60 bg-background/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto w-full max-w-2xl px-5 py-3 flex items-center gap-3">
            <Button
              variant="ghost"
              size="lg"
              onClick={goBack}
              className="h-12 px-4 gap-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Button>
            <div className="flex-1" />
            {!currentAnswered && (
              <Button
                variant="ghost"
                size="lg"
                onClick={goNext}
                className="h-12 px-4 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                Skip
              </Button>
            )}
            <Button size="lg" onClick={goNext} className="h-12 px-6 gap-2 min-w-[130px]">
              {step === total - 1 ? "Review" : "Continue"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}

      {submitting && (
        <div className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
            <p className="text-sm">Building your report…</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Survey;
