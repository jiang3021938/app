import { useEffect, useState, useRef } from "react";

interface LeaseHealthScoreProps {
  /** Overall score 0-100 */
  score: number;
  /** Size of the gauge in pixels */
  size?: number;
  /** Whether to animate on appear */
  animate?: boolean;
  /** Label below score */
  label?: string;
}

/**
 * Circular gauge component displaying a lease health score.
 * Score 0-40 = red, 40-70 = amber, 70-100 = green
 */
export default function LeaseHealthScore({
  score,
  size = 180,
  animate = true,
  label = "Lease Health Score",
}: LeaseHealthScoreProps) {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Animate score on scroll into view
  useEffect(() => {
    if (!animate || hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          const duration = 1500;
          const startTime = performance.now();

          const tick = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayScore(Math.round(eased * score));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [score, animate, hasAnimated]);

  // Colors based on score
  const getColor = (s: number) => {
    if (s >= 75) return { stroke: "#16a34a", bg: "#f0fdf4", text: "#15803d", label: "Excellent" };
    if (s >= 55) return { stroke: "#2563eb", bg: "#eff6ff", text: "#1d4ed8", label: "Good" };
    if (s >= 35) return { stroke: "#d97706", bg: "#fffbeb", text: "#b45309", label: "Fair" };
    return { stroke: "#dc2626", bg: "#fef2f2", text: "#b91c1c", label: "Needs Attention" };
  };

  const colors = getColor(displayScore);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - displayScore / 100);
  const center = size / 2;

  return (
    <div ref={ref} className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="10"
          />
          {/* Score arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: animate ? "none" : "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-bold leading-none"
            style={{ fontSize: size * 0.28, color: colors.text }}
          >
            {displayScore}
          </span>
          <span className="text-slate-400" style={{ fontSize: size * 0.08 }}>
            / 100
          </span>
          <span
            className="font-semibold mt-1 px-2 py-0.5 rounded-full"
            style={{
              fontSize: size * 0.075,
              color: colors.text,
              backgroundColor: colors.bg,
            }}
          >
            {colors.label}
          </span>
        </div>
      </div>
      {label && (
        <p className="text-sm font-medium text-slate-500">{label}</p>
      )}
    </div>
  );
}

/**
 * Utility: Calculate health score from extraction data.
 * This mimics the backend calculation for client-side use.
 */
export function calculateHealthScore(
  riskFlags: { severity: string }[],
  complianceData?: { summary?: { violations: number; warnings: number; compliant: number } } | null,
  extraction?: Record<string, unknown> | null
): number {
  let score = 100;

  // Deduct for risks
  for (const risk of riskFlags) {
    if (risk.severity === "high") score -= 15;
    else if (risk.severity === "medium") score -= 8;
    else score -= 3;
  }

  // Deduct for compliance issues
  if (complianceData?.summary) {
    score -= complianceData.summary.violations * 12;
    score -= complianceData.summary.warnings * 5;
  }

  // Deduct for missing fields (completeness)
  if (extraction) {
    const importantFields = [
      "tenant_name", "landlord_name", "property_address",
      "monthly_rent", "security_deposit", "lease_start_date",
      "lease_end_date", "pet_policy", "late_fee_terms",
    ];
    const missing = importantFields.filter((f) => !extraction[f]);
    score -= missing.length * 3;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}