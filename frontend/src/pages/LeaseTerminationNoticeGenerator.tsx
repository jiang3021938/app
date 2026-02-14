import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText, ArrowLeft, ArrowRight, Shield, Copy, CheckCircle,
  AlertTriangle, Info, ClipboardCheck, Calendar,
} from "lucide-react";

interface StateNoticePeriod {
  name: string;
  monthToMonth: string;
  monthToMonthDays: number;
  fixedTerm: string;
  notes: string;
}

const stateNoticePeriods: Record<string, StateNoticePeriod> = {
  AL: { name: "Alabama", monthToMonth: "30 days", monthToMonthDays: 30, fixedTerm: "No notice required (ends automatically)", notes: "Month-to-month tenancies require 30 days' written notice." },
  AK: { name: "Alaska", monthToMonth: "30 days", monthToMonthDays: 30, fixedTerm: "No notice required", notes: "30 days' notice for month-to-month leases." },
  AZ: { name: "Arizona", monthToMonth: "30 days", monthToMonthDays: 30, fixedTerm: "No notice required", notes: "30 days for month-to-month; fixed-term leases end on their own." },
  CA: { name: "California", monthToMonth: "30 days (<1 yr) / 60 days (≥1 yr)", monthToMonthDays: 30, fixedTerm: "No notice required", notes: "Tenants who have lived in the unit less than 1 year must give 30 days' notice. Those with 1+ year of tenancy must give 60 days' notice for month-to-month." },
  CO: { name: "Colorado", monthToMonth: "21 days", monthToMonthDays: 21, fixedTerm: "No notice required", notes: "As of 2023, Colorado requires 21 days' notice for month-to-month tenancies." },
  CT: { name: "Connecticut", monthToMonth: "3 days (by law, but 30 recommended)", monthToMonthDays: 3, fixedTerm: "No notice required", notes: "Connecticut law technically requires only 3 days but most leases specify 30 days." },
  FL: { name: "Florida", monthToMonth: "30 days", monthToMonthDays: 30, fixedTerm: "No notice required", notes: "15 days for month-to-month; 30 days is standard practice." },
  GA: { name: "Georgia", monthToMonth: "30 days", monthToMonthDays: 30, fixedTerm: "No notice required", notes: "60 days' notice recommended for leases over 1 year." },
  IL: { name: "Illinois", monthToMonth: "30 days", monthToMonthDays: 30, fixedTerm: "No notice required", notes: "30 days' written notice for month-to-month tenancies." },
  MA: { name: "Massachusetts", monthToMonth: "30 days or one rental period", monthToMonthDays: 30, fixedTerm: "No notice required", notes: "Notice must be at least 30 days or one full rental period, whichever is longer." },
  MD: { name: "Maryland", monthToMonth: "60 days", monthToMonthDays: 60, fixedTerm: "No notice required", notes: "Maryland requires 60 days' notice for month-to-month tenancies." },
  NJ: { name: "New Jersey", monthToMonth: "30 days", monthToMonthDays: 30, fixedTerm: "No notice required", notes: "Tenants must give 30 days' notice. Landlords have limited grounds for termination." },
  NY: { name: "New York", monthToMonth: "30 days (<1 yr) / 60 days (1–2 yr) / 90 days (≥2 yr)", monthToMonthDays: 30, fixedTerm: "No notice required", notes: "Notice period varies by length of tenancy under the Housing Stability and Tenant Protection Act of 2019." },
  NC: { name: "North Carolina", monthToMonth: "7 days (week-to-week) / 30 days (month-to-month)", monthToMonthDays: 30, fixedTerm: "No notice required", notes: "Month-to-month requires 30 days; week-to-week requires 7 days." },
  OH: { name: "Ohio", monthToMonth: "30 days", monthToMonthDays: 30, fixedTerm: "No notice required", notes: "30 days' notice before the end of the monthly period." },
  OR: { name: "Oregon", monthToMonth: "30 days (<1 yr) / 90 days (≥1 yr)", monthToMonthDays: 30, fixedTerm: "No notice required", notes: "Landlords must give 90 days' notice after the first year. Tenants give 30 days." },
  PA: { name: "Pennsylvania", monthToMonth: "15 days", monthToMonthDays: 15, fixedTerm: "No notice required", notes: "15 days for month-to-month leases. Some municipalities require 30 days." },
  TX: { name: "Texas", monthToMonth: "30 days", monthToMonthDays: 30, fixedTerm: "No notice required", notes: "30 days' notice unless the lease specifies otherwise." },
  VA: { name: "Virginia", monthToMonth: "30 days", monthToMonthDays: 30, fixedTerm: "No notice required", notes: "30 days' written notice required for month-to-month tenancies." },
  WA: { name: "Washington", monthToMonth: "20 days", monthToMonthDays: 20, fixedTerm: "No notice required", notes: "Tenants must give 20 days' notice for month-to-month tenancies." },
};

