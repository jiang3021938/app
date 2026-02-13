import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  FileText, ArrowLeft, AlertTriangle, CheckCircle, User, Home,
  DollarSign, Clock, Info, Shield, Scale, BarChart3, Sparkles,
  TrendingUp, ArrowRight
} from "lucide-react";
import LeaseHealthScore from "@/components/LeaseHealthScore";

// Static sample data
const SAMPLE_EXTRACTION = {
  tenant_name: "Sarah Johnson",
  landlord_name: "Greenfield Properties LLC",
  property_address: "456 Oak Avenue, Apt 3B, Austin, TX 78701",
  monthly_rent: 2150,
  security_deposit: 2150,
  lease_start_date: "2026-03-01",
  lease_end_date: "2027-02-28",
  renewal_notice_days: 60,
  pet_policy: "One pet allowed with $300 non-refundable deposit and $25/month pet rent",
  late_fee_terms: "$75 flat fee after 5-day grace period",
  created_at: "2026-02-10T14:30:00Z",
};

const SAMPLE_RISK_FLAGS = [
  {
    severity: "high",
    category: "Early Termination",
    title: "No Early Termination Clause",
    description: "The lease does not include an early termination clause. Tenant would be liable for all remaining rent if they need to break the lease.",
    recommendation: "Negotiate adding an early termination clause with 60-day notice and a 2-month rent penalty.",
  },
  {
    severity: "high",
    category: "Maintenance Responsibility",
    title: "Ambiguous Maintenance Obligations",
    description: "The lease assigns 'general upkeep' to the tenant without clearly defining what constitutes general upkeep vs. landlord maintenance responsibilities.",
    recommendation: "Request a clear itemized list of tenant vs. landlord maintenance responsibilities.",
  },
  {
    severity: "medium",
    category: "Late Fees",
    title: "Late Fee Exceeds State Guidelines",
    description: "The $75 flat late fee may exceed Texas reasonable late fee guidelines for the rent amount. Texas courts generally consider 10-12% of monthly rent as reasonable.",
    recommendation: "Negotiate the late fee down to $50 or request a percentage-based fee of 10% of monthly rent.",
  },
  {
    severity: "medium",
    category: "Security Deposit",
    title: "No Itemized Deduction Timeline",
    description: "The lease does not specify a timeline for returning the security deposit or providing itemized deductions after move-out.",
    recommendation: "Add language requiring deposit return within 30 days with itemized deductions, per Texas Property Code §92.103.",
  },
];

const SAMPLE_CHECKLIST = [
  { category: "Parties", status: "pass" as const, title: "Parties Identified", description: "Both tenant and landlord names are clearly stated." },
  { category: "Property", status: "pass" as const, title: "Property Description", description: "Full address including unit number is specified." },
  { category: "Rent Terms", status: "pass" as const, title: "Rent Amount & Due Date", description: "Monthly rent of $2,150 due on the 1st of each month." },
  { category: "Security Deposit", status: "warning" as const, title: "Deposit Return Terms", description: "Deposit amount stated but return timeline not specified." },
  { category: "Lease Duration", status: "pass" as const, title: "Term Dates", description: "12-month lease from March 1, 2026 to February 28, 2027." },
  { category: "Termination", status: "issue" as const, title: "Early Termination", description: "No early termination clause found in the lease." },
  { category: "Maintenance", status: "issue" as const, title: "Maintenance Responsibilities", description: "Maintenance obligations are ambiguously defined." },
  { category: "Pet Policy", status: "pass" as const, title: "Pet Policy", description: "Pet terms clearly stated with deposit and monthly rent." },
  { category: "Utilities", status: "pass" as const, title: "Utility Responsibilities", description: "Tenant responsible for electric, water, internet. Landlord covers trash." },
  { category: "Late Fees", status: "warning" as const, title: "Late Fee Terms", description: "$75 flat fee after 5-day grace. May exceed state guidelines." },
  { category: "Renewal", status: "pass" as const, title: "Renewal Terms", description: "60-day notice required for non-renewal." },
  { category: "Insurance", status: "warning" as const, title: "Renter's Insurance", description: "Renter's insurance recommended but not required." },
];

