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

interface StateDepositRule {
  name: string;
  multiplier: number | null;
  description: string;
  notes: string;
}

const stateRules: Record<string, StateDepositRule> = {
  AL: { name: "Alabama", multiplier: 1, description: "1 month's rent", notes: "Applies to all residential rentals." },
  AZ: { name: "Arizona", multiplier: 1.5, description: "1.5 months' rent", notes: "Landlords may not charge more than 1.5 months' rent." },
  CA: { name: "California", multiplier: 1, description: "1 month's rent (unfurnished)", notes: "Unfurnished: 1 month max. Furnished: 2 months max. The calculator uses the unfurnished rate." },
  CO: { name: "Colorado", multiplier: null, description: "No statutory limit", notes: "No state law limiting the amount, but local ordinances may apply." },
  CT: { name: "Connecticut", multiplier: 2, description: "2 months' rent", notes: "Tenants 62+ years old: 1 month's rent maximum." },
  FL: { name: "Florida", multiplier: null, description: "No statutory limit", notes: "No state maximum, but deposits must be held in a separate account or posted as surety bond." },
  GA: { name: "Georgia", multiplier: null, description: "No statutory limit", notes: "No state cap on security deposit amounts." },
  HI: { name: "Hawaii", multiplier: 1, description: "1 month's rent", notes: "Landlords may also collect 1 month's rent as a pet deposit." },
  IL: { name: "Illinois", multiplier: null, description: "No statutory limit", notes: "No statewide cap, but Chicago limits deposits to 1.5 months' rent." },
  KS: { name: "Kansas", multiplier: 1, description: "1 month's rent (unfurnished)", notes: "Unfurnished: 1 month max. Furnished: 1.5 months max. The calculator uses the unfurnished rate." },
  MA: { name: "Massachusetts", multiplier: 1, description: "1 month's rent", notes: "Landlords may also charge first month, last month, and lock change fee." },
  MD: { name: "Maryland", multiplier: 2, description: "2 months' rent", notes: "Applies to most residential rental properties." },
  MI: { name: "Michigan", multiplier: 1.5, description: "1.5 months' rent", notes: "Deposit must be held in a regulated financial institution." },
  NJ: { name: "New Jersey", multiplier: 1.5, description: "1.5 months' rent", notes: "Deposit must be placed in an interest-bearing account." },
  NV: { name: "Nevada", multiplier: 3, description: "3 months' rent", notes: "Maximum of 3 months' rent for all residential properties." },
  NY: { name: "New York", multiplier: 1, description: "1 month's rent", notes: "As of 2019 HSTPA, deposits are limited to 1 month's rent statewide." },
  NC: { name: "North Carolina", multiplier: 2, description: "2 months' rent (longer-term leases)", notes: "Month-to-month: 1.5 months max. Longer-term: 2 months max. The calculator uses the longer-term rate." },
  OH: { name: "Ohio", multiplier: null, description: "No statutory limit", notes: "No state law capping security deposit amounts." },
  PA: { name: "Pennsylvania", multiplier: 2, description: "2 months' rent (first year)", notes: "First year of tenancy: 2 months max. After first year: 1 month max. The calculator uses the first-year rate." },
  TX: { name: "Texas", multiplier: null, description: "No statutory limit", notes: "No state maximum. Market conditions typically dictate deposit amounts." },
  VA: { name: "Virginia", multiplier: 2, description: "2 months' rent", notes: "Applies to all residential leases." },
  WA: { name: "Washington", multiplier: null, description: "No statutory limit", notes: "No state cap, but landlords must provide a written checklist at move-in." },
};

