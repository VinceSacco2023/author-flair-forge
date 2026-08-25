import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, Share2, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { CLOSING_NOTE } from "@/survey/questions";
import { downloadReport, shareReport } from "@/survey/submit";
import type { DeliveryResult } from "@/survey/submit";

interface DoneScreenProps {
  result: DeliveryResult;
}

const DoneScreen = ({ result }: DoneScreenProps) => {
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  return (
    <div className="space-y-8 text-center">
      <div className="space-y-4">
        <CheckCircle2
          className="h-14 w-14 mx-auto text-primary"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <h2 className="font-display text-3xl text-foreground">
          Thank you — that is the whole survey.
        </h2>
        <p className="text-base text-foreground/80 leading-relaxed">
          {result.status === "sent"
            ? "Your answers are on their way to Vincenzo as a Word report."
            : "Your answers are saved on this device and will be sent automatically the next time you open this page with a connection."}
        </p>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">{CLOSING_NOTE}</p>

      <div className="space-y-3">
        <Button
          variant="outline"
          size="lg"
          onClick={() => downloadReport(result.response)}
          className="w-full h-14 text-base gap-2 border-border hover:border-primary/60 hover:bg-primary/10 hover:text-foreground"
        >
          <Download className="h-5 w-5" aria-hidden="true" />
          Download my answers (Word)
        </Button>
        {canShare && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              void shareReport(result.response).then((shared) => {
                if (!shared) downloadReport(result.response);
              });
            }}
            className="w-full h-14 text-base gap-2 border-border hover:border-primary/60 hover:bg-primary/10 hover:text-foreground"
          >
            <Share2 className="h-5 w-5" aria-hidden="true" />
            Share my answers
          </Button>
        )}
        <Button asChild variant="ghost" size="lg" className="w-full h-12 gap-2 hover:bg-secondary hover:text-foreground">
          <Link to="/">
            <Home className="h-4 w-4" aria-hidden="true" />
            Back to the books
          </Link>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Reference {result.response.responseId}
      </p>
    </div>
  );
};

export default DoneScreen;
