import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createClient } from "@metagptx/web-sdk";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  FileText, ArrowLeft, Calendar, Download, AlertTriangle, 
  CheckCircle, User, Home, DollarSign, Clock, Info, Shield,
  ExternalLink, Scale, MapPin, Crosshair, PanelRightOpen, PanelRightClose, BarChart3,
  FileDown, Loader2, Sparkles, TrendingUp
} from "lucide-react";
import PDFViewer from "@/components/PDFViewer";
import GoogleCalendarButton from "@/components/GoogleCalendarButton";
import AmendmentMemoButton from "@/components/AmendmentMemoButton";
import RentBenchmark from "@/components/RentBenchmark";
import PaywallOverlay from "@/components/PaywallOverlay";
import LeaseHealthScore, { calculateHealthScore } from "@/components/LeaseHealthScore";
import { checkAuthStatus } from "@/lib/checkAuth";

const client = createClient();

interface Extraction {
  id: number;
  document_id: number;
  tenant_name: string | null;
  landlord_name: string | null;
  property_address: string | null;
  monthly_rent: number | null;
  security_deposit: number | null;
  lease_start_date: string | null;
  lease_end_date: string | null;
  renewal_notice_days: number | null;
  pet_policy: string | null;
  late_fee_terms: string | null;
  risk_flags: string | null;
  compliance_data: string | null;
  source_map: string | null;
  created_at: string;
}

interface RiskFlag {
  severity: string;
  category: string;
  description: string;
}

interface ComplianceCheck {
  category: string;
  title: string;
  regulation: string;
  source_url: string;
  status: string;
  description: string;
  recommendation: string;
}

interface ComplianceData {
  state_code: string | null;
  state_name: string | null;
  regulations_found: boolean;
  compliance_checks: ComplianceCheck[];
  overall_status: string;
  summary?: {
    compliant: number;
    warnings: number;
    violations: number;
    info: number;
  };
}

