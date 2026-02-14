import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ArrowLeft, Clock, ArrowRight, Shield, TrendingUp, AlertTriangle, Calculator } from "lucide-react";
import { ShareForCredits } from "@/components/ShareForCredits";
import { LeaseChecklistDownload } from "@/components/EmailCaptureForm";
import { blogPostsBySlug } from "@/lib/blogData";
import { marked } from "marked";
import DOMPurify from "dompurify";

// Configure marked
marked.setOptions({ breaks: true, gfm: true });

// Map blog slugs to related free tools
const RELATED_TOOLS: Record<string, { path: string; title: string; description: string; icon: "shield" | "trending" | "file" | "alert" }[]> = {
  "security-deposit-laws": [
    { path: "/tools/security-deposit-calculator", title: "Security Deposit Calculator", description: "Calculate the maximum deposit your landlord can legally charge in your state.", icon: "shield" },
  ],
  "california-lease-clauses": [
    { path: "/tools/security-deposit-calculator", title: "Security Deposit Calculator", description: "Check California's security deposit limits instantly.", icon: "shield" },
    { path: "/tools/late-fee-checker", title: "Late Fee Checker", description: "Verify if your late fee complies with California law.", icon: "alert" },
  ],
  "california-security-deposit-law-2026": [
    { path: "/tools/security-deposit-calculator", title: "Security Deposit Calculator", description: "Calculate California's current deposit limits.", icon: "shield" },
  ],
  "florida-security-deposit-rules-2026": [
    { path: "/tools/security-deposit-calculator", title: "Security Deposit Calculator", description: "Check Florida's security deposit rules.", icon: "shield" },
  ],
  "new-york-rent-control-laws-guide": [
    { path: "/tools/rent-increase-calculator", title: "Rent Increase Calculator", description: "Calculate the maximum legal rent increase in New York.", icon: "trending" },
  ],
  "rent-increase-notice-generator-free": [
    { path: "/tools/rent-increase-calculator", title: "Rent Increase Calculator", description: "Calculate the maximum legal rent increase for your area.", icon: "trending" },
    { path: "/tools/lease-termination-notice-generator", title: "Termination Notice Generator", description: "Generate a professional lease termination letter.", icon: "file" },
  ],
  "illinois-eviction-notice-requirements": [
    { path: "/tools/lease-termination-notice-generator", title: "Termination Notice Generator", description: "Generate a lease termination notice for Illinois.", icon: "file" },
  ],
  "texas-landlord-tenant-law-guide": [
    { path: "/tools/security-deposit-calculator", title: "Security Deposit Calculator", description: "Check Texas security deposit rules.", icon: "shield" },
    { path: "/tools/late-fee-checker", title: "Late Fee Checker", description: "Verify if a late fee is legal in Texas.", icon: "alert" },
  ],
  "review-lease-5-minutes": [
    { path: "/tools/security-deposit-calculator", title: "Security Deposit Calculator", description: "Quickly check your state's deposit limits.", icon: "shield" },
    { path: "/tools/late-fee-checker", title: "Late Fee Checker", description: "Instantly check if your late fee is legal.", icon: "alert" },
  ],
};

function getToolIcon(icon: string) {
  switch (icon) {
    case "shield": return <Shield className="h-5 w-5 text-blue-600" />;
    case "trending": return <TrendingUp className="h-5 w-5 text-green-600" />;
    case "file": return <FileText className="h-5 w-5 text-purple-600" />;
    case "alert": return <AlertTriangle className="h-5 w-5 text-amber-600" />;
    default: return <Calculator className="h-5 w-5 text-blue-600" />;
  }
}

const RELATED_TOOLS_HEADING = "🛠️ Try Our Free Tools";