const sortedStateKeys = Object.keys(stateNoticePeriods).sort((a, b) =>
  stateNoticePeriods[a].name.localeCompare(stateNoticePeriods[b].name),
);

const terminationReasons = [
  "End of lease term",
  "Month-to-month termination",
  "Early termination with notice",
  "Lease violation by landlord",
  "Other",
] as const;

function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function generateLetter(
  tenantName: string,
  landlordName: string,
  propertyAddress: string,
  state: string,
  leaseEndDate: string,
  reason: string,
  additionalNotes: string,
): string {
  const today = new Date();
  const todayStr = today.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const stateInfo = stateNoticePeriods[state];
  const stateName = stateInfo?.name ?? state;
  const noticePeriod = stateInfo?.monthToMonth ?? "30 days";

  let reasonText = "";
  switch (reason) {
    case "End of lease term":
      reasonText = `This letter serves as formal notice that I will not be renewing my lease, which is set to expire on ${formatDateLong(leaseEndDate)}. I intend to vacate the premises on or before that date.`;
      break;
    case "Month-to-month termination":
      reasonText = `This letter serves as my formal ${noticePeriod}' notice to terminate my month-to-month tenancy. In accordance with ${stateName} law, I am providing the required notice period. I intend to vacate the premises on or before ${formatDateLong(leaseEndDate)}.`;
      break;
    case "Early termination with notice":
      reasonText = `This letter serves as formal notice of my intent to terminate my lease early, effective ${formatDateLong(leaseEndDate)}. I understand that early termination may be subject to the terms and conditions outlined in our lease agreement, including any applicable early termination fees or penalties.`;
      break;
    case "Lease violation by landlord":
      reasonText = `This letter serves as formal notice that I am terminating my lease due to violations of the lease agreement and/or applicable landlord-tenant law by the landlord. These violations have materially affected my ability to use and enjoy the premises as intended. My intended move-out date is ${formatDateLong(leaseEndDate)}.`;
      break;
    default:
      reasonText = `This letter serves as formal notice of my intent to terminate my lease effective ${formatDateLong(leaseEndDate)}.`;
      break;
  }

  const notesSection = additionalNotes.trim()
    ? `\n\nAdditional details:\n${additionalNotes.trim()}`
    : "";

  return `${todayStr}

${tenantName}
${propertyAddress}

${landlordName}

Re: Notice of Lease Termination — ${propertyAddress}

Dear ${landlordName},

${reasonText}${notesSection}

I will ensure the property is returned in good condition, consistent with normal wear and tear. Please let me know the process for the move-out inspection and the return of my security deposit in accordance with ${stateName} law.

Please send any remaining correspondence, including the security deposit refund, to the address I will provide upon move-out.

Thank you for your attention to this matter.

Sincerely,

${tenantName}`;
}

