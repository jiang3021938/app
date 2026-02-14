import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import BatchUpload from "./pages/BatchUpload";
import Report from "./pages/Report";
import Pricing from "./pages/Pricing";
import PaymentSuccess from "./pages/PaymentSuccess";
import AuthCallback from "./pages/AuthCallback";
import Portfolio from "./pages/Portfolio";
import Compare from "./pages/Compare";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import CaseStudies from "./pages/CaseStudies";
import Templates from "./pages/Templates";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Features from "./pages/Features";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import LogoutCallbackPage from "./pages/LogoutCallbackPage";
import SampleReport from "./pages/SampleReport";
import SecurityDepositCalculator from "./pages/SecurityDepositCalculator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/batch-upload" element={<BatchUpload />} />
          <Route path="/report/:documentId" element={<Report />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/case-studies" element={<CaseStudies />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/features" element={<Features />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/sample-report" element={<SampleReport />} />
          <Route path="/security-deposit-calculator" element={<SecurityDepositCalculator />} />
          <Route path="/logout-callback" element={<LogoutCallbackPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