function RelatedToolsSection({ slug, navigate }: { slug: string | undefined; navigate: (path: string) => void }) {
  if (!slug || !RELATED_TOOLS[slug]) return null;
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">{RELATED_TOOLS_HEADING}</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        {RELATED_TOOLS[slug].map((tool) => (
          <Card key={tool.path} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(tool.path)}>
            <CardContent className="py-4 flex items-start gap-3">
              {getToolIcon(tool.icon)}
              <div>
                <p className="font-medium text-slate-800">{tool.title}</p>
                <p className="text-sm text-slate-500">{tool.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Keep legacy hardcoded articles as fallback for old slugs
const LEGACY_ARTICLES: Record<string, { title: string; category: string; readTime: string; date: string; sections: { heading: string; content: string }[]; }> = {
  "california-lease-clauses": {
    title: "California Lease Agreement: 10 Clauses Every Landlord Must Include",
    category: "State Guide", readTime: "8 min", date: "Jan 15, 2026",
    sections: [
      { heading: "Why California Is Different", content: "California has some of the most tenant-friendly laws in the nation. As a landlord, your lease must comply with the California Civil Code, local rent control ordinances, and recently enacted legislation like AB 1482 (the Tenant Protection Act). Missing a required disclosure or clause doesn't just create risk — it can void parts of your agreement entirely." },
      { heading: "1. Security Deposit Terms (Civil Code §1950.5)", content: "California caps security deposits at 2 months' rent for unfurnished units and 3 months' for furnished. Starting July 2024, AB 12 reduced this to just 1 month's rent for most landlords. Your lease must clearly state the deposit amount, the conditions for deductions, and the 21-day return timeline." },
      { heading: "2. Rent Increase Notice Requirements", content: "Under AB 1482, annual rent increases are capped at 5% + local CPI (max 10%) for properties 15+ years old. You must provide 30 days notice for increases under 10% and 90 days for 10% or more. Include specific language about how and when rent may be adjusted." },
      { heading: "3. Lead-Based Paint Disclosure", content: "For any property built before 1978, federal law requires a lead-based paint disclosure. Failure to provide this can result in penalties up to $19,507 per violation. Include the EPA pamphlet and disclosure form as lease addenda." },
      { heading: "4. Entry Notice Requirements (Civil Code §1954)", content: "Landlords must provide 24 hours written notice before entering a rental unit, except in emergencies. Your lease should specify the notice method and permitted reasons for entry." },
      { heading: "5. Maintenance Responsibilities", content: "California's implied warranty of habitability requires landlords to maintain livable conditions. Your lease should clearly delineate maintenance responsibilities between landlord and tenant, including who handles minor repairs, pest control, and appliance maintenance." },
      { heading: "How AI Can Help", content: "Reviewing every clause against state law is time-consuming. AI-powered tools like LeaseLenses can automatically flag non-compliant clauses, identify missing disclosures, and suggest specific amendments — all in under 60 seconds. Your first analysis is free." },
    ],
  },
  "review-lease-5-minutes": {
    title: "How to Review a Lease Agreement in 5 Minutes Using AI",
    category: "How-To", readTime: "5 min", date: "Jan 22, 2026",
    sections: [
      { heading: "The Problem with Manual Review", content: "A typical residential lease is 15-30 pages of dense legal language. Even experienced landlords spend 1-2 hours per lease review, and still miss critical issues. Multiply that by a portfolio of properties, and lease management becomes a significant time sink." },
      { heading: "Step 1: Upload Your Document", content: "Simply upload your lease as a PDF or Word document. AI models can now parse complex legal documents with high accuracy, extracting key terms, dates, and financial details automatically." },
      { heading: "Step 2: Instant AI Extraction", content: "Within seconds, AI identifies and extracts: tenant and landlord names, property address, rent amount and payment terms, security deposit details, lease dates, pet policies, late fee terms, and renewal conditions." },
      { heading: "Step 3: Risk Analysis", content: "The AI doesn't just extract — it analyzes. It checks for missing standard clauses (like lead paint disclosures), identifies unusual or potentially unfair terms, and compares your lease against state-specific regulations." },
      { heading: "Step 4: Get Actionable Insights", content: "The final report gives you a compliance score, risk flags with severity ratings, and specific recommendations for amendments. You can even generate a professional Amendment Suggestions Memo to share with your attorney or the other party." },
      { heading: "What About Accuracy?", content: "Modern AI achieves high accuracy on standard lease agreements. However, we always recommend reviewing the AI output and consulting a legal professional for high-stakes decisions. Think of AI as your first pass — it catches the obvious issues instantly so you can focus your time on the nuanced ones." },
    ],
  },
  "security-deposit-laws": {
    title: "Security Deposit Laws by State: 2026 Complete Guide",
    category: "Legal Guide", readTime: "12 min", date: "Feb 1, 2026",
    sections: [
      { heading: "Why Security Deposit Laws Matter", content: "Security deposit disputes are the #1 cause of landlord-tenant litigation in the US. Every state has different rules about how much you can charge, how to hold the deposit, and when and how to return it. Violating these rules can result in penalties of 2-3x the deposit amount." },
      { heading: "Key Variations by State", content: "Maximum deposit amounts range from 1 month's rent (California under AB 12) to unlimited (several states have no cap). Return timelines vary from 14 days (Hawaii, Vermont) to 60 days (Alabama). Some states require deposits to be held in separate interest-bearing accounts." },
      { heading: "Common Landlord Mistakes", content: "The most frequent violations include: charging more than the state maximum, failing to return the deposit within the required timeline, not providing an itemized list of deductions, mixing deposit funds with personal accounts, and not conducting a move-in/move-out inspection." },
      { heading: "Protect Yourself", content: "Use AI-powered lease analysis to verify your security deposit terms comply with your state's current laws. Regulations change frequently — California's deposit cap dropped from 2x to 1x rent in 2024. Staying current is essential." },
    ],
  },
};

function estimateReadTime(content: string): string {
  const wordCount = content.split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min`;
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const mdPost = slug ? blogPostsBySlug[slug] : undefined;
  const legacyArticle = slug ? LEGACY_ARTICLES[slug] : undefined;

  // Set document title and meta tags for SEO
  useEffect(() => {
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
        } else if (selector.includes('rel=')) {
          const rel = selector.match(/rel="([^"]+)"/)?.[1];
          if (rel) tag.setAttribute('rel', rel);
        }
        document.head.appendChild(tag);
      }
      tag.setAttribute(attr, value);
    };

    if (mdPost) {
      document.title = `${mdPost.title} | LeaseLenses Blog`;
      setMetaTag('meta[name="description"]', 'content', mdPost.description);
      setMetaTag('link[rel="canonical"]', 'href', `https://www.leaselenses.com/blog/${slug}`, 'link');
      setMetaTag('meta[property="og:title"]', 'content', mdPost.title);
      setMetaTag('meta[property="og:description"]', 'content', mdPost.description);
      setMetaTag('meta[property="og:type"]', 'content', 'article');
      setMetaTag('meta[property="og:url"]', 'content', `https://www.leaselenses.com/blog/${slug}`);
    } else if (legacyArticle) {
      document.title = `${legacyArticle.title} | LeaseLenses Blog`;
    }

    return () => {
      document.title = 'LeaseLenses - AI Lease Analysis';
    };
  }, [slug, mdPost, legacyArticle]);

  // Render markdown post
  if (mdPost) {
    const htmlContent = marked.parse(mdPost.content) as string;
    const readTime = estimateReadTime(mdPost.content);

    return (
      <div className="min-h-screen bg-white">
        <header className="border-b bg-white sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/blog")}>
              <ArrowLeft className="h-4 w-4 mr-2" />Blog
            </Button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <FileText className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-bold text-slate-800">LeaseLenses</span>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 max-w-3xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="secondary">Guide</Badge>
              <span className="text-sm text-slate-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />{readTime} read
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              {mdPost.title}
            </h1>
            {mdPost.description && (
              <p className="text-lg text-slate-600 mt-4">{mdPost.description}</p>
            )}
          </div>

          {/* Inline CTA */}
          <Card className="my-6 bg-blue-50 border-blue-200">
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-800 mb-1">
                    📄 Free Lease Review Checklist
                  </p>
                  <p className="text-sm text-slate-600">
                    Get our 25-point checklist - never miss critical clauses again!
                  </p>
                </div>
                <LeaseChecklistDownload />
              </div>
            </CardContent>
          </Card>

          <article
            className="prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlContent) }}
          />

          {/* Share This Article */}
          <div className="mt-8 mb-8">
            <Card className="bg-slate-50">
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-800 mb-1">
                      Found this helpful? Share it!
                    </p>
                    <p className="text-sm text-slate-600">
                      Earn 1 free analysis credit when you share this article.
                    </p>
                  </div>
                  <ShareForCredits
                    message={`Check out this article: ${mdPost.title}`}
                    url={`https://www.leaselenses.com/blog/${slug}`}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <RelatedToolsSection slug={slug} navigate={navigate} />

          {/* CTA */}
          <Card className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 border-0">
            <CardContent className="py-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Analyze Your Lease in Seconds</h2>
              <p className="text-blue-100 mb-6">Upload your lease and let AI flag risks, extract terms, and suggest improvements.</p>
              <div className="flex gap-3 justify-center">
                <Button variant="secondary" size="lg" onClick={() => navigate("/dashboard")}>
                  Start Free Analysis <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <p className="text-xs text-blue-200 mt-3">No credit card required. First analysis free.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Fallback: render legacy hardcoded article
  const article = legacyArticle || {
    title: "Article Coming Soon",
    category: "General", readTime: "5 min", date: "2026",
    sections: [
      { heading: "Stay Tuned", content: "This article is being prepared by our team. In the meantime, try LeaseLenses to analyze your lease agreements with AI." },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/blog")}>
            <ArrowLeft className="h-4 w-4 mr-2" />Blog
          </Button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <FileText className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-bold text-slate-800">LeaseLenses</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="secondary">{article.category}</Badge>
            <span className="text-sm text-slate-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />{article.readTime} read
            </span>
            <span className="text-sm text-slate-400">{article.date}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
            {article.title}
          </h1>
        </div>

        <article className="prose prose-slate max-w-none">
          {article.sections.map((section, idx) => (
            <div key={idx} className="mb-8">
              <h2 className="text-xl font-semibold text-slate-800 mb-3">{section.heading}</h2>
              <p className="text-slate-600 leading-relaxed">{section.content}</p>
              
              {idx === 1 && (
                <Card className="my-6 bg-blue-50 border-blue-200">
                  <CardContent className="py-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-800 mb-1">
                          📄 Free Lease Review Checklist
                        </p>
                        <p className="text-sm text-slate-600">
                          Get our 25-point checklist - never miss critical clauses again!
                        </p>
                      </div>
                      <LeaseChecklistDownload />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ))}
        </article>

        {/* Share This Article */}
        <div className="mt-8 mb-8">
          <Card className="bg-slate-50">
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-800 mb-1">
                    Found this helpful? Share it!
                  </p>
                  <p className="text-sm text-slate-600">
                    Earn 1 free analysis credit when you share this article.
                  </p>
                </div>
                <ShareForCredits 
                  message={`Check out this article: ${article.title}`}
                  url={`https://www.leaselenses.com/blog/${slug}`}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <RelatedToolsSection slug={slug} navigate={navigate} />

        {/* CTA */}
        <Card className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 border-0">
          <CardContent className="py-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Analyze Your Lease in Seconds</h2>
            <p className="text-blue-100 mb-6">Upload your lease and let AI flag risks, extract terms, and suggest improvements.</p>
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" size="lg" onClick={() => navigate("/dashboard")}>
                Start Free Analysis <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <p className="text-xs text-blue-200 mt-3">No credit card required. First analysis free.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
