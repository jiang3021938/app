import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText, ArrowLeft, ArrowRight, Calculator, Shield, DollarSign,
  Info, CheckCircle, MapPin, TrendingUp, AlertTriangle,
} from "lucide-react";

interface JurisdictionRule {
  name: string;
  hasRentControl: boolean;
  /** Base percentage cap (e.g. 5 for 5%). null if no rent control. */
  basePct: number | null;
  /** Whether CPI is added on top of the base percentage. */
  addsCpi: boolean;
  /** Hard cap percentage, if any. null means no hard cap beyond the formula. */
  hardCapPct: number | null;
  /** Assumed local CPI percentage for the calculation. */
  cpiPct: number;
  description: string;
  notes: string;
}

const jurisdictions: Record<string, JurisdictionRule> = {
  CA: {
    name: "California (Statewide — AB 1482)",
    hasRentControl: true,
    basePct: 5,
    addsCpi: true,
    hardCapPct: 10,
    cpiPct: 3.2,
    description: "5% + CPI, capped at 10%",
    notes: "Applies to buildings 15+ years old. Single-family homes owned by individuals are exempt if proper notice is given.",
  },
  NYC: {
    name: "New York City (Rent Stabilized)",
    hasRentControl: true,
    basePct: 3,
    addsCpi: false,
    hardCapPct: null,
    cpiPct: 3.4,
    description: "RGB sets annual increases (~2–5%)",
    notes: "The Rent Guidelines Board sets increases yearly. The 3% figure reflects a typical one-year lease renewal; actual rates vary by year.",
  },
  SF: {
    name: "San Francisco, CA",
    hasRentControl: true,
    basePct: null,
    addsCpi: false,
    hardCapPct: null,
    cpiPct: 3.6,
    description: "60% of CPI increase",
    notes: "Annual increase limited to 60% of the regional CPI change. Applies to buildings built before June 1979.",
  },
  LA: {
    name: "Los Angeles, CA (RSO)",
    hasRentControl: true,
    basePct: null,
    addsCpi: false,
    hardCapPct: null,
    cpiPct: 3.2,
    description: "3–8% per year (set annually)",
    notes: "The Rent Stabilization Ordinance covers units built before October 1978. Allowable increases are set by the LA Housing Department each July.",
  },
  OAK: {
    name: "Oakland, CA",
    hasRentControl: true,
    basePct: null,
    addsCpi: false,
    hardCapPct: 10,
    cpiPct: 3.5,
    description: "CPI increase, capped at 10%",
    notes: "Annual increase limited to CPI for the SF-Oakland-Hayward region. Covers most units built before 1983.",
  },
  SJ: {
    name: "San Jose, CA",
    hasRentControl: true,
    basePct: 5,
    addsCpi: false,
    hardCapPct: null,
    cpiPct: 3.3,
    description: "5% annual cap",
    notes: "Apartment Rent Ordinance limits increases to 5% per year for covered units.",
  },
  OR: {
    name: "Oregon (Statewide — SB 608)",
    hasRentControl: true,
    basePct: 7,
    addsCpi: true,
    hardCapPct: null,
    cpiPct: 3.7,
    description: "7% + CPI",
    notes: "Applies to buildings 15+ years old. New construction is exempt for the first 15 years. No local hard cap.",
  },
  DC: {
    name: "Washington, D.C.",
    hasRentControl: true,
    basePct: null,
    addsCpi: false,
    hardCapPct: null,
    cpiPct: 3.0,
    description: "CPI + 2% (elderly: CPI)",
    notes: "Most rental units built before 1975 are covered. Elderly and disabled tenants are limited to CPI only.",
  },
  STP: {
    name: "St. Paul, MN",
    hasRentControl: true,
    basePct: 3,
    addsCpi: false,
    hardCapPct: 3,
    cpiPct: 2.9,
    description: "3% annual cap",
    notes: "Voter-approved rent stabilization. Applies to all rental units regardless of age. Landlords may apply for exceptions.",
  },
  MN_MPL: {
    name: "Minneapolis, MN",
    hasRentControl: true,
    basePct: 3,
    addsCpi: false,
    hardCapPct: 3,
    cpiPct: 2.9,
    description: "3% annual cap",
    notes: "Approved by voters in 2021. New construction is exempt for the first 20 years. Implementation is ongoing.",
  },
  NJ_JC: {
    name: "Jersey City, NJ",
    hasRentControl: true,
    basePct: null,
    addsCpi: false,
    hardCapPct: null,
    cpiPct: 3.1,
    description: "CPI-based increase",
    notes: "Rent increases tied to CPI. Applies to buildings with 4+ units. Landlords must file with the Rent Leveling Board.",
  },
  NJ_NWK: {
    name: "Newark, NJ",
    hasRentControl: true,
    basePct: null,
    addsCpi: false,
    hardCapPct: null,
    cpiPct: 3.1,
    description: "CPI-based increase",
    notes: "Most residential units are covered. Annual increases tied to the regional CPI index.",
  },
  ME_PORT: {
    name: "Portland, ME",
    hasRentControl: true,
    basePct: null,
    addsCpi: false,
    hardCapPct: 10,
    cpiPct: 3.0,
    description: "CPI or 10%, whichever is lower",
    notes: "Adopted in 2020. Covers most residential rentals. Landlords may petition for additional increases for capital improvements.",
  },
  MD_MG: {
    name: "Montgomery County, MD",
    hasRentControl: true,
    basePct: null,
    addsCpi: false,
    hardCapPct: null,
    cpiPct: 2.8,
    description: "Voluntary rent guidelines (CPI-based)",
    notes: "Guidelines are voluntary but widely followed. Based on CPI for the Washington-Baltimore metro area.",
  },
  WA_SEA: {
    name: "Washington (Statewide — HB 1217)",
    hasRentControl: true,
    basePct: 7,
    addsCpi: false,
    hardCapPct: 7,
    cpiPct: 3.4,
    description: "7% annual cap (eff. 2025)",
    notes: "Signed into law in 2025. Limits annual rent increases to 7% for most residential tenancies. Certain new construction is temporarily exempt.",
  },
  TX: {
    name: "Texas",
    hasRentControl: false,
    basePct: null,
    addsCpi: false,
    hardCapPct: null,
    cpiPct: 3.1,
    description: "No rent control",
    notes: "Texas prohibits local governments from enacting rent control ordinances. No state-level cap exists.",
  },
  FL: {
    name: "Florida",
    hasRentControl: false,
    basePct: null,
    addsCpi: false,
    hardCapPct: null,
    cpiPct: 3.3,
    description: "No rent control",
    notes: "Florida preempts local rent control measures. Increases are limited only by the lease contract terms.",
  },
  GA: {
    name: "Georgia",
    hasRentControl: false,
    basePct: null,
    addsCpi: false,
    hardCapPct: null,
    cpiPct: 3.0,
    description: "No rent control",
    notes: "No rent control at the state or local level. Rent increases are governed by lease terms only.",
  },
};

