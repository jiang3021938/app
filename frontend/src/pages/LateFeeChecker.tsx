import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Info,
  DollarSign,
  Clock,
  Shield,
  Scale,
  MapPin,
  TrendingUp,
} from "lucide-react";

interface StateRule {
  gracePeriodDays: number | null;
  maxFeePercent: number | null;
  maxFeeFlat: number | null;
  description: string;
  special: string;
}

const stateRules: Record<string, StateRule> = {
  Alabama: {
    gracePeriodDays: null,
    maxFeePercent: null,
    maxFeeFlat: null,
    description: "No specific statutory limit; late fees must be reasonable.",
    special: "Courts may void fees deemed punitive rather than compensatory.",
  },
  Arizona: {
    gracePeriodDays: null,
    maxFeePercent: null,
    maxFeeFlat: null,
    description: "No statutory cap; must be a reasonable estimate of damages.",
    special: "Landlord must disclose late fee policy in the lease agreement.",
  },
  California: {
    gracePeriodDays: null,
    maxFeePercent: 10,
    maxFeeFlat: null,
    description: "No mandated grace period, but late fees must be \"reasonable\" — typically 5–10% of rent.",
    special: "Courts have struck down fees exceeding 10% as punitive liquidated damages.",
  },
  Colorado: {
    gracePeriodDays: 7,
    maxFeePercent: null,
    maxFeeFlat: 50,
    description: "Grace period of 7 days required; late fee cannot exceed the greater of $50 or 5% of rent.",
    special: "Effective 2023, landlords must provide written notice before charging.",
  },
  Connecticut: {
    gracePeriodDays: 9,
    maxFeePercent: null,
    maxFeeFlat: null,
    description: "9-day grace period required; late fee must be reasonable.",
    special: "Grace period applies to rent due on or before the first of the month.",
  },
  Delaware: {
    gracePeriodDays: 5,
    maxFeePercent: 5,
    maxFeeFlat: null,
    description: "5-day grace period required; maximum late fee is 5% of monthly rent.",
    special: "Late fee must be specified in the lease agreement.",
  },
  Florida: {
    gracePeriodDays: null,
    maxFeePercent: null,
    maxFeeFlat: null,
    description: "No statutory grace period or cap; fee must be reasonable.",
    special: "Late fee must be disclosed in the lease; courts look at reasonableness.",
  },
  Georgia: {
    gracePeriodDays: null,
    maxFeePercent: null,
    maxFeeFlat: null,
    description: "No specific statutory limits on late fees.",
    special: "Landlord must include late fee terms in a written lease.",
  },
  Illinois: {
    gracePeriodDays: 5,
    maxFeePercent: null,
    maxFeeFlat: null,
    description: "5-day grace period required; fee must be reasonable.",
    special: "Chicago has additional tenant protections that may apply.",
  },
  Maine: {
    gracePeriodDays: 15,
    maxFeePercent: 4,
    maxFeeFlat: null,
    description: "15-day grace period required; maximum late fee is 4% of monthly rent.",
    special: "One of the most tenant-friendly states for grace periods.",
  },
  Maryland: {
    gracePeriodDays: null,
    maxFeePercent: 5,
    maxFeeFlat: null,
    description: "Maximum late fee is 5% of monthly rent.",
    special: "No grace period is required by state law, but many jurisdictions impose one.",
  },
  Massachusetts: {
    gracePeriodDays: 30,
    maxFeePercent: null,
    maxFeeFlat: null,
    description: "30-day grace period required; late fee cannot exceed the actual costs incurred.",
    special: "One of the strictest states — landlords rarely can charge a late fee in practice.",
  },
  Nevada: {
    gracePeriodDays: 3,
    maxFeePercent: 5,
    maxFeeFlat: null,
    description: "3-day grace period for weekly tenancies; max 5% of rent for late fees.",
    special: "Late fee rules differ for weekly vs. monthly tenancies.",
  },
  "New Jersey": {
    gracePeriodDays: 5,
    maxFeePercent: null,
    maxFeeFlat: null,
    description: "5-day grace period required; late fee must be reasonable.",
    special: "Courts generally consider fees above 5–6% of rent to be unreasonable.",
  },
  "New York": {
    gracePeriodDays: 5,
    maxFeePercent: 5,
    maxFeeFlat: 50,
    description: "5-day grace period; late fee limited to $50 or 5% of rent, whichever is less.",
    special: "For buildings with 6+ units, additional tenant protections apply.",
  },
  "North Carolina": {
    gracePeriodDays: 5,
    maxFeePercent: 5,
    maxFeeFlat: 15,
    description: "5-day grace period; max late fee is $15 or 5% of rent, whichever is greater.",
    special: "Late fee cannot be charged before the grace period expires.",
  },
  Oregon: {
    gracePeriodDays: 4,
    maxFeePercent: 5,
    maxFeeFlat: null,
    description: "4-day grace period for rent due dates after the 4th; max 5% of rent after initial reasonable charge.",
    special: "First late fee of tenancy limited to 5% of the amount of a reasonable late fee.",
  },
  Pennsylvania: {
    gracePeriodDays: null,
    maxFeePercent: null,
    maxFeeFlat: null,
    description: "No statutory grace period or cap; fee must be reasonable.",
    special: "Philadelphia has local ordinances with additional protections.",
  },
  Tennessee: {
    gracePeriodDays: 5,
    maxFeePercent: 10,
    maxFeeFlat: null,
    description: "5-day grace period required; maximum late fee is 10% of the amount past due.",
    special: "Fee is applied to the past-due amount, not total rent.",
  },
  Texas: {
    gracePeriodDays: 2,
    maxFeePercent: null,
    maxFeeFlat: null,
    description: "2-day grace period required; late fee must be reasonable.",
    special: "For rent under $500, initial late fee cannot exceed 10%; for rent $500+, cannot exceed 12%.",
  },
  Virginia: {
    gracePeriodDays: 5,
    maxFeePercent: 10,
    maxFeeFlat: null,
    description: "5-day grace period; late fee cannot exceed 10% of the periodic rent.",
    special: "Fee must be in a written rental agreement to be enforceable.",
  },
  Washington: {
    gracePeriodDays: 5,
    maxFeePercent: null,
    maxFeeFlat: null,
    description: "Late fee must be outlined in the lease; reasonableness standard applies.",
    special: "Some local jurisdictions (e.g., Seattle) have stricter rules.",
  },
};

