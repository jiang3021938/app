import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Mail, Shield, ArrowLeft, Heart, Target, Users } from "lucide-react";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <FileText className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-xl text-slate-800">LeaseLenses</span>
          </div>
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Mission */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">About LeaseLenses</h1>
          <p className="text-lg text-slate-600">
            AI-powered lease analysis to help landlords, tenants, and property managers
            make smarter decisions.
          </p>
        </div>

        {/* Why We Built This */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="h-6 w-6 text-red-500" />
              <h2 className="text-xl font-semibold text-slate-800">Why We Built LeaseLenses</h2>
            </div>
            <p className="text-slate-600 leading-relaxed mb-4">
              Reading through a 20-page lease agreement is time-consuming and easy to miss critical details.
              We built LeaseLenses to automate the tedious parts — extracting key terms, identifying risks,
              and checking compliance — so you can focus on making informed decisions.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Our AI analyzes each lease against a comprehensive 12-point checklist covering everything from
              security deposit limits to habitability guarantees, giving you a clear health score and
              actionable recommendations.
            </p>
          </CardContent>
        </Card>

        {/* What We Stand For */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <Shield className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-800 mb-2">Privacy First</h3>
              <p className="text-sm text-slate-600">
                Your documents are never stored. We analyze in memory and save only the structured results.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Target className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-800 mb-2">Accuracy</h3>
              <p className="text-sm text-slate-600">
                Powered by Google's Gemini AI with a structured extraction pipeline
                designed specifically for U.S. residential leases.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-800 mb-2">For Everyone</h3>
              <p className="text-sm text-slate-600">
                Whether you're a first-time renter or a property manager with 50 units,
                LeaseLenses helps you review leases faster.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-slate-800">Contact Us</h2>
            </div>
            <p className="text-slate-600 mb-2">
              Have questions, feedback, or partnership inquiries? We'd love to hear from you.
            </p>
            <a href="mailto:hotogems@gmail.com" className="text-blue-600 hover:underline font-medium">
              hotogems@gmail.com
            </a>
          </CardContent>
        </Card>

        {/* Legal Links */}
        <div className="text-center text-sm text-slate-500 space-y-2">
          <p>
            By using LeaseLenses, you agree to our terms of service.
            This tool provides information only and does not constitute legal advice.
          </p>
          <p>© 2026 LeaseLenses. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
}
