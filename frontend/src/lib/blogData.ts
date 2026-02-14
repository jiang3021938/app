// Load all markdown blog posts from seo/content/ at build time
// Uses Vite's import.meta.glob with ?raw to get file contents as strings

const markdownFiles = import.meta.glob('/seo/content/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export interface BlogPostData {
  slug: string;
  title: string;
  description: string;
  keywords: string;
  lang: string;
  content: string; // raw markdown body (without frontmatter)
}

function parseFrontmatter(raw: string): { frontmatter: Record<string, string>; body: string } {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: raw };
  }

  const frontmatterText = match[1];
  const body = match[2];
  const frontmatter: Record<string, string> = {};

  frontmatterText.split('\n').forEach((line) => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      frontmatter[key] = value;
    }
  });

  return { frontmatter, body };
}

function extractSlug(filePath: string): string {
  // filePath looks like "/seo/content/california-security-deposit-law-2026.md"
  const parts = filePath.split('/');
  const filename = parts[parts.length - 1];
  return filename.replace(/\.md$/, '');
}

// Parse all markdown files into structured blog post data
export const blogPosts: BlogPostData[] = Object.entries(markdownFiles).map(
  ([filePath, raw]) => {
    const { frontmatter, body } = parseFrontmatter(raw);
    return {
      slug: extractSlug(filePath),
      title: frontmatter.title || extractSlug(filePath).replace(/-/g, ' '),
      description: frontmatter.description || '',
      keywords: frontmatter.keywords || '',
      lang: frontmatter.lang || 'en',
      content: body,
    };
  }
);

// Create a lookup map for quick access by slug
export const blogPostsBySlug: Record<string, BlogPostData> = {};
blogPosts.forEach((post) => {
  blogPostsBySlug[post.slug] = post;
});
