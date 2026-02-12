import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText, ArrowLeft, ArrowRight, CheckCircle, Shield, Calendar,
  BarChart3, Scale, TrendingUp, Sparkles, Building2, Upload
} from "lucide-react";

const features = [
  {
    icon: <FileText className="h-10 w-10 text-blue-500" />,
    title: "AI-Powered Data Extraction",
    description: "Upload your lease PDF and our AI instantly extracts key terms, dates, and financial details with 99%+ accuracy.",
    details: [
      "Tenant & landlord names",
      "Property address & unit details",
      "Monthly rent & security deposit",
      "Lease start & end dates",
      "Renewal notice period",
      "Pet policy & late fee terms",
    ],
  },
  {
    icon: <BarChart3 className="h-10 w-10 text-indigo-500" />,
    emoji: "📊",
    title: "Health Score",
    description: "Get a 0-100 score with an AI-generated grade that summarizes the overall quality and fairness of your lease.",
    details: [
      "Instant overall lease quality rating",
      "AI-generated letter grade (A-F)",
      "Weighted scoring across key categories",
      "Clear improvement suggestions",
    ],
  },
  {
    icon: <Shield className="h-10 w-10 text-amber-500" />,
    title: "Risk Analysis & Compliance",
    description: "Automatically detect missing clauses, unusual terms, and state-specific compliance issues.",
    details: [
      "Missing clause detection",
      "Unusual term flagging",
      "State regulation compliance checks",
      "Severity-ranked risk alerts",
    ],
  },
  {
    icon: <Scale className="h-10 w-10 text-purple-500" />,
    emoji: "⚖️",
    title: "Lease Comparison",
    description: "Compare 2-3 leases side-by-side to identify differences in terms, costs, and risks before signing.",
    details: [
      "Side-by-side term comparison",
      "Cost differential highlights",
      "Risk comparison matrix",
      "Best-deal recommendation",
    ],
  },
  {
    icon: <TrendingUp className="h-10 w-10 text-green-500" />,
    emoji: "📈",
    title: "Rent Benchmarking",
    description: "See how your rent compares to market data in your city and neighborhood.",
    details: [
      "City-level rent comparisons",
      "Neighborhood market data",
      "Historical trend analysis",
      "Fair market value estimate",
    ],
  },
  {
    icon: <Sparkles className="h-10 w-10 text-rose-500" />,
    emoji: "📝",
    title: "Amendment Memo",
    description: "AI generates professional negotiation language for unfavorable lease terms.",
    details: [
      "Auto-detected unfavorable terms",
      "Professional amendment language",
      "Negotiation talking points",
      "Tenant-friendly alternatives",
    ],
  },
  {
    icon: <Building2 className="h-10 w-10 text-cyan-500" />,
    emoji: "🏢",
    title: "Portfolio Dashboard",
    description: "Manage all your properties at a glance with a unified portfolio view.",
    details: [
      "All properties in one view",
      "Upcoming expiration alerts",
      "Total portfolio summary",
      "Quick access to reports",
    ],
  },
  {
    icon: <Calendar className="h-10 w-10 text-green-500" />,
    title: "Smart Calendar Reminders",
    description: "Never miss a lease expiration, renewal deadline, or rent increase date.",
    details: [
      "Google Calendar integration",
      "Automatic deadline detection",
      "ICS file export",
      "Custom reminder lead times",
    ],
  },
];

export default function Features() {
  const navigate = useNavigate();

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
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <FileText className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-slate-800">LeaseLenses</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate("/pricing")}>
              View Pricing
            </Button>
            <Button onClick={() => navigate("/register")} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Upload className="h-4 w-4" />
              Try Free
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-16">
          <Badge className="bg-blue-100 text-blue-700 mb-4">All Features</Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
            Everything You Need to<br />
            <span className="text-blue-600">Manage Leases Smarter</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            From instant AI extraction to portfolio management — powerful tools designed
            specifically for landlords managing 2-20 properties.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mb-2">{feature.icon}</div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.details.map((detail, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-12 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Analyze Your First Lease?
          </h2>
          <p className="text-blue-100 mb-8 max-w-lg mx-auto">
            Sign up free and get your first analysis at no cost. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/register")}
              className="bg-white text-blue-600 hover:bg-blue-50 gap-2"
            >
              Sign Up Free <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/pricing")}
              className="border-white text-white hover:bg-white/10"
            >
              View Pricing
            </Button>
          </div>
        </div>
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
