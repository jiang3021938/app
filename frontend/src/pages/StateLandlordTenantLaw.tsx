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
  Calculator,
  BookOpen,
  ArrowRight
} from "lucide-react";
import { getStateBySlug } from "@/data/stateData";
import { STATE_TO_BLOGS, STATE_TO_TOOLS } from "@/data/blogStateMapping";
import { blogPostsBySlug } from "@/lib/blogData";

function getToolIcon(icon: string) {
  switch (icon) {
    case "shield": return <Shield className="h-4 w-4" />;
    case "trending": return <TrendingUp className="h-4 w-4" />;
    case "file": return <FileText className="h-4 w-4" />;
    case "alert": return <AlertCircle className="h-4 w-4" />;
    default: return <Calculator className="h-4 w-4" />;
  }
}

function estimateReadTime(content: string): string {
  const wordCount = content.split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min`;
}

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
          } else if (selector.includes('rel=')) {
            const rel = selector.match(/rel="([^"]+)"/)?.[1];
            if (rel) tag.setAttribute('rel', rel);
          }
          document.head.appendChild(tag);
        }
        tag.setAttribute(attr, value);
      };

      const description = `Complete guide to ${stateInfo.name} landlord-tenant law. Learn about security deposits, rent increases, notice requirements, and tenant rights in ${stateInfo.name}.`;
      setMetaTag('meta[name="description"]', 'content', description);
      setMetaTag('link[rel="canonical"]', 'href', `https://www.leaselenses.com/states/${stateInfo.slug}`, 'link');
      setMetaTag('meta[property="og:title"]', 'content', `${stateInfo.name} Landlord-Tenant Law Guide`);
      setMetaTag('meta[property="og:description"]', 'content', description);
      setMetaTag('meta[property="og:type"]', 'content', 'article');
      setMetaTag('meta[property="og:url"]', 'content', `https://www.leaselenses.com/states/${stateInfo.slug}`);

      // Add FAQ Schema JSON-LD with unique identifier
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": `What is the security deposit limit in ${stateInfo.name}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": stateInfo.securityDepositLimit
            }
          },
          {
            "@type": "Question",
            "name": `How long does a landlord have to return a security deposit in ${stateInfo.name}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": stateInfo.securityDepositReturn
            }
          },
          {
            "@type": "Question",
            "name": `What notice is required for rent increases in ${stateInfo.name}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": stateInfo.rentIncreaseNotice
            }
          },
          {
            "@type": "Question",
            "name": `How much notice must a landlord give before entering a rental unit in ${stateInfo.name}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": stateInfo.entryNotice
            }
          }
        ]
      };

      let faqScript = document.querySelector('script[data-state-faq-schema]');
      if (!faqScript) {
        faqScript = document.createElement('script');
        faqScript.setAttribute('type', 'application/ld+json');
        faqScript.setAttribute('data-state-faq-schema', 'true');
        document.head.appendChild(faqScript);
      }
      faqScript.textContent = JSON.stringify(faqSchema);
    }

    return () => {
      document.title = 'LeaseLenses - AI Lease Analysis';
      
      // Clean up meta tags
      const metaTags = [
        'meta[name="description"]',
        'link[rel="canonical"]',
        'meta[property="og:title"]',
        'meta[property="og:description"]',
        'meta[property="og:type"]',
        'meta[property="og:url"]'
      ];
      
      metaTags.forEach(selector => {
        const tag = document.querySelector(selector);
        if (tag) tag.remove();
      });

      // Clean up FAQ schema with unique selector
      const faqScript = document.querySelector('script[data-state-faq-schema]');
      if (faqScript) faqScript.remove();
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
              {stateInfo.keyStatutes.map((statute) => (
                <li key={statute} className="flex items-start gap-2">
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
              {stateInfo.commonIssues.map((issue) => (
                <li key={issue} className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">⚠️</span>
                  <span className="text-slate-700">{issue}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Free Tools Section - Enhanced with state-specific tools */}
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
              {/* Show state-specific tools if available, otherwise show default tools */}
              {stateSlug && STATE_TO_TOOLS[stateSlug] ? (
                STATE_TO_TOOLS[stateSlug].map((tool) => (
                  <Button
                    key={tool.path}
                    variant="outline"
                    className="justify-start h-auto py-3"
                    onClick={() => navigate(tool.path)}
                  >
                    <div className="flex items-start gap-3 text-left">
                      {getToolIcon(tool.icon)}
                      <div>
                        <div className="font-medium">{tool.title}</div>
                        <div className="text-xs text-slate-500 font-normal mt-0.5">{tool.description}</div>
                      </div>
                    </div>
                  </Button>
                ))
              ) : (
                <>
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
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Related Articles Section */}
        {stateSlug && STATE_TO_BLOGS[stateSlug] && STATE_TO_BLOGS[stateSlug].length > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                Related Articles About {stateInfo.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 mb-4">
                Learn more about {stateInfo.name} landlord-tenant law:
              </p>
              <div className="space-y-3">
                {STATE_TO_BLOGS[stateSlug].map((blogSlug) => {
                  const post = blogPostsBySlug[blogSlug];
                  if (!post) return null;
                  
                  const readTime = estimateReadTime(post.content);
                  
                  return (
                    <Card
                      key={blogSlug}
                      className="hover:shadow-md transition-shadow cursor-pointer bg-white"
                      onClick={() => navigate(`/blog/${blogSlug}`)}
                    >
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 mb-1 hover:text-blue-600 transition-colors">
                              {post.title}
                            </h4>
                            <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                              {post.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Clock className="h-3 w-3" />
                              {readTime} read
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-slate-400 flex-shrink-0 mt-1" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

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
              {stateInfo.resources.map((resource) => (
                <li key={resource.url}>
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