const sortedKeys = Object.keys(jurisdictions).sort((a, b) =>
  jurisdictions[a].name.localeCompare(jurisdictions[b].name),
);

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function formatPct(pct: number): string {
  return `${pct.toFixed(1)}%`;
}

/**
 * Compute the effective maximum percentage increase for a jurisdiction.
 * Returns null if no rent control.
 */
function computeMaxIncreasePct(rule: JurisdictionRule): number | null {
  if (!rule.hasRentControl) return null;

  // Jurisdictions that use CPI directly (no separate base %)
  if (rule.basePct === null) {
    // Special cases
    if (rule.name.includes("San Francisco")) {
      const raw = rule.cpiPct * 0.6;
      return rule.hardCapPct !== null ? Math.min(raw, rule.hardCapPct) : raw;
    }
    if (rule.name.includes("Washington, D.C.")) {
      return rule.cpiPct + 2;
    }
    // Default CPI-based
    return rule.hardCapPct !== null ? Math.min(rule.cpiPct, rule.hardCapPct) : rule.cpiPct;
  }

  // Base + optional CPI
  let effective = rule.basePct;
  if (rule.addsCpi) {
    effective += rule.cpiPct;
  }

  // Apply hard cap if present
  if (rule.hardCapPct !== null) {
    effective = Math.min(effective, rule.hardCapPct);
  }

  return effective;
}

