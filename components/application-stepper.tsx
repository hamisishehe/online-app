import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

export function ApplicationStepper({
  steps,
  currentStep,
  className,
}: {
  steps: { title: string; complete: boolean }[];
  currentStep: number;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border bg-background/60 p-4 shadow-sm", className)}>
      <ol className="flex items-center">
        {steps.map((step, idx) => {
          const number = idx + 1;
          const isCurrent = number === currentStep;
          const isDone = step.complete;
          const isPast = number < currentStep || isDone;

          return (
            <li key={step.title} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full border bg-background text-sm font-semibold",
                    isDone
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : isCurrent
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/25 text-muted-foreground"
                  )}
                >
                  {isDone ? <CheckIcon className="size-4" /> : number}
                </div>
                <div
                  className={cn(
                    "text-center text-xs font-medium",
                    isCurrent ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </div>
              </div>

              {idx !== steps.length - 1 ? (
                <div
                  className={cn(
                    "mx-2 h-0.5 flex-1 rounded-full",
                    isPast ? "bg-emerald-500" : "bg-border"
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
