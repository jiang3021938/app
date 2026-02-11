import { useEffect, useState } from "react";
import { CheckCircle, FileSearch, Brain, Shield, BarChart3, Loader2 } from "lucide-react";

interface AnalysisProgressProps {
  /** Whether analysis is currently running */
  active: boolean;
  /** Called when all visual steps complete (so parent can navigate) */
  onStepsComplete?: () => void;
}

const STEPS = [
  { icon: FileSearch, label: "Extracting document text", sublabel: "Parsing pages and tables...", duration: 2500 },
  { icon: Brain, label: "AI analyzing lease terms", sublabel: "Identifying key clauses...", duration: 3000 },
  { icon: Shield, label: "Running compliance checks", sublabel: "Checking state regulations...", duration: 2000 },
  { icon: BarChart3, label: "Generating risk assessment", sublabel: "Scoring and benchmarking...", duration: 2000 },
];

export default function AnalysisProgress({ active, onStepsComplete }: AnalysisProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!active) {
      setCurrentStep(0);
      return;
    }

    let stepIndex = 0;
    const advance = () => {
      if (stepIndex < STEPS.length) {
        setCurrentStep(stepIndex + 1);
        stepIndex++;
        if (stepIndex < STEPS.length) {
          setTimeout(advance, STEPS[stepIndex - 1].duration);
        } else {
          // All done
          setTimeout(() => {
            onStepsComplete?.();
          }, 800);
        }
      }
    };

    const timer = setTimeout(advance, 600);
    return () => clearTimeout(timer);
  }, [active]);

  if (!active) return null;

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-3">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-sm font-medium text-blue-700">Analysis in progress</span>
        </div>
        <p className="text-slate-500 text-sm">This usually takes 15-30 seconds</p>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isComplete = currentStep > idx;
          const isCurrent = currentStep === idx + 1 && !isComplete;
          const isPending = currentStep <= idx;

          return (
            <div
              key={idx}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 ${
                isComplete
                  ? "bg-green-50 border border-green-200"
                  : isCurrent
                  ? "bg-blue-50 border border-blue-200 shadow-sm"
                  : "bg-slate-50 border border-transparent opacity-40"
              }`}
            >
              <div
                className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  isComplete
                    ? "bg-green-100"
                    : isCurrent
                    ? "bg-blue-100"
                    : "bg-slate-200"
                }`}
              >
                {isComplete ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : isCurrent ? (
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                ) : (
                  <Icon className="h-5 w-5 text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium transition-colors ${
                    isComplete ? "text-green-800" : isCurrent ? "text-blue-800" : "text-slate-500"
                  }`}
                >
                  {step.label}
                </p>
                {(isCurrent || isComplete) && (
                  <p
                    className={`text-xs mt-0.5 ${
                      isComplete ? "text-green-600" : "text-blue-500"
                    }`}
                  >
                    {isComplete ? "Complete" : step.sublabel}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
