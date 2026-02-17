// Mapping between blog post slugs and state slugs
export const BLOG_TO_STATE: Record<string, string> = {
  "california-security-deposit-law-2026": "california",
  "california-lease-clauses": "california",
  "florida-security-deposit-rules-2026": "florida",
  "texas-landlord-tenant-law-guide": "texas",
  "new-york-rent-control-laws-guide": "new-york",
  "illinois-eviction-notice-requirements": "illinois",
  "georgia-landlord-tenant-law-guide": "georgia",
  "ohio-security-deposit-law": "ohio",
  "pennsylvania-lease-agreement-guide": "pennsylvania",
  "michigan-eviction-process-guide": "michigan",
  "virginia-tenant-rights-2026": "virginia",
};

// Reverse mapping: state slug to blog post slugs
export const STATE_TO_BLOGS: Record<string, string[]> = {
  california: [
    "california-security-deposit-law-2026",
    "california-lease-clauses",
  ],
  florida: [
    "florida-security-deposit-rules-2026",
  ],
  texas: [
    "texas-landlord-tenant-law-guide",
  ],
  "new-york": [
    "new-york-rent-control-laws-guide",
  ],
  illinois: [
    "illinois-eviction-notice-requirements",
  ],
  georgia: [
    "georgia-landlord-tenant-law-guide",
  ],
  ohio: [
    "ohio-security-deposit-law",
  ],
  pennsylvania: [
    "pennsylvania-lease-agreement-guide",
  ],
  michigan: [
    "michigan-eviction-process-guide",
  ],
  virginia: [
    "virginia-tenant-rights-2026",
  ],
};

// Tool pages related to each state
export const STATE_TO_TOOLS: Record<string, Array<{ path: string; title: string; description: string; icon: string }>> = {
  california: [
    {
      path: "/tools/security-deposit-calculator",
      title: "Security Deposit Calculator",
      description: "Calculate California's security deposit limits (updated for AB 12)",
      icon: "shield",
    },
    {
      path: "/tools/rent-increase-calculator",
      title: "Rent Increase Calculator",
      description: "Check if your rent increase complies with AB 1482",
      icon: "trending",
    },
  ],
  texas: [
    {
      path: "/tools/security-deposit-calculator",
      title: "Security Deposit Calculator",
      description: "Verify Texas security deposit requirements",
      icon: "shield",
    },
    {
      path: "/tools/late-fee-checker",
      title: "Late Fee Checker",
      description: "Check if your late fee is reasonable under Texas law",
      icon: "alert",
    },
  ],
  florida: [
    {
      path: "/tools/security-deposit-calculator",
      title: "Security Deposit Calculator",
      description: "Check Florida security deposit rules (F.S. 83.49)",
      icon: "shield",
    },
    {
      path: "/tools/lease-termination-notice-generator",
      title: "Notice Generator",
      description: "Generate compliant termination notices for Florida",
      icon: "file",
    },
  ],
  "new-york": [
    {
      path: "/tools/rent-increase-calculator",
      title: "Rent Increase Calculator",
      description: "Calculate legal rent increases under NY rent control",
      icon: "trending",
    },
    {
      path: "/tools/security-deposit-calculator",
      title: "Security Deposit Calculator",
      description: "Check New York's security deposit limits",
      icon: "shield",
    },
  ],
  illinois: [
    {
      path: "/tools/lease-termination-notice-generator",
      title: "Notice Generator",
      description: "Generate Illinois-compliant eviction notices",
      icon: "file",
    },
    {
      path: "/tools/security-deposit-calculator",
      title: "Security Deposit Calculator",
      description: "Check Illinois security deposit requirements",
      icon: "shield",
    },
  ],
};
