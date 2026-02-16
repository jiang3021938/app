import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  ArrowLeft, 
  Shield, 
  Clock, 
  TrendingUp, 
  DoorOpen, 
  AlertCircle,
  ExternalLink,
  Calculator
} from "lucide-react";
import { getStateBySlug } from "@/data/stateData";

export default function StateLandlordTenantLaw() {
  const { stateSlug } = useParams<{ stateSlug: string }>();
  const navigate = useNavigate();
  
  const stateInfo = stateSlug ? getStateBySlug(stateSlug) : undefined;

  // Set document title and meta tags for SEO
  useEffect(() => {
    if (stateInfo) {
      document.title = `${stateInfo.name} Landlord-Tenant Law Guide | LeaseLenses`;
      
      const setMetaTag = (selector: string, attr: string, value: string, createTag?: string) => {
        let tag = document.querySelector(selector);
        if (!tag) {
          tag = document.createElement(createTag || 'meta');
          if (selector.includes('property=')) {
            const prop = selector.match(/property="([^"]+)"/)?.[1];
            if (prop) tag.setAttribute('property', prop);
          } else if (selector.includes('name=')) {
            const name = selector.match(/name="([^"]+)"/)?.[1];
            if (name) tag.setAttribute('name', name);
          }
          document.head.appendChild(tag);
        }
        tag.setAttribute(attr, value);
      };

      const description = `Complete guide to ${stateInfo.name} landlord-tenant law. Learn about security deposits, rent increases, notice requirements, and tenant rights in ${stateInfo.name}.`;
      setMetaTag('meta[name="description"]', 'content', description);
      setMetaTag('meta[property="og:title"]', 'content', `${stateInfo.name} Landlord-Tenant Law Guide`);
      setMetaTag('meta[property="og:description"]', 'content', description);
    }

    return () => {
      document.title = 'LeaseLenses - AI Lease Analysis';
    };
  }, [stateInfo]);

  // Handle state not found
  if (!stateInfo) {
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b bg-white sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />Home
            </Button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <FileText className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-bold text-slate-800">LeaseLenses</span>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 max-w-3xl text-center">
          <AlertCircle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 mb-4">State Not Found</h1>
          <p className="text-slate-600 mb-6">
            We couldn't find landlord-tenant law information for the state you're looking for.
          </p>
          <Button onClick={() => navigate("/")}>
            Return Home
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />Home
          </Button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <FileText className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-bold text-slate-800">LeaseLenses</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Badge variant="secondary" className="mb-4">State Guide</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-4">
            {stateInfo.name} Landlord-Tenant Law Guide
          </h1>
          <p className="text-lg text-slate-600">
            {stateInfo.description}
          </p>
        </div>

        {/* Quick Facts Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Security Deposit Limit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700">{stateInfo.securityDepositLimit}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                Deposit Return Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700">{stateInfo.securityDepositReturn}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Rent Increase Notice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700">{stateInfo.rentIncreaseNotice}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DoorOpen className="h-5 w-5 text-amber-600" />
                Entry Notice Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700">{stateInfo.entryNotice}</p>
            </CardContent>
          </Card>
        </div>

        {/* Key Statutes */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Key Statutes and Regulations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {stateInfo.keyStatutes.map((statute, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span className="text-slate-700">{statute}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Common Issues */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Common Compliance Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              Landlords and tenants in {stateInfo.name} should be aware of these frequent violations:
            </p>
            <ul className="space-y-2">
              {stateInfo.commonIssues.map((issue, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">⚠️</span>
                  <span className="text-slate-700">{issue}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Free Tools Section */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              Free Tools for {stateInfo.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 mb-4">
              Use our free calculators to check compliance with {stateInfo.name} law:
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => navigate("/tools/security-deposit-calculator")}
              >
                <Shield className="h-4 w-4 mr-2" />
                Security Deposit Calculator
              </Button>
              <Button 
                variant="outline"
                className="justify-start" 
                onClick={() => navigate("/tools/rent-increase-calculator")}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Rent Increase Calculator
              </Button>
              <Button 
                variant="outline"
                className="justify-start" 
                onClick={() => navigate("/tools/late-fee-checker")}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Late Fee Checker
              </Button>
              <Button 
                variant="outline"
                className="justify-start" 
                onClick={() => navigate("/tools/lease-termination-notice-generator")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Notice Generator
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Official Resources */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-slate-600" />
              Official Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {stateInfo.resources.map((resource, index) => (
                <li key={index}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {resource.title}
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0">
          <CardContent className="py-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              Analyze Your {stateInfo.name} Lease
            </h2>
            <p className="text-blue-100 mb-6">
              Upload your lease and let AI check compliance with {stateInfo.name} law, 
              flag risks, and suggest improvements.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                variant="secondary" 
                size="lg" 
                onClick={() => navigate("/dashboard")}
              >
                Start Free Analysis
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="bg-transparent border-white text-white hover:bg-white/10"
                onClick={() => navigate("/pricing")}
              >
                View Pricing
              </Button>
            </div>
            <p className="text-xs text-blue-200 mt-3">
              No credit card required. First analysis free.
            </p>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-600">
            <strong>Disclaimer:</strong> This information is provided for educational purposes only 
            and does not constitute legal advice. Landlord-tenant laws can be complex and subject 
            to change. Always consult with a qualified attorney for specific legal guidance regarding 
            your situation in {stateInfo.name}.
          </p>
        </div>
      </main>
    </div>
  );
}
