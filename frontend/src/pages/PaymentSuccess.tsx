import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createClient } from "@metagptx/web-sdk";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";

const client = createClient();

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"success" | "pending" | "error">("pending");
  const [creditsAdded, setCreditsAdded] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (sessionId) {
      verifyPayment();
    } else {
      setStatus("error");
      setMessage("No payment session found");
      setLoading(false);
    }
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      const response = await client.apiCall.invoke({
        url: "/api/v1/payment/verify_payment",
        method: "POST",
        data: { session_id: sessionId }
      });

      const data = response.data;
      
      if (data.status === "completed") {
        setStatus("success");
        setCreditsAdded(data.credits_added);
        setMessage(data.message);
      } else if (data.status === "pending") {
        setStatus("pending");
        setMessage("Payment is being processed...");
        // Retry after a delay
        setTimeout(verifyPayment, 3000);
        return;
      } else {
        setStatus("error");
        setMessage(data.message || "Payment verification failed");
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      setStatus("error");
      setMessage(error?.data?.detail || "Failed to verify payment");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-slate-800">LeaseLenses</span>
          </div>
        </div>
      </header>

      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            {status === "success" ? (
              <>
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-green-700">Payment Successful!</CardTitle>
                <CardDescription className="text-base">
                  {creditsAdded} credit{creditsAdded !== 1 ? "s" : ""} have been added to your account
                </CardDescription>
              </>
            ) : status === "pending" ? (
              <>
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">Processing Payment...</CardTitle>
                <CardDescription className="text-base">
                  Please wait while we verify your payment
                </CardDescription>
              </>
            ) : (
              <>
                <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-2xl text-red-700">Payment Issue</CardTitle>
                <CardDescription className="text-base">
                  {message}
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {status === "success" && (
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-green-700 font-medium">
                  Your credits are ready to use!
                </p>
              </div>
            )}
            
            <div className="flex flex-col gap-3">
              <Button 
                className="w-full gap-2" 
                onClick={() => navigate("/dashboard")}
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
              
              {status === "success" && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/upload")}
                >
                  Upload a Lease Document
                </Button>
              )}
              
              {status === "error" && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/pricing")}
                >
                  Return to Pricing
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}