const SAMPLE_COMPLIANCE = {
  state_name: "Texas",
  state_code: "TX",
  overall_status: "warnings_found",
  summary: { compliant: 4, warnings: 2, violations: 1, info: 1 },
  compliance_checks: [
    { category: "Security Deposit", title: "Deposit Limits", regulation: "Texas Property Code §92.102", source_url: "", status: "compliant", description: "Texas has no statutory limit on security deposits.", recommendation: "" },
    { category: "Security Deposit", title: "Deposit Return", regulation: "Texas Property Code §92.103", source_url: "", status: "warning", description: "Lease should specify 30-day deposit return timeline per state law.", recommendation: "Add explicit 30-day return timeline language." },
    { category: "Late Fees", title: "Reasonable Late Fee", regulation: "Texas Property Code §92.019", source_url: "", status: "warning", description: "The $75 flat fee (3.5% of rent) is within guidelines but on the higher end.", recommendation: "Consider reducing to $50 or 2-3% of monthly rent." },
    { category: "Habitability", title: "Implied Warranty", regulation: "Texas Property Code §92.052", source_url: "", status: "compliant", description: "Lease includes standard habitability warranty language.", recommendation: "" },
    { category: "Landlord Entry", title: "Notice Requirements", regulation: "Texas Common Law", source_url: "", status: "compliant", description: "24-hour notice for non-emergency entry is specified.", recommendation: "" },
    { category: "Discrimination", title: "Fair Housing Compliance", regulation: "Fair Housing Act & TX HRC Act", source_url: "", status: "compliant", description: "No discriminatory language detected.", recommendation: "" },
    { category: "Termination", title: "Early Termination", regulation: "Texas Property Code §92.016", source_url: "", status: "violation", description: "No early termination clause provided. Texas law requires specific provisions for military, family violence, and other protected situations.", recommendation: "Add early termination provisions compliant with Texas law." },
    { category: "Repairs", title: "Repair Request Process", regulation: "Texas Property Code §92.056", source_url: "", status: "info", description: "Tenant repair request process should be documented in writing.", recommendation: "Add written repair request procedure." },
  ],
};

const SAMPLE_SUMMARY = {
  health_score: 68,
  grade: "C+",
  summary: "This lease agreement has several standard provisions but contains notable gaps in early termination rights and maintenance responsibility definitions. The financial terms are reasonable for the Austin market, though the late fee structure may warrant negotiation.",
  key_highlights: ["No early termination clause", "Ambiguous maintenance terms", "Competitive rent for area", "Standard pet policy"],
  top_action: "Negotiate an early termination clause and clarify maintenance responsibilities before signing.",
};