const REASONABLE_FEE_LOWER_PERCENT = 0.05;
const REASONABLE_FEE_UPPER_PERCENT = 0.10;
const EXCESSIVE_FEE_MULTIPLIER = 1.5;
const TEXAS_RENT_THRESHOLD = 500;
const TEXAS_LOW_RENT_FEE_PERCENT = 0.10;
const TEXAS_HIGH_RENT_FEE_PERCENT = 0.12;

type Verdict = "legal" | "excessive" | "review";

interface AnalysisResult {
  verdict: Verdict;
  maxAllowedFee: number | null;
  requiredGracePeriod: number | null;
  userFee: number;
  userGracePeriod: number;
  stateDescription: string;
  special: string;
  gracePeriodOk: boolean;
}

function analyzeLateFee(
  state: string,
  monthlyRent: number,
  lateFee: number,
  gracePeriod: number
): AnalysisResult {
  const rule = stateRules[state];

  let maxAllowedFee: number | null = null;
  if (rule.maxFeePercent !== null && rule.maxFeeFlat !== null) {
    // States like NY: lesser of flat or percent; NC: greater of flat or percent
    if (state === "North Carolina") {
      maxAllowedFee = Math.max(rule.maxFeeFlat, monthlyRent * (rule.maxFeePercent / 100));
    } else {
      maxAllowedFee = Math.min(rule.maxFeeFlat, monthlyRent * (rule.maxFeePercent / 100));
    }
  } else if (rule.maxFeePercent !== null) {
    maxAllowedFee = monthlyRent * (rule.maxFeePercent / 100);
  } else if (rule.maxFeeFlat !== null) {
    maxAllowedFee = rule.maxFeeFlat;
  }

  // Texas special rules
  if (state === "Texas") {
    maxAllowedFee = monthlyRent < TEXAS_RENT_THRESHOLD
      ? monthlyRent * TEXAS_LOW_RENT_FEE_PERCENT
      : monthlyRent * TEXAS_HIGH_RENT_FEE_PERCENT;
  }

  // Colorado special: greater of $50 or 5%
  if (state === "Colorado") {
    maxAllowedFee = Math.max(50, monthlyRent * 0.05);
  }

  const gracePeriodOk =
    rule.gracePeriodDays === null || gracePeriod >= rule.gracePeriodDays;

  let verdict: Verdict;
  if (maxAllowedFee !== null) {
    if (lateFee <= maxAllowedFee && gracePeriodOk) {
      verdict = "legal";
    } else if (lateFee > maxAllowedFee * EXCESSIVE_FEE_MULTIPLIER) {
      verdict = "excessive";
    } else {
      verdict = lateFee > maxAllowedFee ? "excessive" : "review";
    }
  } else {
    // No statutory cap — use reasonableness heuristic (5–10% of rent)
    const fivePercent = monthlyRent * REASONABLE_FEE_LOWER_PERCENT;
    const tenPercent = monthlyRent * REASONABLE_FEE_UPPER_PERCENT;
    if (lateFee <= fivePercent && gracePeriodOk) {
      verdict = "legal";
    } else if (lateFee > tenPercent) {
      verdict = "excessive";
    } else {
      verdict = "review";
    }
    // Even if no hard cap, set a reference amount for display
    maxAllowedFee = tenPercent;
  }

  if (!gracePeriodOk && verdict === "legal") {
    verdict = "review";
  }

  return {
    verdict,
    maxAllowedFee,
    requiredGracePeriod: rule.gracePeriodDays,
    userFee: lateFee,
    userGracePeriod: gracePeriod,
    stateDescription: rule.description,
    special: rule.special,
    gracePeriodOk,
  };
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function LateFeeChecker() {
  const navigate = useNavigate();

  const [selectedState, setSelectedState] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [lateFee, setLateFee] = useState("");
  const [gracePeriod, setGracePeriod] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleCheck = () => {
    if (!selectedState || !monthlyRent || !lateFee || !gracePeriod) return;
    const analysis = analyzeLateFee(
      selectedState,
      parseFloat(monthlyRent),
      parseFloat(lateFee),
      parseInt(gracePeriod, 10)
    );
    setResult(analysis);
  };

  const isFormValid = selectedState && monthlyRent && lateFee && gracePeriod;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <FileText className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-slate-800">
                LeaseLenses
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate("/pricing")}>
              View Pricing
            </Button>
            <Button
              onClick={() => navigate("/register")}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              Try Free
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">
            Free Tool
          </Badge>
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Late Fee Checker
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Find out if the late fee your landlord is charging is legal in your
            state. Enter your details below to get an instant analysis based on
            your state's laws.
          </p>
        </div>

        {/* Calculator Card */}
        <Card className="max-w-2xl mx-auto mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-blue-600" />
              Check Your Late Fee
            </CardTitle>
            <CardDescription>
              Enter your lease details to see if your late fee complies with
              state regulations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger id="state">
                  <SelectValue placeholder="Select your state" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(stateRules)
                    .sort()
                    .map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyRent">Monthly Rent ($)</Label>
              <Input
                id="monthlyRent"
                type="number"
                placeholder="e.g., 1500"
                min="0"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lateFee">Late Fee Charged ($)</Label>
              <Input
                id="lateFee"
                type="number"
                placeholder="e.g., 75"
                min="0"
                value={lateFee}
                onChange={(e) => setLateFee(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gracePeriod">Grace Period (days)</Label>
              <Input
                id="gracePeriod"
                type="number"
                placeholder="e.g., 5"
                min="0"
                value={gracePeriod}
                onChange={(e) => setGracePeriod(e.target.value)}
              />
            </div>

            <Button
              onClick={handleCheck}
              disabled={!isFormValid}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Check Late Fee
            </Button>

            {/* Results */}
            {result && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3">
                  {result.verdict === "legal" && (
                    <>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-base px-4 py-1">
                        Likely Legal
                      </Badge>
                    </>
                  )}
                  {result.verdict === "excessive" && (
                    <>
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-base px-4 py-1">
                        Potentially Excessive
                      </Badge>
                    </>
                  )}
                  {result.verdict === "review" && (
                    <>
                      <Info className="h-8 w-8 text-yellow-600" />
                      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-base px-4 py-1">
                        Review Recommended
                      </Badge>
                    </>
                  )}
                </div>

                <Card
                  className={`border-2 ${
                    result.verdict === "legal"
                      ? "border-green-200 bg-green-50"
                      : result.verdict === "excessive"
                      ? "border-red-200 bg-red-50"
                      : "border-yellow-200 bg-yellow-50"
                  }`}
                >
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-500">
                          Your Late Fee
                        </p>
                        <p className="text-2xl font-bold text-slate-800">
                          {formatCurrency(result.userFee)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-500">
                          Max Allowed (est.)
                        </p>
                        <p className="text-2xl font-bold text-slate-800">
                          {result.maxAllowedFee !== null
                            ? formatCurrency(result.maxAllowedFee)
                            : "No statutory cap"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-500" />
                        <span className="text-sm text-slate-600">
                          Your grace period:{" "}
                          <strong>{result.userGracePeriod} days</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-500" />
                        <span className="text-sm text-slate-600">
                          State requires:{" "}
                          <strong>
                            {result.requiredGracePeriod !== null
                              ? `${result.requiredGracePeriod} days`
                              : "No requirement"}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {!result.gracePeriodOk && (
                      <div className="flex items-start gap-2 p-3 bg-yellow-100 rounded-md">
                        <AlertTriangle className="h-4 w-4 text-yellow-700 mt-0.5" />
                        <p className="text-sm text-yellow-800">
                          Your grace period of {result.userGracePeriod} days is
                          shorter than the state-required{" "}
                          {result.requiredGracePeriod} days. Late fees charged
                          before the grace period expires may not be enforceable.
                        </p>
                      </div>
                    )}

                    <div className="pt-2 border-t">
                      <p className="text-sm text-slate-700">
                        <strong>State Rule:</strong> {result.stateDescription}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        <strong>Note:</strong> {result.special}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {result.verdict === "excessive" && (
                  <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <Shield className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        What You Can Do
                      </p>
                      <ul className="text-sm text-red-700 mt-1 list-disc list-inside space-y-1">
                        <li>
                          Review your lease agreement for the late fee clause
                        </li>
                        <li>
                          Send a written request to your landlord to lower the
                          fee
                        </li>
                        <li>
                          Contact your local tenant rights organization for help
                        </li>
                        <li>
                          File a complaint with your state's attorney general if
                          necessary
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="max-w-2xl mx-auto mb-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
          <CardContent className="pt-6 text-center space-y-4">
            <h2 className="text-2xl font-bold">
              Get a Full Lease Analysis
            </h2>
            <p className="text-blue-100">
              Late fees are just one part of your lease. Upload your entire lease
              to LeaseLenses and get a comprehensive review of every clause —
              including hidden fees, illegal terms, and money-saving
              opportunities.
            </p>
            <Button
              onClick={() => navigate("/register")}
              variant="secondary"
              className="gap-2"
            >
              Analyze Your Full Lease
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* State Reference Table */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
            Late Fee Rules by State
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stateRules)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([state, rule]) => (
                <Card key={state} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4 pb-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <h3 className="font-semibold text-slate-800">{state}</h3>
                    </div>
                    <div className="text-sm text-slate-600 space-y-1">
                      <p>
                        <strong>Grace Period:</strong>{" "}
                        {rule.gracePeriodDays !== null
                          ? `${rule.gracePeriodDays} days`
                          : "Not mandated"}
                      </p>
                      <p>
                        <strong>Max Fee:</strong>{" "}
                        {rule.maxFeePercent !== null
                          ? `${rule.maxFeePercent}% of rent`
                          : rule.maxFeeFlat !== null
                          ? formatCurrency(rule.maxFeeFlat)
                          : "Reasonable standard"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {/* SEO Content Sections */}
        <div className="max-w-3xl mx-auto space-y-12 mb-12">
          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-blue-600" />
              What Is a Late Fee on Rent?
            </h2>
            <p className="text-slate-600 leading-relaxed">
              A late fee is a charge imposed by a landlord when a tenant fails
              to pay rent by the due date specified in the lease agreement. While
              late fees are designed to encourage timely payment, they are
              regulated by state and local laws to prevent landlords from using
              them as a profit center. Most states require that late fees be
              "reasonable" — meaning they should reflect the landlord's actual
              costs from the delayed payment, not serve as a penalty.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              Your Rights as a Tenant
            </h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              Tenants have important protections when it comes to late fees.
              Understanding these rights can save you hundreds of dollars a year
              and help you negotiate better lease terms:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2">
              <li>
                <strong>Grace periods:</strong> Many states require landlords to
                give tenants a grace period (typically 3–15 days) before a late
                fee can be charged. Fees charged before the grace period expires
                may be unenforceable.
              </li>
              <li>
                <strong>Fee caps:</strong> Some states cap late fees at a
                specific percentage of rent (e.g., 5% in Maryland and Delaware)
                or a flat dollar amount. Fees exceeding these caps may be
                illegal.
              </li>
              <li>
                <strong>Written disclosure:</strong> In most states, late fees
                must be disclosed in the written lease agreement. If your lease
                doesn't mention a late fee, your landlord may not be able to
                charge one.
              </li>
              <li>
                <strong>No compounding:</strong> Late fees generally cannot be
                compounded — meaning your landlord cannot charge a late fee on
                top of an unpaid late fee.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-blue-600" />
              When Are Late Fees Illegal?
            </h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              A late fee may be illegal or unenforceable in several situations:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2">
              <li>
                The fee exceeds your state's statutory maximum (e.g., more than
                5% of rent in states that cap fees at 5%).
              </li>
              <li>
                The landlord charges the fee before the required grace period has
                passed.
              </li>
              <li>
                The fee is not specified in your written lease agreement.
              </li>
              <li>
                The fee is considered a "penalty" rather than a reasonable
                estimate of the landlord's damages from late payment.
              </li>
              <li>
                The landlord applies late fees retroactively or in a
                discriminatory manner.
              </li>
              <li>
                Local rent control or tenant protection ordinances impose
                additional restrictions.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Info className="h-6 w-6 text-blue-600" />
              How to Use This Late Fee Checker
            </h2>
            <ol className="list-decimal list-inside text-slate-600 space-y-2">
              <li>
                Select the state where your rental property is located.
              </li>
              <li>
                Enter your monthly rent amount.
              </li>
              <li>
                Enter the late fee your landlord is charging (or has charged).
              </li>
              <li>
                Enter the grace period specified in your lease (in days). If no
                grace period is mentioned, enter 0.
              </li>
              <li>
                Click "Check Late Fee" to see if your fee is within legal
                limits.
              </li>
            </ol>
            <p className="text-slate-600 mt-4">
              For a comprehensive review of all clauses in your lease — not just
              late fees — try{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-blue-600 hover:underline font-medium"
              >
                LeaseLenses full lease analysis
              </button>
              .
            </p>
          </section>
        </div>
      </main>

      {/* More Free Tools */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">More Free Tools</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/tools/security-deposit-calculator")}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Security Deposit Calculator
              </CardTitle>
              <CardDescription>Find out the maximum deposit your landlord can legally charge.</CardDescription>
            </CardHeader>
          </Card>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/tools/rent-increase-calculator")}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Rent Increase Calculator
              </CardTitle>
              <CardDescription>Calculate the maximum legal rent increase in your city or state.</CardDescription>
            </CardHeader>
          </Card>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/tools/lease-termination-notice-generator")}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Termination Notice Generator
              </CardTitle>
              <CardDescription>Generate a professional lease termination letter for your state.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500">
          <p>© 2026 LeaseLenses. All rights reserved.</p>
          <p className="mt-2">
            This tool provides information only and does not constitute legal
            advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
