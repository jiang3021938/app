import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@metagptx/web-sdk";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

const client = createClient();

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  credits: number;
  popular: boolean;
  recurring?: boolean;
}

export default function PricingPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Check auth
      const authResponse = await client.auth.me();
      setUser(authResponse.data);

      // Load pricing
      const pricingResponse = await client.apiCall.invoke({
        url: "/api/v1/payment/pricing",
        method: "GET"
      });
      setPlans(pricingResponse.data.plans || []);
    } catch (error) {
      console.error("Failed to load pricing:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (planId: string) => {
    if (!user) {
      await client.auth.toLogin();
      return;
    }

    setPurchasing(planId);
    try {
      const response = await client.apiCall.invoke({
        url: "/api/v1/payment/create_checkout_session",
        method: "POST",
        data: {
          plan_type: planId,
          success_url: window.location.origin + "/payment-success",
          cancel_url: window.location.origin + "/pricing"
        }
      });

      if (response.data.url) {
        client.utils.openUrl(response.data.url);
      }
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast.error(error?.data?.detail || "Failed to start checkout");
    } finally {
      setPurchasing(null);
    }
  };

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
          {user ? (
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Dashboard
            </Button>
          ) : (
            <Button onClick={() => client.auth.toLogin()}>
              Sign In
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Start with a free analysis. Pay only for what you need. No hidden fees.
          </p>
        </div>

        {/* Free Tier */}
        <Card className="max-w-md mx-auto mb-8 border-green-200 bg-green-50">
          <CardContent className="py-6 text-center">
            <Badge className="bg-green-600 mb-2">Free Tier</Badge>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              Your First Analysis is Free
            </h3>
            <p className="text-slate-600 mb-3">
              Sign up and get one free lease analysis with summary results.
            </p>
            <div className="text-xs text-slate-500 space-y-1">
              <p>✓ AI extraction of key terms</p>
              <p>✓ Summary risk count (details blurred)</p>
              <p>✗ Amendment memo, Rent benchmarking, Comparison</p>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? "border-blue-500 border-2 shadow-lg" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-600">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-slate-900">${plan.price}</span>
                  {plan.recurring && (
                    <span className="text-slate-500">/month</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-slate-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {plan.credits} analysis credit{plan.credits > 1 ? "s" : ""}
                  </li>
                  <li className="flex items-center gap-2 text-slate-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Full AI extraction
                  </li>
                  <li className="flex items-center gap-2 text-slate-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Risk analysis report
                  </li>
                  <li className="flex items-center gap-2 text-slate-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Calendar export
                  </li>
                  {plan.recurring && (
                    <li className="flex items-center gap-2 text-slate-600">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Cancel anytime
                    </li>
                  )}
                </ul>
                <Button 
                  className={`w-full ${plan.popular ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handlePurchase(plan.id)}
                  disabled={purchasing === plan.id}
                >
                  {purchasing === plan.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    plan.recurring ? "Subscribe" : "Buy Now"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="max-w-3xl mx-auto mt-16 mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
            Compare Plans
          </h2>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b">
                    <th className="text-left text-sm font-medium text-slate-600 px-6 py-4">Feature</th>
                    <th className="text-center text-sm font-medium text-slate-600 px-4 py-4">Free</th>
                    <th className="text-center text-sm font-medium text-blue-600 px-4 py-4">Pay-per-use</th>
                    <th className="text-center text-sm font-medium text-blue-600 px-4 py-4 bg-blue-50">Pro (Monthly)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "AI data extraction", free: true, pay: true, pro: true },
                    { feature: "Health score & grade", free: true, pay: true, pro: true },
                    { feature: "Risk summary (count only)", free: true, pay: true, pro: true },
                    { feature: "Full risk details", free: false, pay: true, pro: true },
                    { feature: "State compliance check", free: false, pay: true, pro: true },
                    { feature: "Amendment memo (AI)", free: false, pay: true, pro: true },
                    { feature: "Rent benchmarking", free: false, pay: true, pro: true },
                    { feature: "PDF report export", free: false, pay: true, pro: true },
                    { feature: "Lease comparison (2-3)", free: false, pay: false, pro: true },
                    { feature: "Portfolio dashboard", free: false, pay: false, pro: true },
                    { feature: "Batch upload", free: false, pay: false, pro: true },
                    { feature: "Calendar integration", free: true, pay: true, pro: true },
                  ].map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                      <td className="text-sm text-slate-700 px-6 py-3 border-b">{row.feature}</td>
                      <td className="text-center text-sm px-4 py-3 border-b">
                        {row.free ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="text-center text-sm px-4 py-3 border-b">
                        {row.pay ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="text-center text-sm px-4 py-3 border-b bg-blue-50/30">
                        {row.pro ? <CheckCircle className="h-4 w-4 text-blue-500 mx-auto" /> : <span className="text-slate-300">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">
                What file formats do you support?
              </h3>
              <p className="text-slate-600">
                We support PDF and Word (.docx) files, including scanned documents.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">
                What's included in paid plans vs. free?
              </h3>
              <p className="text-slate-600">
                Free users get one analysis with summary results (risk counts are visible but details are blurred).
                Paid plans unlock full risk details, amendment memo generation, rent benchmarking,
                lease comparison, and portfolio management.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">
                How accurate is the AI extraction?
              </h3>
              <p className="text-slate-600">
                Our AI achieves high accuracy on standard lease agreements. We recommend 
                reviewing the extracted data and consulting a legal professional for 
                important decisions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">
                Do credits expire?
              </h3>
              <p className="text-slate-600">
                Single purchase credits never expire. Monthly subscription credits 
                refresh each billing cycle.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">
                Is my data secure?
              </h3>
              <p className="text-slate-600">
                Yes, all documents are encrypted and stored securely. We never share 
                your data with third parties.
              </p>
            </div>
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