export default function RentIncreaseCalculator() {
  const navigate = useNavigate();
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>("");
  const [monthlyRent, setMonthlyRent] = useState<string>("");
  const [calculated, setCalculated] = useState(false);

  const rule = selectedJurisdiction ? jurisdictions[selectedJurisdiction] : null;
  const rentAmount = parseFloat(monthlyRent);
  const isValidRent = !isNaN(rentAmount) && rentAmount > 0;

  const maxPct = rule ? computeMaxIncreasePct(rule) : null;
  const maxIncreaseAmt = maxPct !== null && isValidRent ? rentAmount * (maxPct / 100) : null;
  const newMaxRent = maxIncreaseAmt !== null ? rentAmount + maxIncreaseAmt : null;

  const handleCalculate = () => {
    if (selectedJurisdiction && isValidRent) {
      setCalculated(true);
    }
  };

  const handleReset = () => {
    setSelectedJurisdiction("");
    setMonthlyRent("");
    setCalculated(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />Back
            </Button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <FileText className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-slate-800">LeaseLenses</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate("/pricing")}>View Pricing</Button>
            <Button onClick={() => navigate("/register")} className="gap-2 bg-blue-600 hover:bg-blue-700">Try Free</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">Free Tool</Badge>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Rent Increase Calculator
          </h1>
          <p className="text-lg text-slate-600">
            Find out the maximum rent increase your landlord can legally charge based on
            local rent control and stabilization laws. Select your jurisdiction and enter
            your current rent to get an instant answer.
          </p>
        </div>

        {/* Calculator Card */}
        <Card className="max-w-2xl mx-auto mb-12 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calculator className="h-5 w-5 text-blue-600" />
              Calculate Your Maximum Rent Increase
            </CardTitle>
            <CardDescription>
              Select your city or state, enter your monthly rent, and see the legal limit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Jurisdiction Selector */}
            <div className="space-y-2">
              <Label htmlFor="jurisdiction-select">City / State</Label>
              <Select value={selectedJurisdiction} onValueChange={(value) => { setSelectedJurisdiction(value); setCalculated(false); }}>
                <SelectTrigger id="jurisdiction-select">
                  <SelectValue placeholder="Select a jurisdiction" />
                </SelectTrigger>
                <SelectContent>
                  {sortedKeys.map((key) => (
                    <SelectItem key={key} value={key}>
                      {jurisdictions[key].name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rent Input */}
            <div className="space-y-2">
              <Label htmlFor="rent-input">Current Monthly Rent ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="rent-input"
                  type="number"
                  min="0"
                  step="50"
                  placeholder="e.g. 2000"
                  className="pl-9"
                  value={monthlyRent}
                  onChange={(e) => { setMonthlyRent(e.target.value); setCalculated(false); }}
                />
              </div>
            </div>

            {/* CPI Note */}
            {rule && rule.hasRentControl && (
              <div className="flex items-start gap-2 rounded-md bg-slate-100 p-3 text-sm text-slate-600">
                <Info className="h-4 w-4 mt-0.5 text-blue-500 shrink-0" />
                <span>
                  Using an estimated CPI of {formatPct(rule.cpiPct)} for this jurisdiction.
                  Actual CPI varies by year and region.
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={!selectedJurisdiction || !isValidRent}
                onClick={handleCalculate}
              >
                <Calculator className="h-4 w-4 mr-2" />
                Calculate
              </Button>
              {calculated && (
                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              )}
            </div>

            {/* Result */}
            {calculated && rule && (
              <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6 space-y-4">
                <div className="flex items-center gap-2 text-blue-800 font-semibold text-lg">
                  <MapPin className="h-5 w-5" />
                  {rule.name}
                </div>

                {rule.hasRentControl && maxPct !== null ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="rounded-md bg-white p-4 text-center">
                        <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Max Increase</p>
                        <p className="text-2xl font-bold text-slate-900">{formatPct(maxPct)}</p>
                      </div>
                      <div className="rounded-md bg-white p-4 text-center">
                        <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Increase Amount</p>
                        <p className="text-2xl font-bold text-green-700">
                          +{formatCurrency(maxIncreaseAmt!)}
                        </p>
                      </div>
                      <div className="rounded-md bg-white p-4 text-center">
                        <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">New Max Rent</p>
                        <p className="text-2xl font-bold text-slate-900">{formatCurrency(newMaxRent!)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">
                      Based on {rule.description} applied to your current rent of {formatCurrency(rentAmount)}/month.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-sm bg-amber-100 text-amber-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        No Rent Control
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      {rule.name} does not impose a legal limit on rent increases. Your landlord
                      may raise rent by any amount with proper notice as required by your lease
                      and applicable landlord-tenant law.
                    </p>
                  </div>
                )}

                <div className="flex items-start gap-2 rounded-md bg-white p-3 text-sm text-slate-600">
                  <Info className="h-4 w-4 mt-0.5 text-blue-500 shrink-0" />
                  <span>{rule.notes}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="max-w-2xl mx-auto mb-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
          <CardContent className="p-8 text-center space-y-4">
            <Shield className="h-10 w-10 mx-auto opacity-90" />
            <h2 className="text-2xl font-bold">Want a Full Lease Analysis?</h2>
            <p className="text-blue-100 max-w-lg mx-auto">
              Upload your lease to LeaseLenses and get an AI-powered report covering rent
              increase clauses, renewal terms, risk flags, and more — in seconds.
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate("/register")}
              className="mt-2 gap-2"
            >
              Analyze My Lease Free <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Jurisdiction Reference Table */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Rent Increase Limits by Jurisdiction
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sortedKeys.map((key) => {
              const j = jurisdictions[key];
              return (
                <Card key={key} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <span className="font-semibold text-slate-800 text-sm">{j.name}</span>
                      <Badge variant={j.hasRentControl ? "default" : "secondary"} className={
                        j.hasRentControl
                          ? "bg-blue-100 text-blue-700 hover:bg-blue-100 shrink-0"
                          : "bg-amber-100 text-amber-700 shrink-0"
                      }>
                        {j.hasRentControl ? j.description : "No Limit"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">{j.notes}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* SEO Content Sections */}
        <div className="max-w-3xl mx-auto space-y-8 mb-12">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              What Is Rent Control?
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Rent control is a government policy that limits how much a landlord can
              increase rent on a residential property. These laws are designed to keep
              housing affordable by preventing sudden, large rent hikes that could displace
              tenants. Rent control laws vary significantly by jurisdiction — some states
              have statewide policies, while others allow individual cities to set their own
              rules. In some states, rent control is outright prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Rent Control vs. Rent Stabilization
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              While the terms are often used interchangeably, rent control and rent
              stabilization are distinct concepts:
            </p>
            <ul className="space-y-2">
              {[
                "Rent control typically freezes rent at a specific amount or allows only very small increases, often tied to a fixed percentage.",
                "Rent stabilization allows annual increases — usually tied to inflation (CPI) or set by a rent guidelines board — while still capping how much rent can go up each year.",
                "Most modern laws in the United States are technically rent stabilization programs, not strict rent freezes.",
                "Both systems usually apply to older buildings and may exempt newer construction to encourage development.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-slate-600">
                  <CheckCircle className="h-4 w-4 mt-1 text-green-500 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Why Rent Increase Limits Matter
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Understanding your local rent increase limits is critical for both tenants and
              landlords. Here&apos;s why:
            </p>
            <ul className="space-y-2">
              {[
                "They protect tenants from being priced out of their homes by sudden, excessive increases.",
                "They provide predictability for household budgeting and long-term financial planning.",
                "They help maintain community stability by reducing involuntary displacement.",
                "Landlords who violate rent increase limits may face fines, penalties, or required rent rollbacks.",
                "Knowing the law helps tenants negotiate from an informed position during lease renewals.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-slate-600">
                  <CheckCircle className="h-4 w-4 mt-1 text-green-500 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              How to Use This Calculator
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Select your city or state from the dropdown, enter your current monthly rent,
              and click &ldquo;Calculate.&rdquo; The tool instantly shows you the maximum
              percentage increase allowed by law, the dollar amount that translates to, and
              the highest rent your landlord can legally charge after the increase. For
              jurisdictions without rent control, we&apos;ll let you know so you can plan
              accordingly. Remember that the CPI figures used are estimates — actual allowable
              increases may differ based on the year and the specific CPI index used by
              your jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">Can my landlord raise rent more than the legal limit?</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  In jurisdictions with rent control or stabilization laws, landlords cannot
                  exceed the maximum allowed increase without a valid exemption (such as
                  capital improvement pass-throughs). If your landlord raises rent beyond
                  the legal limit, you may have grounds to file a complaint with your local
                  housing authority.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">Does rent control apply to all rental units?</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  No. Most rent control laws have exemptions, commonly for newer
                  construction, single-family homes, owner-occupied duplexes, and
                  subsidized housing. Check your local ordinance for specific coverage rules.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">What is CPI and why does it matter for rent increases?</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  The Consumer Price Index (CPI) measures the average change in prices
                  consumers pay for goods and services over time. Many rent stabilization
                  laws tie allowable increases to CPI to ensure rents keep pace with
                  inflation without exceeding it. The specific CPI index used varies by
                  jurisdiction.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500">
          <p>© 2026 LeaseLenses. All rights reserved.</p>
          <p className="mt-2">
            This tool provides general information only and does not constitute legal
            advice. Consult a qualified attorney for advice specific to your situation.
          </p>
        </div>
      </footer>
    </div>
  );
}
