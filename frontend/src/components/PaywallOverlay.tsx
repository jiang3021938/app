import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lock, CreditCard, Eye } from "lucide-react";

interface PaywallOverlayProps {
  /** What the user can see in blurred state */
  previewText?: string;
  /** Number of risks found (to tease) */
  riskCount?: number;
  /** Number of amendments suggested */
  amendmentCount?: number;
}

export default function PaywallOverlay({ previewText, riskCount, amendmentCount }: PaywallOverlayProps) {
  const navigate = useNavigate();

  return (
    <div className="relative">
      {/* Blurred preview content */}
      <div className="blur-sm pointer-events-none select-none opacity-60 py-4 px-6">
        <div className="space-y-3">
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-red-100 rounded w-5/6" />
          <div className="h-4 bg-slate-200 rounded w-2/3" />
          <div className="h-4 bg-amber-100 rounded w-4/5" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-1/2" />
        </div>
      </div>

      {/* Overlay CTA */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-[2px] rounded-lg">
        <div className="text-center px-6 py-8 max-w-sm">
          <div className="h-14 w-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-7 w-7 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Unlock Full Report
          </h3>

          {/* Tease what's behind the paywall */}
          {(riskCount || amendmentCount) ? (
            <div className="space-y-1 mb-4">
              {riskCount ? (
                <p className="text-sm text-red-600 font-medium">
                  {riskCount} risk{riskCount !== 1 ? "s" : ""} identified
                </p>
              ) : null}
              {amendmentCount ? (
                <p className="text-sm text-amber-600 font-medium">
                  {amendmentCount} amendment suggestion{amendmentCount !== 1 ? "s" : ""}
                </p>
              ) : null}
            </div>
          ) : null}

          <p className="text-sm text-slate-600 mb-5">
            Get full risk details, amendment suggestions, rent benchmarking, and more.
          </p>

          <div className="space-y-2">
            <Button onClick={() => navigate("/pricing")} className="w-full gap-2">
              <CreditCard className="h-4 w-4" />
              Upgrade to See Details
            </Button>
            <p className="text-xs text-slate-400">Starting at $12 per analysis</p>
          </div>
        </div>
      </div>
    </div>
  );
}