export default function LeaseTerminationNoticeGenerator() {
  const navigate = useNavigate();
  const [tenantName, setTenantName] = useState("");
  const [landlordName, setLandlordName] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [leaseEndDate, setLeaseEndDate] = useState("");
  const [terminationReason, setTerminationReason] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [copied, setCopied] = useState(false);

  const stateInfo = selectedState ? stateNoticePeriods[selectedState] : null;

  const isFormValid =
    tenantName.trim() !== "" &&
    landlordName.trim() !== "" &&
    propertyAddress.trim() !== "" &&
    selectedState !== "" &&
    leaseEndDate !== "" &&
    terminationReason !== "";

  const handleGenerate = () => {
    if (!isFormValid) return;
    const letter = generateLetter(
      tenantName.trim(),
      landlordName.trim(),
      propertyAddress.trim(),
      selectedState,
      leaseEndDate,
      terminationReason,
      additionalNotes,
    );
    setGeneratedLetter(letter);
    setCopied(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = generatedLetter;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleReset = () => {
    setTenantName("");
    setLandlordName("");
    setPropertyAddress("");
    setSelectedState("");
    setLeaseEndDate("");
    setTerminationReason("");
    setAdditionalNotes("");
    setGeneratedLetter("");
    setCopied(false);
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
            Lease Termination Notice Generator
          </h1>
          <p className="text-lg text-slate-600">
            Generate a professional lease termination notice letter in seconds. Fill in your
            details, select your state for accurate notice period requirements, and download
            a ready-to-send letter — completely free, no sign-up required.
          </p>
        </div>

        {/* Generator Card */}
        <Card className="max-w-2xl mx-auto mb-12 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ClipboardCheck className="h-5 w-5 text-blue-600" />
              Generate Your Termination Notice
            </CardTitle>
            <CardDescription>
              Fill in all required fields below. The generated letter will include
              state-specific notice period information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Tenant Name */}
            <div className="space-y-2">
              <Label htmlFor="tenant-name">Tenant Name *</Label>
              <Input
                id="tenant-name"
                placeholder="e.g. Jane Smith"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
              />
            </div>

            {/* Landlord Name */}
            <div className="space-y-2">
              <Label htmlFor="landlord-name">Landlord / Property Manager Name *</Label>
              <Input
                id="landlord-name"
                placeholder="e.g. John Doe or ABC Property Management"
                value={landlordName}
                onChange={(e) => setLandlordName(e.target.value)}
              />
            </div>

            {/* Property Address */}
            <div className="space-y-2">
              <Label htmlFor="property-address">Property Address *</Label>
              <Input
                id="property-address"
                placeholder="e.g. 123 Main St, Apt 4B, Los Angeles, CA 90001"
                value={propertyAddress}
                onChange={(e) => setPropertyAddress(e.target.value)}
              />
            </div>

            {/* State */}
            <div className="space-y-2">
              <Label htmlFor="state-select">State *</Label>
              <Select value={selectedState} onValueChange={(value) => { setSelectedState(value); setGeneratedLetter(""); }}>
                <SelectTrigger id="state-select">
                  <SelectValue placeholder="Select your state" />
                </SelectTrigger>
                <SelectContent>
                  {sortedStateKeys.map((key) => (
                    <SelectItem key={key} value={key}>
                      {stateNoticePeriods[key].name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* State Notice Period Info */}
            {stateInfo && (
              <div className="flex items-start gap-2 rounded-md bg-blue-50 border border-blue-200 p-3 text-sm text-slate-700">
                <Calendar className="h-4 w-4 mt-0.5 text-blue-500 shrink-0" />
                <div>
                  <p className="font-semibold text-blue-800">
                    {stateInfo.name} — Required Notice Period
                  </p>
                  <p className="mt-1">
                    <span className="font-medium">Month-to-month:</span> {stateInfo.monthToMonth}
                  </p>
                  <p>
                    <span className="font-medium">Fixed-term lease:</span> {stateInfo.fixedTerm}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{stateInfo.notes}</p>
                </div>
              </div>
            )}

            {/* Lease End Date */}
            <div className="space-y-2">
              <Label htmlFor="lease-end-date">Intended Move-Out / Lease End Date *</Label>
              <Input
                id="lease-end-date"
                type="date"
                value={leaseEndDate}
                onChange={(e) => setLeaseEndDate(e.target.value)}
              />
            </div>

            {/* Termination Reason */}
            <div className="space-y-2">
              <Label htmlFor="termination-reason">Reason for Termination *</Label>
              <Select value={terminationReason} onValueChange={(value) => { setTerminationReason(value); setGeneratedLetter(""); }}>
                <SelectTrigger id="termination-reason">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {terminationReasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="additional-notes">Additional Notes (optional)</Label>
              <Textarea
                id="additional-notes"
                placeholder="Any additional details you'd like to include in the letter..."
                rows={3}
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={!isFormValid}
                onClick={handleGenerate}
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Notice
              </Button>
              {generatedLetter && (
                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              )}
            </div>

            {/* Generated Letter */}
            {generatedLetter && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">Your Termination Notice</h3>
                  <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                    {copied ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy to Clipboard
                      </>
                    )}
                  </Button>
                </div>
                <div className="rounded-lg border-2 border-blue-200 bg-white p-6">
                  <pre className="whitespace-pre-wrap text-sm text-slate-800 font-sans leading-relaxed">
                    {generatedLetter}
                  </pre>
                </div>
                <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>
                    This letter is a template and may need to be customized for your
                    specific situation. Check your lease agreement for any additional
                    termination requirements. Consider sending this notice via certified
                    mail to create a delivery record.
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="max-w-2xl mx-auto mb-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
          <CardContent className="p-8 text-center space-y-4">
            <Shield className="h-10 w-10 mx-auto opacity-90" />
            <h2 className="text-2xl font-bold">Want to Understand Your Full Lease?</h2>
            <p className="text-blue-100 max-w-lg mx-auto">
              Before terminating, make sure you know your rights. Upload your lease to
              LeaseLenses for an AI-powered analysis covering termination clauses, penalties,
              notice requirements, and more.
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

        {/* State Notice Periods Reference */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Lease Termination Notice Periods by State
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sortedStateKeys.map((key) => {
              const s = stateNoticePeriods[key];
              return (
                <Card key={key} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <span className="font-semibold text-slate-800 text-sm">{s.name}</span>
                      <Badge variant="default" className="bg-blue-100 text-blue-700 hover:bg-blue-100 shrink-0 text-xs">
                        {s.monthToMonth}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">{s.notes}</p>
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
              What Is a Lease Termination Notice?
            </h2>
            <p className="text-slate-600 leading-relaxed">
              A lease termination notice is a formal written document that a tenant or
              landlord uses to communicate the intent to end a rental agreement. Whether
              you&apos;re ending a month-to-month tenancy or choosing not to renew a
              fixed-term lease, a properly written termination notice protects your legal
              rights and creates a clear record of your intent. Most states require written
              notice to be delivered within a specific timeframe before the intended move-out
              date, and failure to provide proper notice can result in financial penalties or
              continued lease obligations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              When Do You Need a Lease Termination Notice?
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              You should provide a formal termination notice in any of these situations:
            </p>
            <ul className="space-y-2">
              {[
                "Your fixed-term lease is ending and you do not plan to renew — even if the lease expires automatically, written notice avoids confusion and protects your security deposit.",
                "You have a month-to-month tenancy and want to move out — nearly every state requires advance written notice for month-to-month agreements.",
                "You need to break your lease early — providing written notice is usually required even when paying an early termination fee.",
                "Your landlord has violated the lease terms — documenting the violation and your intent to terminate creates an important legal record.",
                "You are relocating for work, military service, or personal reasons — some states provide special protections (e.g., SCRA for military members).",
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
              State-Specific Notice Requirements
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Every state has its own rules for how much notice a tenant must provide before
              ending a lease. Here are some key differences:
            </p>
            <ul className="space-y-2">
              {[
                "California requires 30 days' notice for tenancies under one year and 60 days for tenancies of one year or longer.",
                "New York's notice period depends on how long you've lived in the unit: 30 days for less than one year, 60 days for one to two years, and 90 days for two or more years.",
                "Texas generally requires 30 days' notice unless your lease specifies a different period.",
                "Oregon requires tenants to give 30 days' notice for month-to-month tenancies, while landlords must give 90 days after the first year.",
                "Washington requires only 20 days' notice from tenants for month-to-month tenancies.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-slate-600">
                  <Info className="h-4 w-4 mt-1 text-blue-500 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              How to Deliver Your Termination Notice
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              How you deliver your termination notice matters as much as what it says.
              Follow these best practices:
            </p>
            <ul className="space-y-2">
              {[
                "Send via certified mail with return receipt requested — this creates proof of delivery that can be used in court if needed.",
                "Hand-deliver a copy and ask the landlord to sign and date an acknowledgment — keep your own signed copy.",
                "Email delivery may be acceptable if your lease specifically allows electronic communication for notices.",
                "Keep copies of everything — the original letter, delivery receipts, and any responses from your landlord.",
                "Send the notice well in advance of the required deadline to account for mail delivery time.",
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
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">
                  Can I terminate my lease early without penalty?
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  It depends on your lease terms and state law. Some leases include an early
                  termination clause that allows you to break the lease by paying a fee
                  (often one to two months&apos; rent). In some states, landlords are required
                  to mitigate damages by making reasonable efforts to re-rent the unit, which
                  can reduce the amount you owe. Military personnel may terminate leases
                  early under the Servicemembers Civil Relief Act (SCRA).
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">
                  What happens if I don&apos;t give proper notice?
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  If you fail to provide the required notice, you may be held responsible for
                  rent through the end of the notice period, even after you move out. For
                  example, if your state requires 30 days&apos; notice and you only give 15,
                  your landlord may deduct the remaining 15 days&apos; rent from your security
                  deposit or pursue you for the balance.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">
                  Does my landlord have to return my security deposit after termination?
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Yes. In all 50 states, landlords are required to return your security
                  deposit within a specific time frame after move-out (typically 14–60 days
                  depending on the state). Landlords may deduct for unpaid rent, damages
                  beyond normal wear and tear, and cleaning costs specified in the lease.
                  Your termination notice should include a forwarding address for the deposit
                  refund.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">
                  Can I email my lease termination notice?
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  While some states and lease agreements accept electronic notice, many
                  require written notice delivered by mail or in person. To be safe, send
                  your termination notice via certified mail and keep a copy for your
                  records. If your lease specifically allows email notice, you may use that
                  as well, but always confirm receipt.
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
