import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ArrowLeft, MapPin, ChevronRight } from "lucide-react";
import { stateData, getAllStateSlugs } from "@/data/stateData";

export default function StatesIndex() {
  const navigate = useNavigate();
  const stateSlugs = getAllStateSlugs();
  
  // Sort states alphabetically by name
  const sortedStates = stateSlugs
    .map(slug => stateData[slug])
    .sort((a, b) => a.name.localeCompare(b.name));

  // Set document title and meta tags for SEO
  useEffect(() => {
    document.title = "Landlord-Tenant Laws by State | LeaseLenses";
    
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

    const description = "Comprehensive guides to landlord-tenant laws by state. Find security deposit limits, rent increase rules, notice requirements, and key statutes for your state.";
    setMetaTag('meta[name="description"]', 'content', description);
    setMetaTag('link[rel="canonical"]', 'href', 'https://www.leaselenses.com/states', 'link');
    setMetaTag('meta[property="og:title"]', 'content', 'Landlord-Tenant Laws by State');
    setMetaTag('meta[property="og:description"]', 'content', description);
    setMetaTag('meta[property="og:type"]', 'content', 'website');
    setMetaTag('meta[property="og:url"]', 'content', 'https://www.leaselenses.com/states');

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
    };
  }, []);

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

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-4">
            Landlord-Tenant Laws by State
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Navigate the complex landscape of rental laws across the United States. 
            Find comprehensive guides covering security deposits, rent increases, notice requirements, 
            and key statutes for each state.
          </p>
        </div>

        {/* States Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {sortedStates.map((state) => (
            <Card 
              key={state.slug}
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => navigate(`/states/${state.slug}`)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    {state.name}
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {state.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-slate-700">Security Deposit: </span>
                    <span className="text-slate-600">{state.securityDepositLimit.substring(0, 50)}...</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Return Timeline: </span>
                    <span className="text-slate-600">{state.securityDepositReturn.substring(0, 50)}...</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0">
          <CardContent className="py-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              Need to Analyze Your Lease?
            </h2>
            <p className="text-blue-100 mb-6">
              Upload your lease and let AI check state-specific compliance, flag risks, and suggest improvements.
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
          <p className="text-xs text-slate-600 text-center">
            <strong>Disclaimer:</strong> This information is provided for educational purposes only 
            and does not constitute legal advice. Landlord-tenant laws can be complex and subject 
            to change. Always consult with a qualified attorney for specific legal guidance.
          </p>
        </div>
      </main>
    </div>
  );
}
