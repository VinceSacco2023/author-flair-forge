import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { ReactNode } from "react";

interface ChoiceRowProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
  /** Checkbox-style marker for "tick all that apply" questions. */
  multi?: boolean;
  children?: ReactNode;
}

/**
 * A single tappable answer. Sized for a thumb on a phone (56px+ tall) and
 * still comfortable with a mouse.
 */
const ChoiceRow = ({
  label,
  selected,
  onSelect,
  multi = false,
  children,
}: ChoiceRowProps) => (
  <div>
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "w-full flex items-center gap-3 rounded-xl border px-4 py-4 text-left transition-all duration-200",
        "min-h-[56px] active:scale-[0.99] touch-manipulation",
        selected
          ? "border-primary bg-primary/10 text-foreground shadow-[0_0_0_1px_hsl(var(--primary)/0.4)]"
          : "border-border bg-card text-foreground/90 hover:border-primary/50 hover:bg-secondary/60",
      )}
    >
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center border transition-colors",
          multi ? "rounded-md" : "rounded-full",
          selected ? "border-primary bg-primary" : "border-muted-foreground/50",
        )}
        aria-hidden="true"
      >
        {selected && (
          <Check className="h-4 w-4 text-primary-foreground" strokeWidth={3} />
        )}
      </span>
      <span className="text-base leading-snug">{label}</span>
    </button>
    {children}
  </div>
);

export default ChoiceRow;
