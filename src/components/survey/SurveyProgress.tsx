import { Check } from "lucide-react";

interface SurveyProgressProps {
  current: number;
  total: number;
  part: string;
  answeredCount: number;
}

const SurveyProgress = ({
  current,
  total,
  part,
  answeredCount,
}: SurveyProgressProps) => {
  const percent = Math.round((current / total) * 100);

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.2em] text-primary/80 font-medium">
          {part}
        </p>
        <p className="text-xs text-muted-foreground tabular-nums shrink-0">
          {current} / {total}
        </p>
      </div>
      <div
        className="h-1.5 w-full rounded-full bg-secondary overflow-hidden"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Survey progress"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--gold-dark))] to-[hsl(var(--gold-light))] transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      {answeredCount > 0 && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Check className="h-3 w-3 text-primary" aria-hidden="true" />
          {answeredCount} answered — saved on this device
        </p>
      )}
    </div>
  );
};

export default SurveyProgress;
