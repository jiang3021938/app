// Mapping between blog post slugs and state slugs
export const BLOG_TO_STATE: Record<string, string> = {
  "alabama-landlord-tenant-law-guide": "alabama",
  "alaska-landlord-tenant-law-guide": "alaska",
  "arizona-tenant-rights-2026": "arizona",
  "arkansas-landlord-tenant-law-guide": "arkansas",
  "california-security-deposit-law-2026": "california",
  "california-lease-clauses": "california",
  "colorado-tenant-rights-2026": "colorado",
  "connecticut-landlord-tenant-law-guide": "connecticut",
  "delaware-landlord-tenant-law-guide": "delaware",
  "florida-security-deposit-rules-2026": "florida",
  "georgia-landlord-tenant-law-guide": "georgia",
  "hawaii-landlord-tenant-law-guide": "hawaii",
  "idaho-landlord-tenant-law-guide": "idaho",
  "illinois-eviction-notice-requirements": "illinois",
  "indiana-eviction-process-guide": "indiana",
  "iowa-landlord-tenant-law-guide": "iowa",
  "kansas-landlord-tenant-law-guide": "kansas",
  "kentucky-landlord-tenant-law-guide": "kentucky",
  "louisiana-landlord-tenant-law-guide": "louisiana",
  "maine-landlord-tenant-law-guide": "maine",
  "maryland-landlord-tenant-law-guide": "maryland",
  "massachusetts-landlord-tenant-law-guide": "massachusetts",
  "michigan-eviction-process-guide": "michigan",
  "minnesota-security-deposit-law": "minnesota",
  "mississippi-landlord-tenant-law-guide": "mississippi",
  "missouri-landlord-tenant-law-guide": "missouri",
  "montana-landlord-tenant-law-guide": "montana",
  "nebraska-landlord-tenant-law-guide": "nebraska",
  "nevada-landlord-tenant-law-guide": "nevada",
  "new-hampshire-landlord-tenant-law-guide": "new-hampshire",
  "new-jersey-landlord-tenant-law-guide": "new-jersey",
  "new-mexico-landlord-tenant-law-guide": "new-mexico",
  "new-york-rent-control-laws-guide": "new-york",
  "north-carolina-security-deposit-law": "north-carolina",
  "north-dakota-landlord-tenant-law-guide": "north-dakota",
  "ohio-security-deposit-law": "ohio",
  "oklahoma-landlord-tenant-law-guide": "oklahoma",
  "oregon-landlord-tenant-law-guide": "oregon",
  "pennsylvania-lease-agreement-guide": "pennsylvania",
  "rhode-island-landlord-tenant-law-guide": "rhode-island",
  "south-carolina-landlord-tenant-law-guide": "south-carolina",
  "south-dakota-landlord-tenant-law-guide": "south-dakota",
  "tennessee-lease-agreement-guide": "tennessee",
  "texas-landlord-tenant-law-guide": "texas",
  "utah-landlord-tenant-law-guide": "utah",
  "vermont-landlord-tenant-law-guide": "vermont",
  "virginia-tenant-rights-2026": "virginia",
  "washington-state-landlord-tenant-law-guide": "washington",
  "west-virginia-landlord-tenant-law-guide": "west-virginia",
  "wisconsin-landlord-tenant-law-guide": "wisconsin",
  "wyoming-landlord-tenant-law-guide": "wyoming",
};

// Reverse mapping: state slug to blog post slugs
export const STATE_TO_BLOGS: Record<string, string[]> = {
  alabama: [
    "alabama-landlord-tenant-law-guide",
  ],
  alaska: [
    "alaska-landlord-tenant-law-guide",
  ],
  arizona: [
    "arizona-tenant-rights-2026",
  ],
  arkansas: [
    "arkansas-landlord-tenant-law-guide",
  ],
  california: [
    "california-security-deposit-law-2026",
    "california-lease-clauses",
  ],
  colorado: [
    "colorado-tenant-rights-2026",
  ],
  connecticut: [
    "connecticut-landlord-tenant-law-guide",
  ],
  delaware: [
    "delaware-landlord-tenant-law-guide",
  ],
  florida: [
    "florida-security-deposit-rules-2026",
  ],
  georgia: [
    "georgia-landlord-tenant-law-guide",
  ],
  hawaii: [
    "hawaii-landlord-tenant-law-guide",
  ],
  idaho: [
    "idaho-landlord-tenant-law-guide",
  ],
  illinois: [
    "illinois-eviction-notice-requirements",
  ],
  indiana: [
    "indiana-eviction-process-guide",
  ],
  iowa: [
    "iowa-landlord-tenant-law-guide",
  ],
  kansas: [
    "kansas-landlord-tenant-law-guide",
  ],
  kentucky: [
    "kentucky-landlord-tenant-law-guide",
  ],
  louisiana: [
    "louisiana-landlord-tenant-law-guide",
  ],
  maine: [
    "maine-landlord-tenant-law-guide",
  ],
  maryland: [
    "maryland-landlord-tenant-law-guide",
  ],
  massachusetts: [
    "massachusetts-landlord-tenant-law-guide",
  ],
  michigan: [
    "michigan-eviction-process-guide",
  ],
  minnesota: [
    "minnesota-security-deposit-law",
  ],
  mississippi: [
    "mississippi-landlord-tenant-law-guide",
  ],
  missouri: [
    "missouri-landlord-tenant-law-guide",
  ],
  montana: [
    "montana-landlord-tenant-law-guide",
  ],
  nebraska: [
    "nebraska-landlord-tenant-law-guide",
  ],
  nevada: [
    "nevada-landlord-tenant-law-guide",
  ],
  "new-hampshire": [
    "new-hampshire-landlord-tenant-law-guide",
  ],
  "new-jersey": [
    "new-jersey-landlord-tenant-law-guide",
  ],
  "new-mexico": [
    "new-mexico-landlord-tenant-law-guide",
  ],
  "new-york": [
    "new-york-rent-control-laws-guide",
  ],
  "north-carolina": [
    "north-carolina-security-deposit-law",
  ],
  "north-dakota": [
    "north-dakota-landlord-tenant-law-guide",
  ],
  ohio: [
    "ohio-security-deposit-law",
  ],
  oklahoma: [
    "oklahoma-landlord-tenant-law-guide",
  ],
  oregon: [
    "oregon-landlord-tenant-law-guide",
  ],
  pennsylvania: [
    "pennsylvania-lease-agreement-guide",
  ],
  "rhode-island": [
    "rhode-island-landlord-tenant-law-guide",
  ],
  "south-carolina": [
    "south-carolina-landlord-tenant-law-guide",
  ],
  "south-dakota": [
    "south-dakota-landlord-tenant-law-guide",
  ],
  tennessee: [
    "tennessee-lease-agreement-guide",
  ],
  texas: [
    "texas-landlord-tenant-law-guide",
  ],
  utah: [
    "utah-landlord-tenant-law-guide",
  ],
  vermont: [
    "vermont-landlord-tenant-law-guide",
  ],
  virginia: [
    "virginia-tenant-rights-2026",
  ],
  washington: [
    "washington-state-landlord-tenant-law-guide",
  ],
  "west-virginia": [
    "west-virginia-landlord-tenant-law-guide",
  ],
  wisconsin: [
    "wisconsin-landlord-tenant-law-guide",
  ],
  wyoming: [
    "wyoming-landlord-tenant-law-guide",
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
