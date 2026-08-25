import { Button } from "@/components/ui/button";
import { Pencil, Send } from "lucide-react";
import { PARTS, questions } from "@/survey/questions";
import { formatAnswer, isAnswered } from "@/survey/answers";
import type { Answers } from "@/survey/types";

interface ReviewScreenProps {
  answers: Answers;
  onEdit: (index: number) => void;
  onSubmit: () => void;
  submitting: boolean;
}

const ReviewScreen = ({
  answers,
  onEdit,
  onSubmit,
  submitting,
}: ReviewScreenProps) => (
  <div className="space-y-8">
    <div className="space-y-2">
      <h2 className="font-display text-3xl text-foreground">One last look</h2>
      <p className="text-sm text-muted-foreground">
        Tap any answer to change it. Nothing is sent until you press the button at
        the bottom.
      </p>
    </div>

    <div className="space-y-6">
      {PARTS.map((part) => {
        const partQuestions = questions.filter((question) => question.part === part);
        if (partQuestions.length === 0) return null;
        return (
          <div key={part} className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-primary/80">{part}</p>
            <ul className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
              {partQuestions.map((question) => {
                const index = questions.indexOf(question);
                const answered = isAnswered(answers[question.id]);
                return (
                  <li key={question.id}>
                    <button
                      type="button"
                      onClick={() => onEdit(index)}
                      className="w-full text-left px-4 py-3.5 flex gap-3 items-start hover:bg-secondary/50 transition-colors min-h-[56px]"
                    >
                      <span className="flex-1 space-y-1">
                        <span className="block text-sm text-muted-foreground leading-snug">
                          {question.number}. {question.title}
                        </span>
                        <span
                          className={
                            answered
                              ? "block text-base text-foreground leading-snug whitespace-pre-line"
                              : "block text-base text-muted-foreground/60 italic"
                          }
                        >
                          {answered ? formatAnswer(question, answers[question.id]) : "Skipped"}
                        </span>
                      </span>
                      <Pencil
                        className="h-4 w-4 text-muted-foreground shrink-0 mt-1"
                        aria-hidden="true"
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>

    <Button
      size="lg"
      onClick={onSubmit}
      disabled={submitting}
      className="w-full h-14 text-base gap-2"
    >
      <Send className="h-5 w-5" aria-hidden="true" />
      {submitting ? "Sending your answers…" : "Send my answers"}
    </Button>
  </div>
);

export default ReviewScreen;
