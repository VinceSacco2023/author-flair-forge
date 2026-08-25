import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Lock, RotateCcw } from "lucide-react";
import {
  SURVEY_INTRO,
  SURVEY_SUBTITLE,
  SURVEY_TITLE,
  questions,
} from "@/survey/questions";

interface IntroScreenProps {
  onStart: () => void;
  onResume?: () => void;
  resumeAnswered?: number;
}

const IntroScreen = ({ onStart, onResume, resumeAnswered = 0 }: IntroScreenProps) => (
  <div className="space-y-8">
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-[0.25em] text-primary font-medium">
        {SURVEY_SUBTITLE}
      </p>
      <h1 className="font-display text-4xl sm:text-5xl leading-[1.1] text-foreground">
        {SURVEY_TITLE}
      </h1>
    </div>

    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
      <span className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
        About four minutes
      </span>
      <span className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-primary" aria-hidden="true" />
        Anonymous unless you say otherwise
      </span>
    </div>

    <div className="space-y-4">
      {SURVEY_INTRO.map((paragraph) => (
        <p key={paragraph} className="text-base leading-relaxed text-foreground/80">
          {paragraph}
        </p>
      ))}
    </div>

    <div className="space-y-3">
      {onResume && resumeAnswered > 0 && (
        <Button
          size="lg"
          onClick={onResume}
          className="w-full h-14 text-base gap-2"
        >
          <RotateCcw className="h-5 w-5" aria-hidden="true" />
          Continue where you left off ({resumeAnswered} answered)
        </Button>
      )}
      <Button
        size="lg"
        variant={onResume && resumeAnswered > 0 ? "outline" : "default"}
        onClick={onStart}
        className={
          onResume && resumeAnswered > 0
            ? "w-full h-14 text-base gap-2 border-border hover:border-primary/60 hover:bg-primary/10 hover:text-foreground"
            : "w-full h-14 text-base gap-2"
        }
      >
        {onResume && resumeAnswered > 0 ? "Start again from question 1" : "Start the survey"}
        <ArrowRight className="h-5 w-5" aria-hidden="true" />
      </Button>
      <p className="text-xs text-center text-muted-foreground">
        {questions.length} questions · skip anything you would rather not answer
      </p>
    </div>
  </div>
);

export default IntroScreen;
