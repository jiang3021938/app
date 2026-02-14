import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ArrowLeft, Clock, ArrowRight } from "lucide-react";
import { ShareForCredits } from "@/components/ShareForCredits";
import { LeaseChecklistDownload } from "@/components/EmailCaptureForm";
import { blogPosts } from "@/lib/blogData";

// Legacy posts that have hardcoded content in BlogPost.tsx
const LEGACY_POSTS = [
  {
    slug: "california-lease-clauses",
    title: "California Lease Agreement: 10 Clauses Every Landlord Must Include",
    excerpt: "Missing these critical clauses in your California lease could cost you thousands. Learn what state law requires and how to protect your investment.",
    category: "State Guide",
    readTime: "8 min",
    featured: true,
  },
  {
    slug: "review-lease-5-minutes",
    title: "How to Review a Lease Agreement in 5 Minutes Using AI",
    excerpt: "Manual lease review takes hours. Here's how AI-powered tools can extract key terms, flag risks, and give you actionable insights in under 5 minutes.",
    category: "How-To",
    readTime: "5 min",
    featured: true,
  },
  {
    slug: "security-deposit-laws",
    title: "Security Deposit Laws by State: 2026 Complete Guide",
    excerpt: "Every state has different rules for security deposits — limits, return timelines, and penalties. This comprehensive guide covers all 50 states.",
    category: "Legal Guide",
    readTime: "12 min",
  },
];

// Merge markdown-sourced posts with legacy posts, deduplicating by slug
const markdownSlugs = new Set(blogPosts.map((p) => p.slug));
const BLOG_POSTS = [
  ...LEGACY_POSTS.filter((p) => !markdownSlugs.has(p.slug)),
  ...blogPosts.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.description,
    category: "Guide",
    readTime: `${Math.max(1, Math.ceil(post.content.split(/\s+/).length / 200))} min`,
    featured: false as boolean,
  })),
];

export default function BlogPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />Back
          </Button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-slate-800">LeaseLenses Blog</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Landlord Resource Center
          </h1>
          <p className="text-lg text-slate-600">
            Expert guides, state-specific laws, and practical tips for lease management.
          </p>
        </div>

        {/* Growth Hacking: Share for Credits */}
        <div className="mb-8">
          <ShareForCredits variant="card" />
        </div>

        {/* Free Resource Download */}
        <Card className="mb-12 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  📋 Free Lease Review Checklist
                </h3>
                <p className="text-slate-600">
                  Get our comprehensive 25-point checklist to review any lease agreement. Never miss critical clauses!
                </p>
              </div>
              <LeaseChecklistDownload />
            </div>
          </CardContent>
        </Card>

        {/* Featured Posts */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {BLOG_POSTS.filter((p) => p.featured).map((post) => (
            <Card
              key={post.slug}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => navigate(`/blog/${post.slug}`)}
            >
              <div className="h-3 bg-blue-600" />
              <CardContent className="py-6">
                <Badge variant="secondary" className="mb-3">{post.category}</Badge>
                <h2 className="text-xl font-semibold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-slate-600 text-sm mb-4">{post.excerpt}</p>
                <div className="flex items-center text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />{post.readTime} read
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* All Posts */}
        <h2 className="text-xl font-semibold text-slate-800 mb-6">All Articles</h2>
        <div className="space-y-4">
          {BLOG_POSTS.map((post) => (
            <Card
              key={post.slug}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/blog/${post.slug}`)}
            >
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                    </div>
                    <h3 className="font-medium text-slate-800 hover:text-blue-600">{post.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 truncate">{post.excerpt}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 flex-shrink-0 ml-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <Card className="mt-12 bg-blue-600 border-blue-600 text-white">
          <CardContent className="py-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Ready to analyze your lease?</h2>
            <p className="text-blue-100 mb-4">Sign up free and get your first analysis on us.</p>
            <Button variant="secondary" size="lg" onClick={() => navigate("/dashboard")}>
              Sign Up Free
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
