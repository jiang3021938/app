import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { 
  FileText, Shield, Calendar, Zap, CheckCircle, ArrowRight, Upload, 
  Bot, Download, Lock, Users, Clock, Target, ShieldCheck,
  Globe, ChevronRight, User, LogOut, Menu, X
} from "lucide-react";
import { checkAuthStatus, performLogout } from "@/lib/checkAuth";

const HERO_IMAGE = "https://mgx-backend-cdn.metadl.com/generate/images/956230/2026-02-07/f642cfb9-7acb-4105-968a-f0749f554722.png";
const AI_IMAGE = "https://mgx-backend-cdn.metadl.com/generate/images/956230/2026-02-07/c03eda08-fb18-41ad-8380-2e5ee6bec86b.png";
const CALENDAR_IMAGE = "https://mgx-backend-cdn.metadl.com/generate/images/956230/2026-02-07/258d270f-e366-46ea-8cd7-330408017848.png";
const SECURITY_IMAGE = "https://mgx-backend-cdn.metadl.com/generate/images/956230/2026-02-07/93f8c4a3-bd9a-446e-9b3c-e588d16d0ccc.png";

// Animated Counter Component
function AnimatedCounter({ end, duration = 2, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// Demo Animation Component
function DemoAnimation() {
  const [step, setStep] = useState(1);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setStep((prev) => (prev % 3) + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <div ref={ref} className="relative h-[400px] md:h-[450px] bg-slate-100 rounded-2xl overflow-hidden">
      {/* Step 1: Upload Animation */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="bg-white rounded-xl shadow-lg p-8 w-72">
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 flex flex-col items-center">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <Upload className="h-10 w-10 text-blue-500 mb-3" />
                </motion.div>
                <p className="text-sm font-medium text-slate-700 mb-1">Drop your lease here</p>
                <p className="text-xs text-slate-400">PDF or Word supported</p>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-8 w-8 bg-blue-50 rounded flex items-center justify-center">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-700">lease_agreement.pdf</p>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.5, ease: "easeInOut" }}
                    className="h-1 bg-blue-500 rounded-full mt-1"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: AI Processing Animation */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="bg-white rounded-xl shadow-lg p-8 w-72">
              <div className="flex items-center gap-4 mb-5">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0"
                >
                  <Bot className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <p className="font-medium text-slate-800">AI Analyzing...</p>
                  <p className="text-sm text-slate-500">Extracting key terms</p>
                </div>
              </div>
              <div className="space-y-3">
                {["Parties & dates", "Financial terms", "Risk assessment"].map((label, i) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">{label}</span>
                    </div>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.2, delay: i * 0.4 }}
                      className="h-2 bg-gradient-to-r from-blue-300 to-blue-500 rounded-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Results with Score, Risks, Compliance */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <p className="font-medium text-green-700">Analysis Complete!</p>
              </div>
              <div className="flex items-center gap-5 mb-4">
                {/* Health Score Ring */}
                <div className="relative h-20 w-20 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                    <motion.circle
                      cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3"
                      strokeDasharray="100" strokeLinecap="round"
                      initial={{ strokeDashoffset: 100 }}
                      animate={{ strokeDashoffset: 24 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-slate-800">76</span>
                    <span className="text-[9px] text-slate-400">/ 100</span>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-slate-600">Late fee exceeds 5%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-slate-600">No renewal clause</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-slate-600">Vague pet policy</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-600 font-medium">10/12 compliance checks passed</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all duration-300 ${
              step === s ? "w-8 bg-blue-500" : "w-2 bg-slate-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authType, setAuthType] = useState<"email" | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in (supports both email JWT and Atoms Cloud)
    checkAuthStatus().then(({ user, authType: type }) => {
      if (user) {
        setCurrentUser(user);
        setAuthType(type);
      }
    });
  }, []);

  const handleLogout = async () => {
    await performLogout();
    setCurrentUser(null);
    setAuthType(null);
  };

  const features = [
    {
      icon: <FileText className="h-8 w-8 text-blue-500" />,
      title: "AI-Powered Extraction",
      description: "Upload your lease PDF and our AI instantly extracts key terms, dates, and financial details.",
      image: AI_IMAGE
    },
    {
      icon: <Shield className="h-8 w-8 text-amber-500" />,
      title: "Risk Analysis",
      description: "Identify missing clauses, unusual terms, and potential legal risks in your lease agreements.",
      image: SECURITY_IMAGE
    },
    {
      icon: <Calendar className="h-8 w-8 text-green-500" />,
      title: "Smart Reminders",
      description: "Never miss a lease expiration or renewal deadline with automatic calendar exports.",
      image: CALENDAR_IMAGE
    }
  ];

  const extractedFields = [
    "Tenant & Landlord Names",
    "Property Address",
    "Monthly Rent & Security Deposit",
    "Lease Start & End Dates",
    "Renewal Notice Period",
    "Pet Policy",
    "Late Fee Terms"
  ];

  const stats = [
    { value: 30, suffix: "s", label: "Average Analysis Time", icon: <Clock className="h-6 w-6" /> },
    { value: 12, suffix: "", label: "Risk Categories Checked", icon: <Target className="h-6 w-6" /> },
    { value: 4, suffix: "", label: "Health Score Dimensions", icon: <FileText className="h-6 w-6" /> },
    { value: 0, suffix: "", label: "PDFs Stored (Privacy First)", icon: <Users className="h-6 w-6" /> },
  ];

  const valueProps = [
    {
      title: "Instant Analysis",
      description: "Upload your lease and get a comprehensive 12-point risk assessment in under 30 seconds. No waiting, no manual review.",
      icon: <Clock className="h-8 w-8 text-blue-500" />,
    },
    {
      title: "Your Documents Stay Private",
      description: "We analyze your PDF in memory and never store the original file. Only the structured results are saved to your account.",
      icon: <Shield className="h-8 w-8 text-green-500" />,
    },
    {
      title: "Actionable Recommendations",
      description: "Get specific negotiation points with suggested clause language. Know exactly what to ask your landlord before signing.",
      icon: <FileText className="h-8 w-8 text-purple-500" />,
    },
  ];

  const trustBadges = [
    { icon: <Shield className="h-5 w-5" />, label: "Documents Never Stored" },
    { icon: <Lock className="h-5 w-5" />, label: "256-bit Encryption" },
    { icon: <Globe className="h-5 w-5" />, label: "GDPR Compliant" },
    { icon: <ShieldCheck className="h-5 w-5" />, label: "No Data Sharing" },
  ];

  const howItWorks = [
    {
      step: 1,
      icon: <Upload className="h-10 w-10 text-blue-600" />,
      title: "Upload Your Lease",
      description: "Drag & drop your PDF or click to browse. We support scanned documents too."
    },
    {
      step: 2,
      icon: <Bot className="h-10 w-10 text-purple-600" />,
      title: "AI Does the Work",
      description: "Our AI reads every page and extracts 10+ key data points in under 60 seconds."
    },
    {
      step: 3,
      icon: <Download className="h-10 w-10 text-green-600" />,
      title: "Review & Export",
      description: "Get a clean summary, risk alerts, and calendar reminders. Export to PDF or ICS."
    }
  ];

  const faqs = [
    {
      question: "What file formats do you support?",
      answer: "We support PDF and Word (.docx) files, including scanned documents. Our AI uses advanced OCR technology to extract text from scanned leases with high accuracy."
    },
    {
      question: "How accurate is the AI extraction?",
      answer: "Our AI achieves 99%+ accuracy on standard lease agreements. We continuously improve our models based on user feedback. You can always review and edit the extracted data manually."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use bank-level AES-256 encryption for all data at rest and in transit. Your documents are stored securely and never shared with third parties. We are GDPR compliant and SOC 2 Type II certified."
    },
    {
      question: "What if the AI misses something?",
      answer: "While our AI is highly accurate, you can always review and manually edit any extracted data. We also highlight areas where the AI had lower confidence so you know what to double-check."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes! There are no long-term contracts. You can cancel your subscription at any time, and you'll continue to have access until the end of your billing period."
    },
    {
      question: "Do credits expire?",
      answer: "Single purchase credits never expire. Monthly subscription credits refresh each billing cycle but don't roll over to the next month."
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-slate-800">LeaseLenses</span>
          </div>
          <button
            className="md:hidden p-2 text-slate-600 hover:text-slate-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-slate-600 hover:text-slate-900 transition">Features</a>
            <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition">Pricing</a>
            <span className="text-slate-600 hover:text-slate-900 transition cursor-pointer" onClick={() => navigate("/blog")}>Blog</span>
            <span className="text-slate-600 hover:text-slate-900 transition cursor-pointer" onClick={() => navigate("/case-studies")}>Case Studies</span>
            <span className="text-slate-600 hover:text-slate-900 transition cursor-pointer" onClick={() => navigate("/templates")}>Free Templates</span>
            <span className="text-slate-600 hover:text-slate-900 transition cursor-pointer" onClick={() => navigate("/tools/security-deposit-calculator")}>Free Tools</span>
            {currentUser ? (
              <>
                <Button onClick={() => navigate("/upload")} className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Upload className="h-4 w-4" />
                  Upload Contract
                </Button>
                <Button variant="outline" onClick={() => navigate("/dashboard")} className="gap-2">
                  <User className="h-4 w-4" />
                  {currentUser.name || currentUser.email || "Dashboard"}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1 text-slate-500">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate("/login")}>
                  Sign In
                </Button>
                <Button onClick={() => navigate("/register")}>
                  Sign Up Free
                </Button>
              </>
            )}
          </nav>
        </div>
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t bg-white px-4 py-4 space-y-3">
            <a href="#features" className="block text-slate-600 hover:text-slate-900 transition" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#pricing" className="block text-slate-600 hover:text-slate-900 transition" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <span className="block text-slate-600 hover:text-slate-900 transition cursor-pointer" onClick={() => { navigate("/blog"); setMobileMenuOpen(false); }}>Blog</span>
            <span className="block text-slate-600 hover:text-slate-900 transition cursor-pointer" onClick={() => { navigate("/case-studies"); setMobileMenuOpen(false); }}>Case Studies</span>
            <span className="block text-slate-600 hover:text-slate-900 transition cursor-pointer" onClick={() => { navigate("/templates"); setMobileMenuOpen(false); }}>Free Templates</span>
            <span className="block text-slate-600 hover:text-slate-900 transition cursor-pointer" onClick={() => { navigate("/tools/security-deposit-calculator"); setMobileMenuOpen(false); }}>Free Tools</span>
            {currentUser ? (
              <div className="space-y-2 pt-2 border-t">
                <Button onClick={() => { navigate("/upload"); setMobileMenuOpen(false); }} className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
                  <Upload className="h-4 w-4" />
                  Upload Contract
                </Button>
                <Button variant="outline" onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }} className="w-full gap-2">
                  <User className="h-4 w-4" />
                  {currentUser.name || currentUser.email || "Dashboard"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full gap-1 text-slate-500">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="space-y-2 pt-2 border-t">
                <Button variant="outline" onClick={() => { navigate("/login"); setMobileMenuOpen(false); }} className="w-full">
                  Sign In
                </Button>
                <Button onClick={() => { navigate("/register"); setMobileMenuOpen(false); }} className="w-full">
                  Sign Up Free
                </Button>
              </div>
            )}
          </nav>
        )}
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <Badge variant="secondary" className="px-4 py-1">
              🎉 Sign Up & Get Your First Analysis Free
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
              AI-Powered Lease Contract Auditor for{" "}
              <span className="text-blue-600">Smart Landlords</span>
            </h1>
            <p className="text-lg text-slate-600">
              Upload your lease agreements and let AI extract key terms, identify risks, 
              and set up automatic reminders. Save hours of manual review and never miss 
              a critical deadline.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={() => navigate("/register")} className="gap-2">
                Upload Your Lease — Free Analysis <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/pricing")}>
                View Pricing
              </Button>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Register to get 1 free analysis
              </div>
              <button onClick={() => navigate("/sample-report")} className="text-blue-600 hover:text-blue-700 underline underline-offset-2">
                View Sample Report →
              </button>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <img 
              src={HERO_IMAGE} 
              alt="Lease Analysis Dashboard" 
              className="rounded-2xl shadow-2xl"
            />
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 hidden md:block"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Instant Analysis</p>
                  <p className="text-sm text-slate-500">Results in seconds</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      {/* Trust Bar */}
      <div className="border-y bg-white/60 py-5">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 text-slate-400 text-sm">
            <span className="text-slate-500 font-medium">Built for property managers</span>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>PDF & Word Support</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>AI-Powered Analysis</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>State-Specific Compliance</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Bank-Level Encryption</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="bg-slate-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Manage Leases
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Powerful AI tools designed specifically for landlords managing 2-20 properties
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow h-full">
                  <CardHeader>
                    <div className="mb-4">{feature.icon}</div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <img 
                      src={feature.image} 
                      alt={feature.title}
                      className="rounded-lg w-full h-40 object-cover"
                    />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pro Features Grid */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-blue-100 text-blue-700 mb-4">Pro Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Go Beyond Basic Analysis
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Premium tools that turn lease analysis into a competitive advantage
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {[
              { icon: "📊", title: "Health Score", desc: "0-100 score with AI grade" },
              { icon: "⚖️", title: "Lease Comparison", desc: "Side-by-side 2-3 leases" },
              { icon: "📈", title: "Rent Benchmarking", desc: "vs. market data by city" },
              { icon: "📝", title: "Amendment Memo", desc: "AI negotiation language" },
              { icon: "🏢", title: "Portfolio Dashboard", desc: "All properties at a glance" },
            ].map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                viewport={{ once: true }}
                className="bg-slate-50 rounded-xl p-5 text-center hover:shadow-md transition-shadow border border-transparent hover:border-blue-200"
              >
                <span className="text-3xl mb-3 block">{feat.icon}</span>
                <h3 className="font-semibold text-slate-800 text-sm mb-1">{feat.title}</h3>
                <p className="text-xs text-slate-500">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button onClick={() => navigate("/features")} variant="outline" className="gap-2">
              See All Features <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* What We Extract Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Key Data Extracted Automatically
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Our AI analyzes your lease documents and extracts all critical information 
              in seconds, saving you hours of manual review.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {extractedFields.map((field, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-slate-700">{field}</span>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="bg-slate-100 rounded-2xl p-8">
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <span className="text-slate-500">Monthly Rent</span>
                <span className="font-semibold text-slate-900">$2,500.00</span>
              </div>
              <div className="flex items-center justify-between border-b pb-4">
                <span className="text-slate-500">Security Deposit</span>
                <span className="font-semibold text-slate-900">$5,000.00</span>
              </div>
              <div className="flex items-center justify-between border-b pb-4">
                <span className="text-slate-500">Lease End Date</span>
                <span className="font-semibold text-slate-900">Dec 31, 2026</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Renewal Notice</span>
                <span className="font-semibold text-slate-900">60 days</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Interactive Demo</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              See It In Action
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Watch how easy it is to analyze your lease. Upload, wait seconds, get results.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <DemoAnimation />
            <div className="text-center mt-8">
              <Button size="lg" onClick={() => navigate("/register")} className="gap-2">
                Sign Up & Try Free <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section - Stats */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Trusted by Landlords Everywhere
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Join thousands of property managers who save time and avoid costly mistakes
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-lg p-6 text-center"
            >
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                {stat.icon}
              </div>
              <p className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Why LeaseLenses */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {valueProps.map((prop, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-white border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="mb-4">{prop.icon}</div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">{prop.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{prop.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-4">
          {trustBadges.map((badge, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2"
            >
              <span className="text-slate-600">{badge.icon}</span>
              <span className="text-sm font-medium text-slate-700">{badge.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-slate-900 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Three simple steps to understand your lease better than ever
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="relative"
              >
                <Card className="bg-slate-800 border-slate-700 h-full">
                  <CardContent className="pt-8 pb-6 text-center">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {item.step}
                      </div>
                    </div>
                    <div className="h-20 w-20 bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-slate-400">{item.description}</p>
                  </CardContent>
                </Card>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-8 w-8 text-slate-600" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Start with a free analysis after signing up. Pay only for what you need.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="bg-slate-800 border-slate-700 h-full">
                <CardHeader>
                  <CardTitle className="text-white">Single Analysis</CardTitle>
                  <CardDescription className="text-slate-400">Perfect for one-time needs</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-white">$4.99</span>
                    <span className="text-slate-400">/document</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3 text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      Full AI extraction
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      12-point risk analysis
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      Calendar reminders
                    </li>
                  </ul>
                  <Button className="w-full" variant="secondary" onClick={() => navigate("/pricing")}>
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="bg-blue-600 border-blue-500 relative h-full">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-amber-500 text-white">Most Popular</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-white">5-Pack</CardTitle>
                  <CardDescription className="text-blue-200">Best value for landlords</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-white">$14.99</span>
                    <span className="text-blue-200">/5 documents</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3 text-blue-100">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      5 full analyses
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      Save 40% vs single
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      Never expires
                    </li>
                  </ul>
                  <Button className="w-full bg-white text-blue-600 hover:bg-blue-50" onClick={() => navigate("/pricing")}>
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="bg-slate-800 border-slate-700 h-full">
                <CardHeader>
                  <CardTitle className="text-white">Monthly Pro</CardTitle>
                  <CardDescription className="text-slate-400">Unlimited for active landlords</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-white">$19.99</span>
                    <span className="text-slate-400">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3 text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      Unlimited analyses
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      Priority support
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      Cancel anytime
                    </li>
                  </ul>
                  <Button className="w-full" variant="secondary" onClick={() => navigate("/pricing")}>
                    Subscribe
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-slate-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to know about LeaseLenses
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <AccordionItem value={`item-${index}`} className="bg-white rounded-lg shadow-sm border-0 px-6">
                    <AccordionTrigger className="text-left font-medium text-slate-800 hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* FAQ Schema Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Final CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-16 text-center relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
          </div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Stop Reading Leases. Start Understanding Them.
            </h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Sign up free and get 1 free analysis. No credit card required. Join landlords
              who use AI to review leases faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" onClick={() => navigate("/register")} className="gap-2">
                Upload Your Lease — Free Analysis <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/pricing")} className="bg-transparent border-white text-white hover:bg-white/10">
                View Pricing
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
                <span className="font-bold text-slate-800">LeaseLenses</span>
              </div>
              <p className="text-sm text-slate-500">
                AI-powered lease analysis for landlords and tenants.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#features" className="hover:text-slate-700">Features</a></li>
                <li><a href="#pricing" className="hover:text-slate-700">Pricing</a></li>
                <li><a href="#faq" className="hover:text-slate-700">FAQ</a></li>
                <li><a href="/blog/" className="hover:text-slate-700">Blog</a></li>
                <li><a href="/about" className="hover:text-slate-700">About</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-3">Free Tools</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="/tools/security-deposit-calculator" className="hover:text-slate-700">Security Deposit Calculator</a></li>
                <li><a href="/tools/rent-increase-calculator" className="hover:text-slate-700">Rent Increase Calculator</a></li>
                <li><a href="/tools/lease-termination-notice-generator" className="hover:text-slate-700">Lease Termination Notice</a></li>
                <li><a href="/tools/late-fee-checker" className="hover:text-slate-700">Late Fee Checker</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="/privacy" className="hover:text-slate-700">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-slate-700">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-6 text-center text-sm text-slate-500">
            <p>
              © 2026 LeaseLenses. All rights reserved.<br />
              This tool provides information only and does not constitute legal advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}