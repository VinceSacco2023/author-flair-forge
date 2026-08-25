import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import ChoiceRow from "./ChoiceRow";
import { emptyAnswerFor } from "@/survey/answers";
import type {
  Answer,
  ContactAnswer,
  DetailsAnswer,
  MultiAnswer,
  Question,
  SingleAnswer,
} from "@/survey/types";

interface QuestionScreenProps {
  question: Question;
  answer: Answer | undefined;
  onChange: (answer: Answer) => void;
  /** Called when a single-choice pick should move the survey forward. */
  onAdvance: () => void;
}

const QuestionScreen = ({
  question,
  answer,
  onChange,
  onAdvance,
}: QuestionScreenProps) => {
  const current = answer ?? emptyAnswerFor(question);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Do not steal focus on touch devices — an auto-opening keyboard hides
    // the question you are meant to be reading.
    if (question.kind === "text" && window.matchMedia("(min-width: 768px)").matches) {
      textRef.current?.focus();
    }
  }, [question.id, question.kind]);

  const renderSingle = () => {
    if (question.kind !== "single") return null;
    const value = current as SingleAnswer;
    return (
      <div className="space-y-2.5">
        {question.choices.map((choice) => {
          const selected = value.choiceId === choice.id;
          return (
            <ChoiceRow
              key={choice.id}
              label={choice.label}
              selected={selected}
              onSelect={() => {
                onChange({
                  kind: "single",
                  choiceId: choice.id,
                  otherText: choice.allowsText ? value.otherText : undefined,
                });
                if (!choice.allowsText) onAdvance();
              }}
            >
              {choice.allowsText && selected && (
                <Input
                  autoFocus
                  value={value.otherText ?? ""}
                  onChange={(event) =>
                    onChange({
                      kind: "single",
                      choiceId: choice.id,
                      otherText: event.target.value,
                    })
                  }
                  placeholder="Tell me what it was"
                  className="mt-2 h-12 text-base"
                />
              )}
            </ChoiceRow>
          );
        })}
      </div>
    );
  };

  const renderMulti = () => {
    if (question.kind !== "multi") return null;
    const value = current as MultiAnswer;
    const exclusive = question.exclusiveChoiceIds ?? [];
    const toggle = (choiceId: string) => {
      const isExclusive = exclusive.includes(choiceId);
      let next: string[];
      if (value.choiceIds.includes(choiceId)) {
        next = value.choiceIds.filter((id) => id !== choiceId);
      } else if (isExclusive) {
        next = [choiceId];
      } else {
        next = [...value.choiceIds.filter((id) => !exclusive.includes(id)), choiceId];
      }
      onChange({ kind: "multi", choiceIds: next, otherText: value.otherText });
    };
    return (
      <div className="space-y-2.5">
        {question.choices.map((choice) => {
          const selected = value.choiceIds.includes(choice.id);
          return (
            <ChoiceRow
              key={choice.id}
              multi
              label={choice.label}
              selected={selected}
              onSelect={() => toggle(choice.id)}
            >
              {choice.allowsText && selected && (
                <Input
                  autoFocus
                  value={value.otherText ?? ""}
                  onChange={(event) =>
                    onChange({
                      kind: "multi",
                      choiceIds: value.choiceIds,
                      otherText: event.target.value,
                    })
                  }
                  placeholder="Tell me what it is"
                  className="mt-2 h-12 text-base"
                />
              )}
            </ChoiceRow>
          );
        })}
      </div>
    );
  };

  const renderText = () => {
    if (question.kind !== "text") return null;
    const value = current as { text: string };
    return (
      <div className="space-y-2">
        <Textarea
          ref={textRef}
          value={value.text}
          rows={question.rows}
          placeholder={question.placeholder}
          onChange={(event) => onChange({ kind: "text", text: event.target.value })}
          className="text-base leading-relaxed resize-y min-h-[160px]"
        />
        <p className="text-xs text-muted-foreground text-right tabular-nums">
          {value.text.trim() ? `${value.text.trim().split(/\s+/).length} words` : " "}
        </p>
      </div>
    );
  };

  const renderScale = () => {
    if (question.kind !== "scale") return null;
    const value = current as { value: number };
    const options = Array.from(
      { length: question.max - question.min + 1 },
      (_, index) => question.min + index,
    );
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-5 gap-2">
          {options.map((option) => {
            const selected = value.value === option;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={selected}
                aria-label={`${option} out of ${question.max}`}
                onClick={() => {
                  onChange({ kind: "scale", value: option });
                  onAdvance();
                }}
                className={cn(
                  "aspect-square rounded-xl border text-xl font-medium transition-all duration-200",
                  "active:scale-95 touch-manipulation",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground/80 hover:border-primary/50",
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
        <div className="flex justify-between gap-4 text-xs text-muted-foreground">
          <span>{question.minLabel}</span>
          <span className="text-right">{question.maxLabel}</span>
        </div>
      </div>
    );
  };

  const renderDetails = () => {
    if (question.kind !== "details") return null;
    const value = current as DetailsAnswer;
    const update = (patch: Partial<DetailsAnswer>) =>
      onChange({ ...value, kind: "details", ...patch });
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-2">
            <span className="text-sm text-muted-foreground">Age</span>
            <Input
              inputMode="numeric"
              value={value.age}
              onChange={(event) => update({ age: event.target.value })}
              placeholder="e.g. 62"
              className="h-12 text-base"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm text-muted-foreground">Years in main career</span>
            <Input
              inputMode="numeric"
              value={value.careerYears}
              onChange={(event) => update({ careerYears: event.target.value })}
              placeholder="e.g. 30"
              className="h-12 text-base"
            />
          </label>
        </div>
        <div className="space-y-2">
          <span className="text-sm text-muted-foreground">
            Do you live with a partner?
          </span>
          <div className="grid grid-cols-2 gap-3">
            {(["yes", "no"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={value.livesWithPartner === option}
                onClick={() =>
                  update({
                    livesWithPartner: value.livesWithPartner === option ? "" : option,
                  })
                }
                className={cn(
                  "h-12 rounded-xl border text-base capitalize transition-all",
                  value.livesWithPartner === option
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/50",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <label className="space-y-2 block">
          <span className="text-sm text-muted-foreground">State or region</span>
          <Input
            value={value.region}
            onChange={(event) => update({ region: event.target.value })}
            placeholder="e.g. Ohio, or Lombardy"
            className="h-12 text-base"
          />
        </label>
      </div>
    );
  };

  const renderContact = () => {
    if (question.kind !== "contact") return null;
    const value = current as ContactAnswer;
    return (
      <div className="space-y-4">
        <label className="space-y-2 block">
          <span className="text-sm text-muted-foreground">Email</span>
          <Input
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            value={value.email}
            onChange={(event) =>
              onChange({ ...value, kind: "contact", email: event.target.value })
            }
            placeholder="you@example.com"
            className="h-12 text-base"
          />
        </label>
        <ChoiceRow
          multi
          label={question.consentLabel}
          selected={value.consent}
          onSelect={() =>
            onChange({ ...value, kind: "contact", consent: !value.consent })
          }
        />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Leave this blank to stay completely anonymous. Your answers still count.
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-display text-2xl sm:text-3xl leading-tight text-foreground">
          <span className="text-primary mr-2 tabular-nums">{question.number}.</span>
          {question.title}
        </h2>
        {question.help && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {question.help}
          </p>
        )}
      </div>
      {renderSingle()}
      {renderMulti()}
      {renderText()}
      {renderScale()}
      {renderDetails()}
      {renderContact()}
    </div>
  );
};

export default QuestionScreen;