// Clickable field component for source tracing
function SourceTraceable({
  fieldName,
  children,
  hasSource,
  activeField,
  onFieldClick,
}: {
  fieldName: string;
  children: React.ReactNode;
  hasSource: boolean;
  activeField: string | null;
  onFieldClick: (field: string) => void;
}) {
  if (!hasSource) return <>{children}</>;

  const isActive = activeField === fieldName;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => onFieldClick(fieldName)}
          className={`text-left w-full rounded-md px-2 py-1 -mx-2 transition-colors cursor-pointer ${
            isActive
              ? "bg-blue-100 ring-2 ring-blue-400"
              : "hover:bg-blue-50"
          }`}
        >
          <div className="flex items-center gap-1">
            {children}
            <Crosshair
              className={`h-3 w-3 flex-shrink-0 transition-colors ${
                isActive ? "text-blue-600" : "text-slate-400"
              }`}
            />
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p className="text-xs">Click to locate in PDF</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default function ReportPage() {
  const navigate = useNavigate();
  const { documentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [document, setDocument] = useState<any>(null);
  const [extraction, setExtraction] = useState<Extraction | null>(null);
  const [riskFlags, setRiskFlags] = useState<RiskFlag[]>([]);
  const [complianceData, setComplianceData] = useState<ComplianceData | null>(null);

  // Source tracing state
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [sourceFields, setSourceFields] = useState<Set<string>>(new Set());

  // Credits/paywall state
  const [isPaidUser, setIsPaidUser] = useState(true); // default to true to avoid flash

  // Executive summary
  const [executiveSummary, setExecutiveSummary] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  useEffect(() => {
    loadReport();
  }, [documentId]);

  const loadReport = async () => {
    try {
      const { user: authUser } = await checkAuthStatus();
      if (!authUser) {
        navigate("/dashboard");
        return;
      }

      // Check if user has paid credits (for paywall logic)
      try {
        const creditsRes = await client.apiCall.invoke({ url: "/api/v1/lease/credits", method: "GET" });
        const c = creditsRes.data;
        // User is "paid" if admin, has paid credits, subscription, or zero free credits (used their free one)
        setIsPaidUser(c.is_admin || c.paid_credits > 0 || c.subscription_type === "monthly");
      } catch {
        setIsPaidUser(true); // fallback to showing content
      }

      const docResponse = await client.entities.documents.get({
        id: documentId!
      });
      setDocument(docResponse.data);

      const extractionResponse = await client.entities.extractions.query({
        query: { document_id: parseInt(documentId!) },
        limit: 1
      });

      if (extractionResponse.data?.items?.length > 0) {
        const ext = extractionResponse.data.items[0];
        setExtraction(ext);

        // Parse risk flags
        if (ext.risk_flags) {
          try {
            const flags = JSON.parse(ext.risk_flags.replace(/'/g, '"'));
            setRiskFlags(Array.isArray(flags) ? flags : []);
          } catch (e) {
            console.error("Failed to parse risk flags:", e);
          }
        }

        // Load compliance data
        try {
          const complianceResponse = await client.apiCall.invoke({
            url: `/api/v1/lease/compliance/${ext.id}`,
            method: "GET"
          });
          setComplianceData(complianceResponse.data);
        } catch (e) {
          console.error("Failed to load compliance data:", e);
        }

        // Load source map to know which fields have sources
        try {
          const sourceResponse = await client.apiCall.invoke({
            url: `/api/v1/lease/source-map/${ext.id}`,
            method: "GET"
          });
          const sm = sourceResponse.data?.source_map || {};
          setSourceFields(new Set(Object.keys(sm)));
        } catch (e) {
          console.error("Failed to load source map:", e);
        }

        // Load executive summary (async, non-blocking)
        setSummaryLoading(true);
        client.apiCall.invoke({
          url: `/api/v1/lease/summary/${ext.id}`,
          method: "GET"
        }).then((res) => {
          if (res.data?.success) setExecutiveSummary(res.data.data);
        }).catch(() => {}).finally(() => setSummaryLoading(false));
      }
    } catch (error) {
      console.error("Failed to load report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldClick = (fieldName: string) => {
    if (activeField === fieldName) {
      setActiveField(null);
    } else {
      setActiveField(fieldName);
      if (!showPDFViewer) {
        setShowPDFViewer(true);
      }
    }
  };

  const handleDownloadCalendar = async () => {
    if (!extraction) return;
    try {
      const response = await client.apiCall.invoke({
        url: `/api/v1/lease/calendar/${extraction.id}`,
        method: "GET"
      });
      const blob = new Blob([response.data], { type: "text/calendar" });
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = `lease-reminders-${extraction.id}.ics`;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download calendar:", error);
    }
  };

  const handleExportPdf = async () => {
    if (!extraction) return;
    setExportingPdf(true);
    try {
      const response = await fetch(`/api/v1/lease/export-pdf/${extraction.id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${await client.auth.getToken?.() || ""}`,
        },
      });
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = `LeaseLenses-Report-${extraction.id}.pdf`;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } catch (error) {
      // Fallback: try via apiCall
      try {
        const res = await client.apiCall.invoke({
          url: `/api/v1/lease/export-pdf/${extraction.id}`,
          method: "GET",
          responseType: "blob",
        });
        const blob = new Blob([res.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const a = window.document.createElement("a");
        a.href = url;
        a.download = `LeaseLenses-Report-${extraction.id}.pdf`;
        window.document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        window.document.body.removeChild(a);
      } catch (e2) {
        console.error("PDF export failed:", e2);
      }
    } finally {
      setExportingPdf(false);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return "Not specified";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Not specified";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric"
      });
    } catch { return dateStr; }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium": return "bg-amber-100 text-amber-700 border-amber-200";
      case "low": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
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

  const getOverallStatusBadge = (status: string) => {
    switch (status) {
      case "compliant": return <Badge className="bg-green-100 text-green-700">Compliant</Badge>;
      case "violations_found": return <Badge variant="destructive">Violations Found</Badge>;
      case "warnings_found": return <Badge className="bg-amber-100 text-amber-700">Warnings</Badge>;
      default: return <Badge variant="secondary">Review Recommended</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 py-4"><Skeleton className="h-8 w-48" /></div>
        </header>
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <Skeleton className="h-64 w-full mb-4" />
          <Skeleton className="h-96 w-full" />
        </main>
      </div>
    );
  }

  if (!document || !extraction) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />Back
            </Button>
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-slate-800">LeaseLenses</span>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Card>
            <CardContent className="py-12 text-center">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">Report Not Found</h3>
              <p className="text-slate-500 mb-6">This document hasn't been analyzed yet or doesn't exist.</p>
              <Button onClick={() => navigate("/dashboard")}>Return to Dashboard</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />Back
            </Button>
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-slate-800">LeaseLenses</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Source Tracing Toggle */}
            <Button
              variant={showPDFViewer ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setShowPDFViewer(!showPDFViewer);
                if (showPDFViewer) setActiveField(null);
              }}
              className="gap-2"
            >
              {showPDFViewer ? (
                <PanelRightClose className="h-4 w-4" />
              ) : (
                <PanelRightOpen className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{showPDFViewer ? "Hide PDF" : "View PDF Source"}</span>
            </Button>

            {/* Google Calendar */}
            <GoogleCalendarButton extractionId={extraction.id} />

            {/* Amendment Memo */}
            {isPaidUser && <AmendmentMemoButton extractionId={extraction.id} />}

            {/* ICS Download */}
            <Button variant="outline" size="sm" onClick={handleDownloadCalendar} className="gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">.ics</span>
            </Button>

            {/* PDF Report Export */}
            {isPaidUser && (
              <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={exportingPdf} className="gap-2">
                {exportingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                <span className="hidden sm:inline">Export PDF</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content with Split View */}
      <div className={`flex ${showPDFViewer ? "gap-0" : ""}`}>
        {/* Report Content */}
        <main
          className={`py-8 px-4 transition-all duration-300 overflow-y-auto ${
            showPDFViewer ? "w-1/2 max-w-none" : "container mx-auto max-w-4xl w-full"
          }`}
        >
          {/* Score & Summary Card */}
          <Card className="mb-6 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600" />
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Health Score */}
                <div className="flex-shrink-0 mx-auto md:mx-0">
                  <LeaseHealthScore
                    score={
                      executiveSummary?.health_score ??
                      calculateHealthScore(riskFlags, complianceData, extraction)
                    }
                    size={150}
                  />
                </div>

                {/* Summary */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">{document.file_name}</h2>
                      <p className="text-sm text-slate-500">Analyzed {formatDate(extraction.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {executiveSummary?.grade && (
                        <Badge className="bg-blue-100 text-blue-700 text-base px-3 py-1 font-bold">
                          {executiveSummary.grade}
                        </Badge>
                      )}
                      {sourceFields.size > 0 && (
                        <Badge variant="outline" className="text-blue-600 border-blue-200 gap-1">
                          <Crosshair className="h-3 w-3" />Source tracing
                        </Badge>
                      )}
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />Complete
                      </Badge>
                    </div>
                  </div>

                  {/* AI Summary */}
                  {summaryLoading ? (
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating AI summary...
                    </div>
                  ) : executiveSummary?.summary ? (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {executiveSummary.summary}
                      </p>
                      {executiveSummary.key_highlights?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {executiveSummary.key_highlights.map((h: string, i: number) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full"
                            >
                              <Sparkles className="h-3 w-3 text-blue-500" />
                              {h}
                            </span>
                          ))}
                        </div>
                      )}
                      {executiveSummary.top_action && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                          <p className="text-xs text-blue-800">
                            <span className="font-semibold">Recommended:</span> {executiveSummary.top_action}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        {riskFlags.length} risk{riskFlags.length !== 1 ? "s" : ""} found
                      </div>
                      {complianceData?.summary && (
                        <div className="flex items-center gap-1">
                          <Shield className="h-4 w-4 text-blue-500" />
                          {complianceData.summary.compliant} compliant
                          {complianceData.summary.violations > 0 && (
                            <>, {complianceData.summary.violations} violation{complianceData.summary.violations !== 1 ? "s" : ""}</>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="compliance">
                Compliance
                {complianceData?.summary?.violations && complianceData.summary.violations > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 justify-center">
                    {complianceData.summary.violations}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="risks">
                Risks
                {riskFlags.length > 0 && (
                  <Badge className="ml-2 bg-amber-100 text-amber-700 h-5 w-5 p-0 justify-center">
                    {riskFlags.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="market">Market Data</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Extracted Information</CardTitle>
                  <CardDescription>
                    Key terms and details from your lease agreement
                    {sourceFields.size > 0 && (
                      <span className="text-blue-600 ml-1">
                        — click <Crosshair className="h-3 w-3 inline" /> fields to view source in PDF
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Parties */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-slate-700 flex items-center gap-2">
                        <User className="h-4 w-4" />Parties
                      </h4>
                      <div className="space-y-3 pl-6">
                        <div>
                          <p className="text-sm text-slate-500">Tenant</p>
                          <SourceTraceable fieldName="tenant_name" hasSource={sourceFields.has("tenant_name")} activeField={activeField} onFieldClick={handleFieldClick}>
                            <p className="font-medium">{extraction.tenant_name || "Not specified"}</p>
                          </SourceTraceable>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Landlord</p>
                          <SourceTraceable fieldName="landlord_name" hasSource={sourceFields.has("landlord_name")} activeField={activeField} onFieldClick={handleFieldClick}>
                            <p className="font-medium">{extraction.landlord_name || "Not specified"}</p>
                          </SourceTraceable>
                        </div>
                      </div>
                    </div>

                    {/* Property */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-slate-700 flex items-center gap-2">
                        <Home className="h-4 w-4" />Property
                      </h4>
                      <div className="pl-6">
                        <p className="text-sm text-slate-500">Address</p>
                        <SourceTraceable fieldName="property_address" hasSource={sourceFields.has("property_address")} activeField={activeField} onFieldClick={handleFieldClick}>
                          <p className="font-medium">{extraction.property_address || "Not specified"}</p>
                        </SourceTraceable>
                        {complianceData?.state_name && (
                          <Badge variant="outline" className="mt-2">
                            <MapPin className="h-3 w-3 mr-1" />{complianceData.state_name}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Financial */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-slate-700 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />Financial Terms
                      </h4>
                      <div className="space-y-3 pl-6">
                        <div>
                          <p className="text-sm text-slate-500">Monthly Rent</p>
                          <SourceTraceable fieldName="monthly_rent" hasSource={sourceFields.has("monthly_rent")} activeField={activeField} onFieldClick={handleFieldClick}>
                            <p className="font-medium text-lg">{formatCurrency(extraction.monthly_rent)}</p>
                          </SourceTraceable>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Security Deposit</p>
                          <SourceTraceable fieldName="security_deposit" hasSource={sourceFields.has("security_deposit")} activeField={activeField} onFieldClick={handleFieldClick}>
                            <p className="font-medium">{formatCurrency(extraction.security_deposit)}</p>
                          </SourceTraceable>
                        </div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-slate-700 flex items-center gap-2">
                        <Clock className="h-4 w-4" />Lease Term
                      </h4>
                      <div className="space-y-3 pl-6">
                        <div>
                          <p className="text-sm text-slate-500">Start Date</p>
                          <SourceTraceable fieldName="lease_start_date" hasSource={sourceFields.has("lease_start_date")} activeField={activeField} onFieldClick={handleFieldClick}>
                            <p className="font-medium">{formatDate(extraction.lease_start_date)}</p>
                          </SourceTraceable>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">End Date</p>
                          <SourceTraceable fieldName="lease_end_date" hasSource={sourceFields.has("lease_end_date")} activeField={activeField} onFieldClick={handleFieldClick}>
                            <p className="font-medium">{formatDate(extraction.lease_end_date)}</p>
                          </SourceTraceable>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Renewal Notice Period</p>
                          <p className="font-medium">
                            {extraction.renewal_notice_days ? `${extraction.renewal_notice_days} days` : "Not specified"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Additional Terms */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-slate-700 mb-2">Pet Policy</h4>
                      <SourceTraceable fieldName="pet_policy" hasSource={sourceFields.has("pet_policy")} activeField={activeField} onFieldClick={handleFieldClick}>
                        <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">
                          {extraction.pet_policy || "Not specified in the lease"}
                        </p>
                      </SourceTraceable>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-700 mb-2">Late Fee Terms</h4>
                      <SourceTraceable fieldName="late_fee_terms" hasSource={sourceFields.has("late_fee_terms")} activeField={activeField} onFieldClick={handleFieldClick}>
                        <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">
                          {extraction.late_fee_terms || "Not specified in the lease"}
                        </p>
                      </SourceTraceable>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Compliance Tab */}
            <TabsContent value="compliance" className="space-y-6">
              {complianceData ? (
                <>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Scale className="h-5 w-5 text-blue-600" />
                          <CardTitle className="text-lg">State Compliance Check</CardTitle>
                        </div>
                        {getOverallStatusBadge(complianceData.overall_status)}
                      </div>
                      <CardDescription>
                        {complianceData.state_name
                          ? `Checking against ${complianceData.state_name} rental regulations`
                          : "State could not be identified from the property address"}
                      </CardDescription>
                    </CardHeader>
                    {complianceData.summary && (
                      <CardContent>
                        <div className="grid grid-cols-4 gap-4">
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-700">{complianceData.summary.compliant}</p>
                            <p className="text-sm text-green-600">Compliant</p>
                          </div>
                          <div className="text-center p-4 bg-amber-50 rounded-lg">
                            <p className="text-2xl font-bold text-amber-700">{complianceData.summary.warnings}</p>
                            <p className="text-sm text-amber-600">Warnings</p>
                          </div>
                          <div className="text-center p-4 bg-red-50 rounded-lg">
                            <p className="text-2xl font-bold text-red-700">{complianceData.summary.violations}</p>
                            <p className="text-sm text-red-600">Violations</p>
                          </div>
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-700">{complianceData.summary.info}</p>
                            <p className="text-sm text-blue-600">Info</p>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>

                  <Card>
                    <CardHeader><CardTitle className="text-lg">Detailed Compliance Analysis</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      {complianceData.compliance_checks.map((check, index) => (
                        <div key={index} className={`p-4 rounded-lg border ${getComplianceStatusColor(check.status)}`}>
                          <div className="flex items-start gap-3">
                            {getComplianceStatusIcon(check.status)}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium">{check.title}</h4>
                                <Badge variant="outline" className="text-xs">{check.category.replace(/_/g, " ")}</Badge>
                              </div>
                              <p className="text-sm mb-2">{check.description}</p>
                              {check.recommendation && <p className="text-sm italic opacity-80">💡 {check.recommendation}</p>}
                              {check.source_url && (
                                <a href={check.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs mt-2 hover:underline">
                                  <ExternalLink className="h-3 w-3" />View Source
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Shield className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-700 mb-2">Compliance Data Not Available</h3>
                    <p className="text-slate-500">Unable to load compliance information for this document.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Risks Tab */}
            <TabsContent value="risks" className="space-y-6">
              {riskFlags.length > 0 ? (
                <Card className="border-amber-200 bg-amber-50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
                      <AlertTriangle className="h-5 w-5" />
                      Risk Analysis ({riskFlags.length} item{riskFlags.length !== 1 ? "s" : ""} found)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Free users see only summary, paid users see full details */}
                    {isPaidUser ? (
                      riskFlags.map((risk, index) => (
                        <Alert key={index} className={getSeverityColor(risk.severity)}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle className="flex items-center gap-2">
                            {risk.category}
                            <Badge variant="outline" className="text-xs">{risk.severity}</Badge>
                          </AlertTitle>
                          <AlertDescription>{risk.description}</AlertDescription>
                        </Alert>
                      ))
                    ) : (
                      <>
                        {/* Show first risk as teaser */}
                        {riskFlags.slice(0, 1).map((risk, index) => (
                          <Alert key={index} className={getSeverityColor(risk.severity)}>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle className="flex items-center gap-2">
                              {risk.category}
                              <Badge variant="outline" className="text-xs">{risk.severity}</Badge>
                            </AlertTitle>
                            <AlertDescription>{risk.description}</AlertDescription>
                          </Alert>
                        ))}
                        {riskFlags.length > 1 && (
                          <PaywallOverlay riskCount={riskFlags.length - 1} />
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-700 mb-2">No Major Risks Identified</h3>
                    <p className="text-slate-500">Our AI analysis did not find any significant risk flags in this lease.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Market Data Tab */}
            <TabsContent value="market" className="space-y-6">
              {isPaidUser ? (
                <RentBenchmark extractionId={extraction.id} />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      Rent Benchmarking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PaywallOverlay />
                  </CardContent>
                </Card>
              )}
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
        </main>

        {/* PDF Viewer Panel (Source Tracing) */}
        {showPDFViewer && extraction && (
          <div className="w-1/2 border-l bg-white sticky top-[65px] h-[calc(100vh-65px)]">
            <PDFViewer
              documentId={extraction.document_id}
              extractionId={extraction.id}
              activeField={activeField}
              onClose={() => {
                setShowPDFViewer(false);
                setActiveField(null);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