const sortedStateKeys = Object.keys(stateRules).sort((a, b) =>
  stateRules[a].name.localeCompare(stateRules[b].name)
);

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export default function SecurityDepositCalculator() {
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState<string>("");
  const [monthlyRent, setMonthlyRent] = useState<string>("");
  const [calculated, setCalculated] = useState(false);

  const rule = selectedState ? stateRules[selectedState] : null;
  const rentAmount = parseFloat(monthlyRent);
  const isValidRent = !isNaN(rentAmount) && rentAmount > 0;

  const maxDeposit = rule && isValidRent && rule.multiplier !== null
    ? rentAmount * rule.multiplier
    : null;

  const handleCalculate = () => {
    if (selectedState && isValidRent) {
      setCalculated(true);
    }
  };

  const handleReset = () => {
    setSelectedState("");
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
            Security Deposit Calculator
          </h1>
          <p className="text-lg text-slate-600">
            Find out the maximum security deposit your landlord can legally charge based on
            your state's laws. Enter your state and monthly rent to get an instant answer.
          </p>
        </div>

        {/* Calculator Card */}
        <Card className="max-w-2xl mx-auto mb-12 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calculator className="h-5 w-5 text-blue-600" />
              Calculate Your Maximum Security Deposit
            </CardTitle>
            <CardDescription>
              Select your state and enter your monthly rent to see the legal limit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* State Selector */}
            <div className="space-y-2">
              <Label htmlFor="state-select">State</Label>
              <Select value={selectedState} onValueChange={(value) => { setSelectedState(value); setCalculated(false); }}>
                <SelectTrigger id="state-select">
                  <SelectValue placeholder="Select your state" />
                </SelectTrigger>
                <SelectContent>
                  {sortedStateKeys.map((key) => (
                    <SelectItem key={key} value={key}>
                      {stateRules[key].name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rent Input */}
            <div className="space-y-2">
              <Label htmlFor="rent-input">Monthly Rent ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="rent-input"
                  type="number"
                  min="0"
                  step="50"
                  placeholder="e.g. 1500"
                  className="pl-9"
                  value={monthlyRent}
                  onChange={(e) => { setMonthlyRent(e.target.value); setCalculated(false); }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={!selectedState || !isValidRent}
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
                  {rule.name} — Security Deposit Limit
                </div>

                {rule.multiplier !== null ? (
                  <div className="space-y-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-slate-900">
                        {formatCurrency(maxDeposit!)}
                      </span>
                      <span className="text-slate-500">maximum</span>
                    </div>
                    <p className="text-sm text-slate-600">
                      Based on {rule.description} × {formatCurrency(rentAmount)} monthly rent.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-sm bg-amber-100 text-amber-800">
                        No Statutory Limit
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      {rule.name} does not impose a state-level cap on security deposits.
                      Landlords may charge any amount, though market norms typically apply.
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
              Upload your lease to LeaseLenses and get an AI-powered report covering security deposit
              compliance, risk flags, missing clauses, and more — in seconds.
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

        {/* State Reference Table */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Security Deposit Limits by State
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sortedStateKeys.map((key) => {
              const s = stateRules[key];
              return (
                <Card key={key} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-800">{s.name}</span>
                      <Badge variant={s.multiplier !== null ? "default" : "secondary"} className={
                        s.multiplier !== null
                          ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                          : "bg-slate-100 text-slate-600"
                      }>
                        {s.description}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">{s.notes}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* SEO Content Section */}
        <div className="max-w-3xl mx-auto space-y-8 mb-12">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              What Is a Security Deposit?
            </h2>
            <p className="text-slate-600 leading-relaxed">
              A security deposit is a sum of money that a tenant pays to a landlord before
              moving into a rental property. It serves as financial protection for the
              landlord against potential damages, unpaid rent, or lease violations. At the
              end of the tenancy, the landlord must return the deposit — minus any
              legitimate deductions — within the timeframe specified by state law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Why Do Security Deposit Limits Matter?
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Security deposit limits exist to protect tenants from unreasonably high
              upfront costs. Without these limits, landlords could demand excessively large
              deposits that create financial barriers to housing. State laws balance the
              interests of both parties:
            </p>
            <ul className="space-y-2">
              {[
                "They prevent landlords from using deposits as a profit center.",
                "They ensure tenants aren't priced out of rental housing by excessive move-in costs.",
                "They establish clear rules for deposit returns and allowable deductions.",
                "They provide legal recourse when landlords overcharge or wrongfully withhold deposits.",
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
              Select your state from the dropdown menu, enter your monthly rent amount, and
              click "Calculate." The tool will instantly show you the maximum security
              deposit your landlord can legally charge under your state's laws. For states
              with no statutory limit, we'll let you know so you can negotiate accordingly.
              Remember that local city or county ordinances may impose additional
              restrictions beyond state law.
            </p>
          </section>
        </div>
      </main>

      {/* More Free Tools */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">More Free Tools</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
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
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/tools/late-fee-checker")}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Late Fee Checker
              </CardTitle>
              <CardDescription>Check if your landlord's late fee is legal in your state.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

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