export default function SampleReport() {
  const navigate = useNavigate();

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return "Not specified";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Not specified";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    } catch { return dateStr; }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium": return "bg-amber-100 text-amber-700 border-amber-200";
      default: return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "compliant": return "bg-green-100 text-green-700 border-green-200";
      case "violation": return "bg-red-100 text-red-700 border-red-200";
      case "warning": return "bg-amber-100 text-amber-700 border-amber-200";
      default: return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const getComplianceStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "compliant": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "violation": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      default: return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
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
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-100 text-amber-700 border-amber-200">Sample Report</Badge>
            <Button onClick={() => navigate("/register")} className="gap-2">
              <ArrowRight className="h-4 w-4" />
              Try Free Analysis
            </Button>
          </div>
        </div>
      </header>

      {/* Sample Banner */}
      <div className="bg-blue-600 text-white text-center py-3 text-sm">
        <p>
          📋 This is a <strong>sample report</strong> showing what a full lease analysis looks like.{" "}
          <button onClick={() => navigate("/register")} className="underline font-medium hover:text-blue-200">
            Sign up free
          </button>{" "}
          to analyze your own lease.
        </p>
      </div>

      {/* Main Content */}
      <main className="container mx-auto max-w-4xl py-8 px-4">
        {/* Score & Summary Card */}
        <Card className="mb-6 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600" />
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0 mx-auto md:mx-0">
                <LeaseHealthScore score={SAMPLE_SUMMARY.health_score} size={150} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Sample_Lease_Agreement.pdf</h2>
                    <p className="text-sm text-slate-500">Analyzed {formatDate(SAMPLE_EXTRACTION.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-blue-100 text-blue-700 text-base px-3 py-1 font-bold">
                      {SAMPLE_SUMMARY.grade}
                    </Badge>
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />Complete
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-slate-700 leading-relaxed">{SAMPLE_SUMMARY.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_SUMMARY.key_highlights.map((h, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                        <Sparkles className="h-3 w-3 text-blue-500" />{h}
                      </span>
                    ))}
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                    <p className="text-xs text-blue-800">
                      <span className="font-semibold">Recommended:</span> {SAMPLE_SUMMARY.top_action}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="compliance">
              Compliance
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 justify-center">1</Badge>
            </TabsTrigger>
            <TabsTrigger value="risks">
              Risks
              <Badge className="ml-2 bg-red-100 text-red-700 h-5 w-5 p-0 justify-center">4</Badge>
            </TabsTrigger>
            <TabsTrigger value="checklist">
              Checklist
              <Badge className="ml-2 bg-slate-100 text-slate-600 h-5 w-5 p-0 justify-center">12</Badge>
            </TabsTrigger>
            <TabsTrigger value="market">Market</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Extracted Information</CardTitle>
                <CardDescription>Key terms and details from the lease agreement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-700 flex items-center gap-2">
                      <User className="h-4 w-4" />Parties
                    </h4>
                    <div className="space-y-3 pl-6">
                      <div>
                        <p className="text-xs text-slate-500">Tenant</p>
                        <p className="font-medium">{SAMPLE_EXTRACTION.tenant_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Landlord</p>
                        <p className="font-medium">{SAMPLE_EXTRACTION.landlord_name}</p>
                      </div>
                    </div>
                    <Separator />
                    <h4 className="font-medium text-slate-700 flex items-center gap-2">
                      <Home className="h-4 w-4" />Property
                    </h4>
                    <div className="pl-6">
                      <p className="text-xs text-slate-500">Address</p>
                      <p className="font-medium">{SAMPLE_EXTRACTION.property_address}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-700 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />Financial Terms
                    </h4>
                    <div className="space-y-3 pl-6">
                      <div>
                        <p className="text-xs text-slate-500">Monthly Rent</p>
                        <p className="font-medium text-green-700">{formatCurrency(SAMPLE_EXTRACTION.monthly_rent)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Security Deposit</p>
                        <p className="font-medium">{formatCurrency(SAMPLE_EXTRACTION.security_deposit)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Late Fee</p>
                        <p className="font-medium">{SAMPLE_EXTRACTION.late_fee_terms}</p>
                      </div>
                    </div>
                    <Separator />
                    <h4 className="font-medium text-slate-700 flex items-center gap-2">
                      <Clock className="h-4 w-4" />Lease Duration
                    </h4>
                    <div className="space-y-3 pl-6">
                      <div className="flex gap-4">
                        <div>
                          <p className="text-xs text-slate-500">Start Date</p>
                          <p className="font-medium">{formatDate(SAMPLE_EXTRACTION.lease_start_date)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">End Date</p>
                          <p className="font-medium">{formatDate(SAMPLE_EXTRACTION.lease_end_date)}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Renewal Notice</p>
                        <p className="font-medium">{SAMPLE_EXTRACTION.renewal_notice_days} days</p>
                      </div>
                    </div>
                  </div>
                </div>
                <Separator className="my-6" />
                <div>
                  <h4 className="font-medium text-slate-700 mb-3">Additional Terms</h4>
                  <div className="grid md:grid-cols-2 gap-4 pl-6">
                    <div>
                      <p className="text-xs text-slate-500">Pet Policy</p>
                      <p className="text-sm">{SAMPLE_EXTRACTION.pet_policy}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Scale className="h-5 w-5 text-blue-600" />
                  State Compliance Check — {SAMPLE_COMPLIANCE.state_name}
                </CardTitle>
                <CardDescription>
                  Lease analyzed against {SAMPLE_COMPLIANCE.state_name} landlord-tenant regulations
                </CardDescription>
                <div className="flex items-center gap-3 mt-2">
                  <Badge className="bg-amber-100 text-amber-700">Warnings Found</Badge>
                  <span className="text-sm text-green-600">✅ {SAMPLE_COMPLIANCE.summary.compliant} Compliant</span>
                  <span className="text-sm text-amber-600">⚠️ {SAMPLE_COMPLIANCE.summary.warnings} Warning</span>
                  <span className="text-sm text-red-600">❌ {SAMPLE_COMPLIANCE.summary.violations} Violation</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {SAMPLE_COMPLIANCE.compliance_checks.map((check, index) => (
                  <div key={index} className={`flex items-start gap-3 p-3 rounded-lg border ${getComplianceStatusColor(check.status)}`}>
                    {getComplianceStatusIcon(check.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-medium text-sm">{check.title}</h4>
                        <Badge variant="outline" className="text-xs">{check.status}</Badge>
                      </div>
                      <p className="text-sm opacity-80">{check.description}</p>
                      {check.regulation && (
                        <p className="text-xs opacity-60 mt-1">📖 {check.regulation}</p>
                      )}
                      {check.recommendation && (
                        <p className="text-xs mt-1 italic">💡 {check.recommendation}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risks Tab */}
          <TabsContent value="risks" className="space-y-6">
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  {SAMPLE_RISK_FLAGS.length} Risks Found
                </CardTitle>
                <CardDescription className="text-red-700/70">
                  Only medium and high severity issues that need your attention
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {SAMPLE_RISK_FLAGS.map((risk, index) => (
                  <Alert key={index} className={getSeverityColor(risk.severity)}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="flex items-center gap-2">
                      {risk.title}
                      <Badge variant="outline" className="text-xs">{risk.severity}</Badge>
                    </AlertTitle>
                    <AlertDescription>
                      {risk.description}
                      {risk.recommendation && (
                        <p className="mt-2 text-sm italic opacity-80">💡 {risk.recommendation}</p>
                      )}
                    </AlertDescription>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Checklist Tab */}
          <TabsContent value="checklist" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Lease Audit Checklist
                </CardTitle>
                <CardDescription>
                  Complete review of {SAMPLE_CHECKLIST.length} standard lease categories
                </CardDescription>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-green-600 font-medium">
                    ✅ {SAMPLE_CHECKLIST.filter(i => i.status === "pass").length} Pass
                  </span>
                  <span className="text-sm text-amber-600 font-medium">
                    ⚠️ {SAMPLE_CHECKLIST.filter(i => i.status === "warning").length} Warning
                  </span>
                  <span className="text-sm text-red-600 font-medium">
                    ❌ {SAMPLE_CHECKLIST.filter(i => i.status === "issue").length} Issue
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {SAMPLE_CHECKLIST.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      item.status === "pass"
                        ? "bg-green-50 border-green-200"
                        : item.status === "warning"
                        ? "bg-amber-50 border-amber-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <span className="text-lg flex-shrink-0 mt-0.5">
                      {item.status === "pass" ? "✅" : item.status === "warning" ? "⚠️" : "❌"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            item.status === "pass"
                              ? "text-green-700 border-green-300"
                              : item.status === "warning"
                              ? "text-amber-700 border-amber-300"
                              : "text-red-700 border-red-300"
                          }`}
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Market Tab */}
          <TabsContent value="market" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Rent Benchmarking — Austin, TX
                </CardTitle>
                <CardDescription>How this lease compares to the local market</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 rounded-lg p-4 text-center">
                      <p className="text-xs text-slate-500 mb-1">Your Rent</p>
                      <p className="text-2xl font-bold text-slate-800">$2,150</p>
                      <p className="text-xs text-slate-500">/month</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <p className="text-xs text-blue-600 mb-1">Area Median</p>
                      <p className="text-2xl font-bold text-blue-700">$2,300</p>
                      <p className="text-xs text-blue-500">/month</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <p className="text-xs text-green-600 mb-1">Difference</p>
                      <p className="text-2xl font-bold text-green-700">-6.5%</p>
                      <p className="text-xs text-green-500">below median</p>
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800 text-sm">Good Value</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Your rent is approximately 6.5% below the median for similar 1-bedroom apartments in the Austin, TX 78701 area.
                      This represents a competitive rate given current market conditions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Disclaimer */}
        <Alert className="mt-6 bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Legal Disclaimer</AlertTitle>
          <AlertDescription className="text-blue-700">
            This report is provided for informational purposes only and does not constitute
            legal advice. Please consult with a qualified attorney for legal guidance regarding
            your lease agreement.
          </AlertDescription>
        </Alert>

        {/* CTA */}
        <Card className="mt-8 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="py-8 text-center">
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Ready to Analyze Your Own Lease?
            </h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Get your first analysis free. Upload your lease and receive a detailed report like this one in minutes.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button onClick={() => navigate("/register")} size="lg" className="gap-2">
                <ArrowRight className="h-4 w-4" />
                Start Free Analysis
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/pricing")}>
                View Pricing
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500">
          <p>© 2026 LeaseLenses. All rights reserved.</p>
          <p className="mt-2">
            This tool provides information only and does not constitute legal advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
