/**
 * Build-time prerender script for SEO.
 *
 * Generates static HTML pages for SEO-important routes so that search-engine
 * crawlers receive meaningful content, meta tags, and structured data directly
 * in the initial HTML response (instead of a blank SPA shell).
 *
 * Each generated page includes the Vite-built JS/CSS assets from the main
 * dist/index.html so that the React app boots and takes over on the client.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const distDir = path.resolve(projectRoot, "dist");
const baseUrl = "https://www.leaselenses.com";

// ---------------------------------------------------------------------------
// 1.  Read the Vite-built index.html to extract <head> assets & <body> scripts
// ---------------------------------------------------------------------------

function extractAssetsFromIndex() {
  const indexPath = path.join(distDir, "index.html");
  if (!fs.existsSync(indexPath)) {
    console.warn("⚠  dist/index.html not found – skipping prerender");
    return null;
  }
  const html = fs.readFileSync(indexPath, "utf-8");

  // Extract <link> and <script> tags from <head>
  const headLinkTags = (html.match(/<link[^>]+>/g) || [])
    .filter((t) => t.includes("/assets/"))
    .join("\n  ");
  // Extract module <script> tags (Vite entry point)
  const bodyScriptTags = (html.match(/<script[^>]*src="[^"]*"[^>]*><\/script>/g) || []).join(
    "\n  "
  );
  return { headLinkTags, bodyScriptTags };
}

// ---------------------------------------------------------------------------
// 2.  Parse state data from TypeScript source (lightweight regex-based parser)
// ---------------------------------------------------------------------------

function loadStateData() {
  const stateDataPath = path.join(projectRoot, "src/data/stateData.ts");
  if (!fs.existsSync(stateDataPath)) return {};

  const src = fs.readFileSync(stateDataPath, "utf-8");

  // Match each state block:  key: { ... } (handles both unquoted and quoted keys)
  const states = {};
  const blockRegex = /^\s{2}(?:"([\w-]+)"|(\w[\w-]*))\s*:\s*\{/gm;
  let match;
  while ((match = blockRegex.exec(src)) !== null) {
    const key = match[1] || match[2];
    const startIdx = match.index + match[0].length;

    // Find matching closing brace (accounting for nesting)
    let depth = 1;
    let i = startIdx;
    while (i < src.length && depth > 0) {
      if (src[i] === "{") depth++;
      else if (src[i] === "}") depth--;
      i++;
    }
    const block = src.substring(startIdx, i - 1);

    // Extract simple string fields
    const getField = (name) => {
      const m = block.match(new RegExp(`${name}:\\s*["'\`]([\\s\\S]*?)["'\`]\\s*[,}]`));
      return m ? m[1] : "";
    };
    // Extract string array fields
    const getArrayField = (name) => {
      const m = block.match(new RegExp(`${name}:\\s*\\[([\\s\\S]*?)\\]`));
      if (!m) return [];
      return (m[1].match(/["'`]([^"'`]+)["'`]/g) || []).map((s) =>
        s.replace(/^["'`]|["'`]$/g, "")
      );
    };

    states[key] = {
      name: getField("name"),
      slug: getField("slug") || key,
      description: getField("description"),
      securityDepositLimit: getField("securityDepositLimit"),
      securityDepositReturn: getField("securityDepositReturn"),
      rentIncreaseNotice: getField("rentIncreaseNotice"),
      entryNotice: getField("entryNotice"),
      keyStatutes: getArrayField("keyStatutes"),
      commonIssues: getArrayField("commonIssues"),
    };
  }
  return states;
}

// ---------------------------------------------------------------------------
// 3.  HTML helpers
// ---------------------------------------------------------------------------

function escapeHtml(text) {
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function buildPage({ title, description, canonical, ogType, content, structuredData, assets }) {
  const jsonLdBlocks = (structuredData || [])
    .map((sd) => `<script type="application/ld+json">\n${JSON.stringify(sd, null, 2)}\n  </script>`)
    .join("\n  ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">

  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${canonical}" />

  <!-- Open Graph -->
  <meta property="og:type" content="${ogType || "website"}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${baseUrl}/assets/og-image.png" />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="${canonical}" />
  <meta property="twitter:title" content="${escapeHtml(title)}" />
  <meta property="twitter:description" content="${escapeHtml(description)}" />
  <meta property="twitter:image" content="${baseUrl}/assets/og-image.png" />

  ${jsonLdBlocks}
  ${assets.headLinkTags}
</head>
<body>
  <div id="root">${content}</div>
  ${assets.bodyScriptTags}
</body>
</html>`;
}

function writePage(routePath, html) {
  // routePath e.g. "/states/california"
  const dir = path.join(distDir, routePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html, "utf-8");
}

// ---------------------------------------------------------------------------
// 4.  Generate state pages  (/states/:slug)
// ---------------------------------------------------------------------------

function prerenderStatePages(states, assets) {
  let count = 0;
  for (const [, state] of Object.entries(states)) {
    if (!state.name) continue;
    const title = `${state.name} Landlord-Tenant Law Guide | LeaseLenses`;
    const description = `Complete guide to ${state.name} landlord-tenant law. Learn about security deposits, rent increases, notice requirements, and tenant rights in ${state.name}.`;
    const canonical = `${baseUrl}/states/${state.slug}`;

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `What is the security deposit limit in ${state.name}?`,
          acceptedAnswer: { "@type": "Answer", text: state.securityDepositLimit },
        },
        {
          "@type": "Question",
          name: `How long does a landlord have to return a security deposit in ${state.name}?`,
          acceptedAnswer: { "@type": "Answer", text: state.securityDepositReturn },
        },
        {
          "@type": "Question",
          name: `What notice is required for rent increases in ${state.name}?`,
          acceptedAnswer: { "@type": "Answer", text: state.rentIncreaseNotice },
        },
        {
          "@type": "Question",
          name: `How much notice must a landlord give before entering a rental unit in ${state.name}?`,
          acceptedAnswer: { "@type": "Answer", text: state.entryNotice },
        },
      ],
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
        { "@type": "ListItem", position: 2, name: "State Guides", item: `${baseUrl}/states` },
        { "@type": "ListItem", position: 3, name: `${state.name} Law Guide`, item: canonical },
      ],
    };

    // Semantic content for crawlers
    const content = `
    <main>
      <h1>${escapeHtml(state.name)} Landlord-Tenant Law Guide</h1>
      <p>${escapeHtml(state.description)}</p>
      <section>
        <h2>Security Deposit</h2>
        <p><strong>Limit:</strong> ${escapeHtml(state.securityDepositLimit)}</p>
        <p><strong>Return Period:</strong> ${escapeHtml(state.securityDepositReturn)}</p>
      </section>
      <section>
        <h2>Rent Increases</h2>
        <p>${escapeHtml(state.rentIncreaseNotice)}</p>
      </section>
      <section>
        <h2>Entry Notice</h2>
        <p>${escapeHtml(state.entryNotice)}</p>
      </section>
      ${
        state.keyStatutes.length
          ? `<section><h2>Key Statutes</h2><ul>${state.keyStatutes.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul></section>`
          : ""
      }
      ${
        state.commonIssues.length
          ? `<section><h2>Common Issues</h2><ul>${state.commonIssues.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul></section>`
          : ""
      }
    </main>`;

    const html = buildPage({
      title,
      description,
      canonical,
      ogType: "article",
      content,
      structuredData: [faqSchema, breadcrumbSchema],
      assets,
    });
    writePage(`states/${state.slug}`, html);
    count++;
  }
  return count;
}

// ---------------------------------------------------------------------------
// 5.  Generate states index  (/states)
// ---------------------------------------------------------------------------

function prerenderStatesIndex(states, assets) {
  const title = "State Landlord-Tenant Law Guides | LeaseLenses";
  const description =
    "Browse landlord-tenant law guides for all 50 US states. Security deposit limits, rent increase rules, notice requirements, and key statutes.";
  const canonical = `${baseUrl}/states`;

  const stateList = Object.values(states)
    .filter((s) => s.name)
    .sort((a, b) => a.name.localeCompare(b.name));

  const content = `
  <main>
    <h1>State Landlord-Tenant Law Guides</h1>
    <p>Browse landlord-tenant law guides for all 50 US states. Learn about security deposit limits, rent increase rules, notice requirements, and key statutes.</p>
    <ul>
      ${stateList.map((s) => `<li><a href="/states/${s.slug}">${escapeHtml(s.name)}</a> — ${escapeHtml(s.description.substring(0, 120))}…</li>`).join("\n      ")}
    </ul>
  </main>`;

  const html = buildPage({ title, description, canonical, content, structuredData: [], assets });
  writePage("states", html);
}

// ---------------------------------------------------------------------------
// 6.  Generate tool pages  (/tools/*)
// ---------------------------------------------------------------------------

const TOOLS = [
  {
    route: "tools/security-deposit-calculator",
    title: "Security Deposit Calculator | LeaseLenses",
    description:
      "Free security deposit calculator. Find out the maximum security deposit your landlord can legally charge in your state.",
    h1: "Security Deposit Calculator",
    body: "Calculate the maximum security deposit your landlord can legally charge based on your state's laws. Enter your state and monthly rent to see the limit instantly.",
  },
  {
    route: "tools/rent-increase-calculator",
    title: "Rent Increase Calculator | LeaseLenses",
    description:
      "Free rent increase calculator. Calculate the maximum legal rent increase for your area and find out if your landlord's proposed increase is within legal limits.",
    h1: "Rent Increase Calculator",
    body: "Check if your landlord's proposed rent increase is within legal limits. Enter your current rent, state, and proposed increase to verify compliance.",
  },
  {
    route: "tools/lease-termination-notice-generator",
    title: "Lease Termination Notice Generator | LeaseLenses",
    description:
      "Free lease termination notice generator. Create a professional, legally-compliant lease termination letter customized for your state's requirements.",
    h1: "Lease Termination Notice Generator",
    body: "Generate a professional lease termination notice that complies with your state's requirements. Customize the letter with your details and download instantly.",
  },
  {
    route: "tools/late-fee-checker",
    title: "Late Fee Checker | LeaseLenses",
    description:
      "Free late fee checker. Verify whether your lease's late fee complies with state law. Check maximum late fees and grace period requirements.",
    h1: "Late Fee Checker",
    body: "Check if your lease's late fee is legal in your state. Enter your monthly rent, late fee amount, and state to verify compliance with local regulations.",
  },
];

function prerenderToolPages(assets) {
  for (const tool of TOOLS) {
    const canonical = `${baseUrl}/${tool.route}`;
    const content = `<main><h1>${escapeHtml(tool.h1)}</h1><p>${escapeHtml(tool.body)}</p></main>`;
    const html = buildPage({
      title: tool.title,
      description: tool.description,
      canonical,
      content,
      structuredData: [],
      assets,
    });
    writePage(tool.route, html);
  }
}

// ---------------------------------------------------------------------------
// 7.  Generate static marketing pages
// ---------------------------------------------------------------------------

const STATIC_PAGES = [
  {
    route: "features",
    title: "Features - AI Lease Analysis Tools | LeaseLenses",
    description:
      "Explore LeaseLenses features: AI-powered data extraction, risk analysis, compliance checking, calendar reminders, and multi-document comparison.",
    h1: "LeaseLenses Features",
    body: "AI-powered lease analysis tools that help landlords extract key terms, identify risks, check state compliance, set calendar reminders, and compare multiple leases.",
  },
  {
    route: "about",
    title: "About LeaseLenses - AI Lease Agreement Analysis",
    description:
      "Learn about LeaseLenses, the AI-powered lease agreement analysis platform helping landlords review rental contracts with confidence.",
    h1: "About LeaseLenses",
    body: "LeaseLenses uses artificial intelligence to help landlords analyze lease agreements, extract key terms, identify risks, and ensure compliance with state regulations.",
  },
  {
    route: "pricing",
    title: "Pricing - LeaseLenses AI Lease Analysis",
    description:
      "View LeaseLenses pricing plans. Start with free credits and upgrade for unlimited AI lease analysis, risk reports, and compliance checks.",
    h1: "LeaseLenses Pricing",
    body: "Choose the right plan for your needs. Start analyzing leases for free and upgrade to unlock unlimited analysis, detailed risk reports, and state compliance checking.",
  },
  {
    route: "case-studies",
    title: "Case Studies - LeaseLenses",
    description:
      "See how landlords use LeaseLenses to analyze lease agreements, identify risky clauses, and save time on contract reviews.",
    h1: "Case Studies",
    body: "Discover how landlords and property managers use LeaseLenses to streamline lease review, catch problematic clauses, and ensure compliance with local regulations.",
  },
  {
    route: "templates",
    title: "Lease Templates & Resources | LeaseLenses",
    description:
      "Download free lease agreement templates, checklists, and landlord resources. State-specific templates for residential rental agreements.",
    h1: "Lease Templates & Resources",
    body: "Access free lease agreement templates, move-in/move-out checklists, and landlord resources to help you manage your rental properties effectively.",
  },
  {
    route: "privacy",
    title: "Privacy Policy | LeaseLenses",
    description: "LeaseLenses privacy policy. Learn how we collect, use, and protect your data.",
    h1: "Privacy Policy",
    body: "Your privacy is important to us. This policy describes how LeaseLenses collects, uses, and safeguards your personal information.",
  },
  {
    route: "terms",
    title: "Terms of Service | LeaseLenses",
    description: "LeaseLenses terms of service. Read the terms and conditions for using our platform.",
    h1: "Terms of Service",
    body: "These terms govern your use of the LeaseLenses platform and services. Please read them carefully before using our AI lease analysis tools.",
  },
  {
    route: "sample-report",
    title: "Sample Lease Analysis Report | LeaseLenses",
    description:
      "View a sample AI-generated lease analysis report. See how LeaseLenses extracts key terms, identifies risks, and checks compliance.",
    h1: "Sample Lease Analysis Report",
    body: "Preview a sample report generated by LeaseLenses AI. See how we extract key terms, calculate health scores, identify risk flags, and check state compliance.",
  },
];

function prerenderStaticPages(assets) {
  for (const pg of STATIC_PAGES) {
    const canonical = `${baseUrl}/${pg.route}`;
    const content = `<main><h1>${escapeHtml(pg.h1)}</h1><p>${escapeHtml(pg.body)}</p></main>`;
    const html = buildPage({
      title: pg.title,
      description: pg.description,
      canonical,
      content,
      structuredData: [],
      assets,
    });
    writePage(pg.route, html);
  }
}

// ---------------------------------------------------------------------------
// 8.  Generate homepage  (/)
// ---------------------------------------------------------------------------

function prerenderHomepage(assets) {
  const title = "LeaseLenses - AI Lease Agreement Analysis | Rental Contract Review Tool";
  const description =
    "AI-powered lease agreement analysis and rental contract review for landlords. Upload your lease PDF and get instant extraction of key terms, risk analysis, and calendar reminders. Free lease clause checker.";
  const canonical = baseUrl;

  const appSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "LeaseLenses",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web Browser",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD", priceValidUntil: "2027-12-31" },
    description,
    url: baseUrl,
    screenshot: `${baseUrl}/assets/og-image.png`,
    softwareVersion: "2.0",
    author: { "@type": "Organization", name: "LeaseLenses" },
    featureList: [
      "AI-powered lease analysis",
      "Automatic key term extraction",
      "Risk identification",
      "Calendar reminders",
      "Multi-document comparison",
      "State-specific compliance checking",
    ],
  };

  const content = `
  <main>
    <h1>AI-Powered Lease Agreement Analysis</h1>
    <p>Upload your lease agreement and get instant AI-powered analysis. Extract key terms, identify risks, check state compliance, and set calendar reminders — all in seconds.</p>
    <section>
      <h2>Key Features</h2>
      <ul>
        <li>AI-powered data extraction with 99%+ accuracy</li>
        <li>Risk identification and health scoring</li>
        <li>State-specific compliance checking for all 50 states</li>
        <li>Automatic calendar reminders for important dates</li>
        <li>Multi-document comparison</li>
        <li>Free tools: Security Deposit Calculator, Rent Increase Calculator, Late Fee Checker</li>
      </ul>
    </section>
  </main>`;

  const html = buildPage({
    title,
    description,
    canonical,
    content,
    structuredData: [appSchema],
    assets,
  });

  // Overwrite the root index.html with the prerendered version
  fs.writeFileSync(path.join(distDir, "index.html"), html, "utf-8");
}

// ---------------------------------------------------------------------------
// 9.  Main
// ---------------------------------------------------------------------------

export function prerender() {
  const assets = extractAssetsFromIndex();
  if (!assets) return;

  let total = 0;

  // Homepage
  prerenderHomepage(assets);
  total++;

  // State pages
  const states = loadStateData();
  const stateCount = Object.keys(states).length;
  if (stateCount > 0) {
    const rendered = prerenderStatePages(states, assets);
    prerenderStatesIndex(states, assets);
    total += rendered + 1;
  }

  // Tool pages
  prerenderToolPages(assets);
  total += TOOLS.length;

  // Static marketing pages
  prerenderStaticPages(assets);
  total += STATIC_PAGES.length;

  console.log(`✓ Prerendered ${total} page(s) for SEO`);
}
