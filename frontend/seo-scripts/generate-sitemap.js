import fs from "fs";
import path from "path";
import { getPrerenderDirs } from "./prerender.js";

const baseUrl = "https://www.leaselenses.com";
const distDir = "./dist";
const outFile = "./dist/sitemap.xml";
const contentDir = "./seo/content";

function collectHtmlFiles(dir, basePath = "") {
  const results = [];

  if (!fs.existsSync(dir)) {
    return results;
  }

  const list = fs.readdirSync(dir);

  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);

    if (stat && stat.isDirectory()) {
      const subPath = path.join(basePath, file);
      results.push(...collectHtmlFiles(full, subPath));
    } else if (file.endsWith('.html')) {
      const relativePath = path.join(basePath, file).replace(/\\/g, '/');
      let url = `${baseUrl}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`;

      // If it's index.html, remove filename and keep directory path (ending with /)
      if (file === 'index.html') {
        url = url.replace(/\/index\.html$/, '/');
      }

      let lastmod = stat.mtime.toISOString();

      // Use markdown file's mtime for blog posts (HTML is regenerated each build)
      if (basePath.includes('/blog') && file === 'index.html') {
        const pathParts = relativePath.split('/');
        const slug = pathParts[pathParts.length - 2];

        if (slug && slug !== 'blog') {
          const mdPath = path.join(contentDir, `${slug}.md`);
          if (fs.existsSync(mdPath)) {
            const mdStat = fs.statSync(mdPath);
            lastmod = mdStat.mtime.toISOString();
          }
        }
      }

      results.push({ url, lastmod });
    }
  });

  return results;
}

// Collect all HTML files
const seen = new Set();
const urls = [];

function addUrl(entry) {
  if (!seen.has(entry.url)) {
    seen.add(entry.url);
    urls.push(entry);
  }
}

if (fs.existsSync(path.join(distDir, "index.html"))) {
  const stat = fs.statSync(path.join(distDir, "index.html"));
  addUrl({
    url: baseUrl,
    lastmod: stat.mtime.toISOString()
  });
}

// Collect HTML files in prerendered directories (derived from prerender.js)
// This includes blog, states, tools, and static marketing pages.
const prerenderDirs = getPrerenderDirs();
for (const dir of prerenderDirs) {
  const dirPath = path.join(distDir, dir);
  if (fs.existsSync(dirPath)) {
    const dirUrls = collectHtmlFiles(dirPath, `/${dir}`);
    dirUrls.forEach(addUrl);
  }
}

// Generate sitemap.xml
let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

urls.forEach(item => {
  xml += `  <url>\n`;
  xml += `    <loc>${item.url}</loc>\n`;
  xml += `    <lastmod>${item.lastmod}</lastmod>\n`;
  xml += `  </url>\n`;
});

xml += `</urlset>`;

fs.writeFileSync(outFile, xml, "utf-8");

console.log(`✓ sitemap.xml generated (${urls.length} URL(s))`);
